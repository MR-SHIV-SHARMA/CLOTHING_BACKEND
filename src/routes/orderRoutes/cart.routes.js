import express from "express";
import {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  checkout,
} from "../../controllers/orderController/cart.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Get cart by user ID
router.get(
  "/:userId",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Get Cart by User ID"),
  getCartByUserId
);

// Add item to cart
router.post(
  "/add",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Add Item to Cart"),
  addItemToCart
);

// Remove item from cart
router.delete(
  "/remove",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Remove Item from Cart"),
  removeItemFromCart
);

// Clear cart
router.delete(
  "/clear",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Clear Cart"),
  clearCart
);

// Increase item quantity
router.put(
  "/increase",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Increase Item Quantity"),
  increaseQuantity
);

// Decrease item quantity
router.put(
  "/decrease",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Decrease Item Quantity"),
  decreaseQuantity
);

// Checkout cart by user ID
router.post(
  "/checkout/:userId",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["customer"]),
  logAction("Checkout Cart"),
  checkout
);

export default router;
