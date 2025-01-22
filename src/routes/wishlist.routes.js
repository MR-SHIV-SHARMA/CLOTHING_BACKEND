import express from "express";
import {
  createOrUpdateWishlist,
  getWishlistByUserId,
  removeProductFromWishlist,
} from "../controllers/wishlist.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create or update wishlist for a user
router.post("/:productId", authenticateAdmin, createOrUpdateWishlist);

// Get wishlist for a user
router.get("/:userId", authenticateAdmin, getWishlistByUserId);

// Remove product from wishlist
router.delete("/:productId", authenticateAdmin, removeProductFromWishlist);

export default router;
