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

        // 1. Initial Short-Lived Access Token (1 hr validity)
        const shortLivedToken = response.data.access_token;

        // 2. Exchange for Long-Lived Access Token (60 days validity)
        let accessToken = shortLivedToken;
        let expiresInSeconds = 60 * 24 * 60 * 60; // default 60 days fallback

        try {
            const longLivedRes = await axios.get(
                "https://graph.instagram.com/access_token",
                {
                    params: {
                        grant_type: "ig_exchange_token",
                        client_secret: process.env.META_APP_SECRET,
                        access_token: shortLivedToken,
                    },
                }
            );
            if (longLivedRes.data?.access_token) {
                accessToken = longLivedRes.data.access_token;
                expiresInSeconds = longLivedRes.data.expires_in || expiresInSeconds;
            }
        } catch (exchangeErr) {
            console.warn(
                "Long-lived token exchange warning (using short-lived as fallback):",
                exchangeErr.response?.data || exchangeErr.message
            );
        }

        // 3. Fetch user profile
        const profileResponse = await axios.get(
            `https://graph.instagram.com/${process.env.META_API_VERSION}/me`, {
                params: {
                    fields: "user_id,username",
                    access_token: accessToken,
                },
            }
        );

        const igUserId = profileResponse.data.user_id;
        const igUsername = profileResponse.data.username;
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

        // 4. Save/Update account & token in SQLite Database
        db.prepare(`
            INSERT INTO instagram_accounts (ig_user_id, username, access_token, token_expires_at, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(ig_user_id) DO UPDATE SET
                username = excluded.username,
                access_token = excluded.access_token,
                token_expires_at = excluded.token_expires_at,
                updated_at = CURRENT_TIMESTAMP
        `).run(igUserId, igUsername, accessToken, expiresAt);

        // Keep session for fast lookup
        req.session.igAccessToken = accessToken;
        req.session.igUserId = igUserId;
        req.session.igUsername = igUsername;

        res.send("Instagram connected successfully! Token and account saved permanently in database.");
    } catch (err) {
        // Log full Instagram error response for debugging
        console.error("=== Instagram Token Exchange Failed ===");
        console.error("Status:", err.response?.status);
        console.error("Full Error:", JSON.stringify(err.response?.data, null, 2));
        console.error("Message:", err.message);
        console.error("redirect_uri used:", process.env.META_REDIRECT_URI);
        console.error("=======================================");

        res.status(502).send(
            "Instagram token exchange failed. Check backend logs."
        );
    }
}

export const getInstagramProfile = async (req, res) => {
    // 1. Check session first, if missing check database
    let accessToken = req.session.igAccessToken;
    let igUserId = req.session.igUserId;

    if (!accessToken) {
        const account = db.prepare(`
            SELECT ig_user_id, username, access_token 
            FROM instagram_accounts 
            ORDER BY updated_at DESC LIMIT 1
        `).get();

        if (account) {
            accessToken = account.access_token;
            igUserId = account.ig_user_id;
            req.session.igAccessToken = accessToken;
            req.session.igUserId = igUserId;
            req.session.igUsername = account.username;
        }
    }

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

    // Fallback to database if session expired or lost after restart
    let token = req.session.igAccessToken;
    let igUserId = req.session.igUserId;

    if (!token || !igUserId) {
        const account = db.prepare(`
            SELECT ig_user_id, username, access_token 
            FROM instagram_accounts 
            ORDER BY updated_at DESC LIMIT 1
        `).get();

        if (account) {
            token = account.access_token;
            igUserId = account.ig_user_id;
            req.session.igAccessToken = token;
            req.session.igUserId = igUserId;
            req.session.igUsername = account.username;
        }
    }

    if (!token || !igUserId) {
        return res.status(401).json({
            status: "failed",
            error: "Connect Instagram first (No active account found)",
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
      INSERT INTO posts (ig_user_id, image_url, caption, status)
      VALUES (?, ?, ?, 'pending')
    `).run(igUserId, imageUrl, caption);

        postId = result.lastInsertRowid;

        const baseUrl =
            `https://graph.instagram.com/${process.env.META_API_VERSION}`;

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

        // Wait for Instagram to finish processing the image
        let statusCode = "IN_PROGRESS";
        let attempts = 0;
        const maxAttempts = 10;

        while (statusCode === "IN_PROGRESS" && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 sec
            const statusRes = await axios.get(`${baseUrl}/${containerId}`, {
                params: {
                    fields: "status_code",
                    access_token: token,
                },
            });
            statusCode = statusRes.data.status_code;
            attempts++;
            console.log(`Container status (attempt ${attempts}): ${statusCode}`);
        }

        if (statusCode !== "FINISHED") {
            throw new Error(`Container not ready. Final status: ${statusCode}`);
        }

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

        // Detailed log to identify exact failure
        console.error("=== Instagram Post Failed ===");
        console.error("Step failed at:", err.config?.url);
        console.error("Status:", err.response?.status);
        console.error("Full Error:", JSON.stringify(err.response?.data, null, 2));
        console.error("igUserId in session:", req.session.igUserId);
        console.error("============================");

        if (postId) {
            db.prepare(`
        UPDATE posts SET status = 'failed', error = ? WHERE id = ?
      `).run(safeError, postId);
        }

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