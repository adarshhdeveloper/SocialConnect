
import { Router } from "express";
import crypto from "node:crypto";

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


export default router;
