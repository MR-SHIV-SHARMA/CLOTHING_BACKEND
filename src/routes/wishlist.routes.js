import express from "express";
import {
  createOrUpdateWishlist,
  getWishlistByUserId,
  removeProductFromWishlist,
} from "../controllers/wishlist.controllers.js";

const router = express.Router();

// Create or update wishlist for a user
router.post("/:productId", createOrUpdateWishlist);

// Get wishlist for a user
router.get("/:userId", getWishlistByUserId);

// Remove product from wishlist
router.delete("/:productId", removeProductFromWishlist);

export default router;
