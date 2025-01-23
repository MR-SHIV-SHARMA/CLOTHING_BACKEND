import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.js";
import { logAction } from "../middlewares/auditLogMiddleware.js";

const router = Router();

// Register and login user. No authentication middleware is required for these endpoints.
router
  .route("/register")
  .post(
    adminRateLimiter,
    logAction("Register User"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    registerUser
  );

// Login user. No authentication middleware is required for this endpoint.
router
  .route("/login")
  .post(
    adminRateLimiter,
    logAction("Login User"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    loginUser
  );

// Logout user and refresh access token. Authenticate admin middleware is required for these endpoints.
// Note: This endpoint is not required for API clients, but for administrative tasks.
router
  .route("/logout")
  .post(
    authenticateAdmin,
    adminRateLimiter,
    logAction("Logout User"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    logoutUser
  );

// Refresh access token. Authenticate admin middleware is required for this endpoint.
router
  .route("/refresh-token")
  .post(
    authenticateAdmin,
    adminRateLimiter,
    logAction("Refresh Access Token"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    refreshAccessToken
  );

// Change password, get current user, update account details, and update user avatar. Authenticate admin middleware is required for these endpoints.
router
  .route("/change-password")
  .post(
    authenticateAdmin,
    adminRateLimiter,
    logAction("Change Password"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    changeCurrentPassword
  );

// Get current user details. Authenticate admin middleware is required for this endpoint.
router
  .route("/current-user")
  .post(
    authenticateAdmin,
    adminRateLimiter,
    logAction("Get Current User"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    getCurrentUser
  );

// Update account details. Authenticate admin middleware is required for this endpoint.
router
  .route("/update-account-details")
  .patch(
    authenticateAdmin,
    adminRateLimiter,
    logAction("Update Account Details"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    updateAccountDetails
  );

// Update user avatar. Authenticate admin middleware is required for this endpoint.
router
  .route("/update-user-avatar")
  .patch(
    authenticateAdmin,
    upload.single("avatar"),
    adminRateLimiter,
    logAction("Update User Avatar"),
    checkRole("admin", "superadmin", "merchant", "customer"),
    updateUserAvatar
  );

export default router;
