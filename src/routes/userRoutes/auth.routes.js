import express from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  refreshToken,
  resendVerificationEmail,
  validateResetToken,
  checkEmailAvailability,
  updateEmailSettings,
  deleteAccount,
  downloadUserData,
  requestAccountDeletion,
  cancelAccountDeletion
} from "../../controllers/userController/auth.controllers.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { userRateLimiter } from "../../middlewares/rateLimiter.js";

const router = express.Router();

/*
 * Authentication endpoints for regular users
 * These endpoints handle user registration, login, password management, and profile operations
 */

// Public routes
router.post("/register", userRateLimiter, register);
router.post("/login", userRateLimiter, login);
router.post("/forgot-password", userRateLimiter, forgotPassword);
router.post("/reset-password", userRateLimiter, resetPassword);
router.post("/verify-email", userRateLimiter, verifyEmail);
router.post("/resend-verification", userRateLimiter, resendVerificationEmail);
router.post("/validate-reset-token", userRateLimiter, validateResetToken);
router.post("/check-email-availability", userRateLimiter, checkEmailAvailability);
router.post("/refresh-token", userRateLimiter, refreshToken);

// Protected routes - require authentication
router.use(authMiddleware);

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);
router.post("/logout", logout);

// Two-factor authentication
router.post("/2fa/enable", enableTwoFactor);
router.post("/2fa/disable", disableTwoFactor);
router.post("/2fa/verify", verifyTwoFactor);

// Account management
router.put("/email-settings", updateEmailSettings);
router.get("/download-data", downloadUserData);
router.post("/request-deletion", requestAccountDeletion);
router.post("/cancel-deletion", cancelAccountDeletion);
router.delete("/delete-account", deleteAccount);

export default router;
