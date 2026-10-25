import {Router} from "express";
import {getInstagramAccessToken, handleInstagramCallback , getInstagramProfile,createInstagramPost, getInstagramPosts} from "../controllers/instaConnect.controller.js";

const router = Router();

/**
 * @route GET /api/instagram/connect
 * @desc Redirects the user to Instagram's OAuth authorization page
 * @access Public
 */
router.get("/connect", getInstagramAccessToken);

/**
 * @route GET /api/instagram/callback
 * @desc Handles the callback from Instagram after user authorization
 * @access Public 
 */
router.get("/callback",handleInstagramCallback);

/**
 * @route GET /api/instagram/me
 * @desc Fetches the connected Instagram user's profile information
 * @access Public (but requires prior connection)
 */
router.get("/me", getInstagramProfile);

/**
 * @route POST /api/instagram/posts
 * @desc Creates and publishes a post to the connected Instagram account
 * @access Public (but requires prior connection) 
 */
router.post("/posts", createInstagramPost);

/**
 * @route GET /api/instagram/posts
 * @desc Returns the latest 10 posts from SQLite history
 * @access Public
 */
router.get("/posts", getInstagramPosts);



export default router;