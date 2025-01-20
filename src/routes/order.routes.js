import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
} from "../controllers/order.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new order
router.post("/", authenticateAdmin, createOrder);

// Get all orders
router.get("/", authenticateAdmin, getAllOrders);

// Get a single order by ID
router.get("/:id", authenticateAdmin, getOrderById);

// Update an order by ID
router.put("/:id", authenticateAdmin, updateOrderById);

// Delete an order by ID
router.delete("/:id", authenticateAdmin, deleteOrderById);

export default router;
