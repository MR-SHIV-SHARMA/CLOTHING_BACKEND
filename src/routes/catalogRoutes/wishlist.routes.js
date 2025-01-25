import express from "express";
import {
  createOrUpdateWishlist,
  getWishlistByUserId,
  removeProductFromWishlist,
} from "../../controllers/catalogController/wishlist.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create or update wishlist for a user
router.post(
  "/:productId",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Wishlist created or updated"),
  checkRole("admin", "superadmin", "merchant", "customer"),
  createOrUpdateWishlist
);

// Get wishlist for a user
router.get(
  "/:userId",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Get wishlist by user ID"),
  checkRole("admin", "superadmin", "merchant", "customer"),
  getWishlistByUserId
);

// Remove product from wishlist
router.delete(
  "/:productId",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Remove product from wishlist"),
  checkRole("admin", "superadmin", "merchant", "customer"),
  removeProductFromWishlist
);

export default router;
