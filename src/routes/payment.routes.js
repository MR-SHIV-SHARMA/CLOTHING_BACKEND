import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
  updateOrderPaymentStatus,
  createShipping,
  getOrderStatus,
  getUserOrders,
} from "../controllers/payment.controllers.js";

const router = express.Router();

// Create a new payment
router.post("/", createPayment);

// Get all payments
router.get("/", getAllPayments);

// Get a payment by ID
router.get("/:id", getPaymentById);

// Update a payment by ID
router.put("/:id", updatePaymentById);

// Delete a payment by ID
router.delete("/:id", deletePaymentById);

// Update the payment status of an order
router.put("/update-payment-status", updateOrderPaymentStatus);

// Create shipping details
router.post("/shipping", createShipping);

// Track order status
router.get("/order-status/:orderId", getOrderStatus);

// Get all orders by a user
router.get("/user-orders", getUserOrders);

export default router;
