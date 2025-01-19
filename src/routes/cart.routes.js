import express from "express";
import {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearCart,
} from "../controllers/cart.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get cart by user ID
router.get("/:userId", authenticateAdmin, getCartByUserId);

// Add item to cart
router.post("/add", authenticateAdmin, addItemToCart);

// Remove item from cart
router.delete("/remove", authenticateAdmin, removeItemFromCart);

// Clear cart
router.delete("/clear", authenticateAdmin, clearCart);

export default router;
