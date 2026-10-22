
import { Router } from "express";
import crypto from "node:crypto";
import axios from "axios";

const router = Router();


/**
 * @route GET /api/instagram/connect
 * @desc Redirects the user to Instagram's OAuth authorization page
 * @access Public
 */
router.get("/connect", (req, res) => {
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
});

/**
 * @route GET /api/instagram/callback
 * @desc Handles the callback from Instagram after user authorization
 * @access Public 
 */
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;

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
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Keep credentials on the server only
    req.session.igAccessToken = response.data.access_token;
    req.session.igUserId = response.data.user_id;

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
});


export default router;
