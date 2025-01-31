import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
} from "../../controllers/orderController/order.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new order
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Create Order"),
  createOrder
);

// Get all orders
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Get All Orders"),
  getAllOrders
);

// Get a single order by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Get Order by ID"),
  getOrderById
);

// Update an order by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Update Order by ID"),
  updateOrderById
);

// Delete an order by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Delete Order by ID"),
  deleteOrderById
);

export default router;
