import express from "express";
import {
  createOrUpdateCart,
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// Create or update cart for a user
router.post("/", createOrUpdateCart);

// Get cart by user ID
router.get("/:userId", getCartByUserId);

// Add item to cart
router.post("/add", addItemToCart);

// Remove item from cart
router.delete("/remove", removeItemFromCart);

// Clear cart
router.delete("/clear", clearCart);

export default router;
