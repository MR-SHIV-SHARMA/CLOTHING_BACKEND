import { Router } from "express";
import {
  googleLogin,
  facebookLogin,
  linkGoogleAccount,
  linkFacebookAccount,
  unlinkSocialAccount,
  getConnectedAccounts,
} from "../../controllers/userController/oauth.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";

const router = Router();

// Public OAuth login routes (no authentication required)
/**
 * @route   POST /api/v1/oauth/google/login
 * @desc    Login/Register with Google OAuth
 * @access  Public
 */
router.route("/google/login").post(googleLogin);

/**
 * @route   POST /api/v1/oauth/facebook/login
 * @desc    Login/Register with Facebook OAuth
 * @access  Public
 */
router.route("/facebook/login").post(facebookLogin);

// Protected routes - require authentication
router.use(verifyJWT);

/**
 * @route   GET /api/v1/oauth/connected
 * @desc    Get user's connected social accounts
 * @access  Authenticated users
 */
router.route("/connected").get(getConnectedAccounts);

/**
 * @route   POST /api/v1/oauth/google/link
 * @desc    Link Google account to existing user
 * @access  Authenticated users
 */
router.route("/google/link").post(linkGoogleAccount);

/**
 * @route   POST /api/v1/oauth/facebook/link
 * @desc    Link Facebook account to existing user
 * @access  Authenticated users
 */
router.route("/facebook/link").post(linkFacebookAccount);

/**
 * @route   DELETE /api/v1/oauth/:provider/unlink
 * @desc    Unlink social media account
 * @access  Authenticated users
 */
router.route("/:provider/unlink").delete(unlinkSocialAccount);

export default router;
