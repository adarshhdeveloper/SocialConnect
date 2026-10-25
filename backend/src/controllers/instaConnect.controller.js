import crypto from "node:crypto";
import axios from "axios";
import db from "../config/database.js";

export const getInstagramAccessToken = (req, res) => {
    const state = crypto.randomBytes(32).toString("hex");

    // Save state in session for callback verification
    req.session.oauthState = state;

    const params = new URLSearchParams({
        client_id: process.env.META_APP_ID,
        redirect_uri: process.env.META_REDIRECT_URI,
        response_type: "code",
        scope: "instagram_business_basic,instagram_business_content_publish",
        state,
    });

    const instagramLoginUrl =
        `https://www.instagram.com/oauth/authorize?${params.toString()}`;

    res.redirect(instagramLoginUrl);
}

export const handleInstagramCallback =  async (req, res) => {
    const {
        code,
        state,
        error
    } = req.query;

    if (error) {
        return res.status(400).send("Instagram authorization denied");
    }

    if (!code || !state) {
        return res.status(400).send("Missing code or state");
    }

    if (state !== req.session.oauthState) {
        return res.status(403).send("Invalid OAuth state");
    }

    delete req.session.oauthState;

    try {
        const params = new URLSearchParams({
            client_id: process.env.META_APP_ID,
            client_secret: process.env.META_APP_SECRET,
            grant_type: "authorization_code",
            redirect_uri: process.env.META_REDIRECT_URI,
            code: String(code),
        });

        const response = await axios.post(
            "https://api.instagram.com/oauth/access_token",
            params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        // Keep credentials on the server only
        const accessToken = response.data.access_token;
        const profileResponse = await axios.get(
            `https://graph.instagram.com/${process.env.META_API_VERSION}/me`, {
                params: {
                    fields: "user_id,username",
                    access_token: accessToken,
                },
            }
        );

        req.session.igAccessToken = accessToken;
        req.session.igUserId = profileResponse.data.user_id;
        req.session.igUsername = profileResponse.data.username;

        res.send("Instagram connected! Access token stored on server.");
    } catch (err) {
        console.error(
            "Instagram token exchange failed:",
            err.response?.data?.error_message || err.message
        );

        res.status(502).send(
            "Instagram token exchange failed. Check backend logs."
        );
    }
}

export const getInstagramProfile = async (req, res) => {
    const accessToken = req.session.igAccessToken;

    if (!accessToken) {
        return res.status(401).json({
            connected: false,
            message: "Connect Instagram first",
        });
    }

    try {
        const response = await axios.get(
            `https://graph.instagram.com/${process.env.META_API_VERSION}/me`, {
                params: {
                    fields: "user_id,username",
                    access_token: accessToken,
                },
            }
        );

        res.json({
            connected: true,
            igUserId: response.data.user_id,
            username: response.data.username,
        });
    } catch (err) {
        console.error(
            "Instagram profile request failed:",
            err.response?.data || err.message
        );

        res.status(502).json({
            connected: false,
            message: "Could not fetch Instagram profile",
        });
    }
}

export const createInstagramPost = async (req, res) => {
    const {
        imageUrl,
        caption
    } = req.body;

    if (!req.session.igAccessToken || !req.session.igUserId) {
        return res.status(401).json({
            status: "failed",
            error: "Connect Instagram first",
        });
    }

    if (
        typeof imageUrl !== "string" ||
        !imageUrl.startsWith("https://") ||
        typeof caption !== "string" ||
        !caption.trim()
    ) {
        return res.status(400).json({
            status: "failed",
            error: "A public HTTPS imageUrl and caption are required",
        });
    }

    if (caption.length > 2200) {
        return res.status(400).json({
            status: "failed",
            error: "Caption must be 2200 characters or fewer",
        });
    }

    let postId;

    try {
        const result = db.prepare(`
      INSERT INTO posts (image_url, caption, status)
      VALUES (?, ?, 'pending')
    `).run(imageUrl, caption);

        postId = result.lastInsertRowid;

        const baseUrl =
            `https://graph.instagram.com/${process.env.META_API_VERSION}`;

        const token = req.session.igAccessToken;
        const igUserId = req.session.igUserId;
        console.log("Publishing Instagram User ID:", igUserId);

        // Create the image media container
        const containerResponse = await axios.post(
            `${baseUrl}/${igUserId}/media`,
            new URLSearchParams({
                image_url: imageUrl,
                caption,
                access_token: token,
            })
        );

        const containerId = containerResponse.data.id;

        db.prepare(`
      UPDATE posts SET container_id = ? WHERE id = ?
    `).run(containerId, postId);

        // Publish the container
        const publishResponse = await axios.post(
            `${baseUrl}/${igUserId}/media_publish`,
            new URLSearchParams({
                creation_id: containerId,
                access_token: token,
            })
        );

        const mediaId = publishResponse.data.id;

        if (!mediaId) {
            throw new Error("Meta did not return a published media ID");
        }

        db.prepare(`
      UPDATE posts
      SET media_id = ?, status = 'published', error = NULL
      WHERE id = ?
    `).run(mediaId, postId);

        return res.status(201).json({
            status: "published",
            mediaId,
        });
    } catch (err) {
        const safeError =
            err.response?.data?.error?.message ||
            "Instagram publishing failed; check server logs";

        if (postId) {
            db.prepare(`
        UPDATE posts SET status = 'failed', error = ? WHERE id = ?
      `).run(safeError, postId);
        }

        console.error("Instagram publish failed:", safeError);

        return res.status(502).json({
            status: "failed",
            error: safeError,
        });
    }
}

export const getInstagramPosts = (req, res) => {
    try {
        const posts = db.prepare(`
            SELECT id, image_url, caption, container_id, media_id, status, error, created_at
            FROM posts
            ORDER BY created_at DESC
            LIMIT 10
        `).all();

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (err) {
        console.error("Failed to fetch posts from DB:", err.message);
        return res.status(500).json({
            success: false,
            error: "Could not retrieve posts from database",
        });
    }
}