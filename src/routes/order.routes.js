import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

// Create a new order
router.post("/", createOrder);

// Get all orders
router.get("/", getAllOrders);

// Get a single order by ID
router.get("/:id", getOrderById);

// Update an order by ID
router.put("/:id", updateOrderById);

// Delete an order by ID
router.delete("/:id", deleteOrderById);

export default router;
