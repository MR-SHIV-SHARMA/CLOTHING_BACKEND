import express from "express";
import {
  createPayment,
  paymentStatus,
  getAllPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
  updateOrderPaymentStatus,
  updatePaymentStatus,
  createShipping,
  getOrderStatus,
  getUserOrders,
} from "../controllers/payment.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new payment
router.post("/", authenticateAdmin, createPayment);

// Status callback endpoint
// router.get("/status", authenticateAdmin, paymentStatus);
// router
//   .route("/status")
//   .get(authenticateAdmin, paymentStatus)
//   .post(authenticateAdmin, paymentStatus); // Fallback for POST requests

router.route("/status").get(paymentStatus).post(paymentStatus); // Fallback for POST requests

// Get all payments
router.get("/", authenticateAdmin, getAllPayments);

// Get a payment by ID
router.get("/:id", authenticateAdmin, getPaymentById);

// Update a payment by ID
router.put("/:id", authenticateAdmin, updatePaymentById);

// Delete a payment by ID
router.delete("/:id", authenticateAdmin, deletePaymentById);

// Update the payment status of an order to confirm payment
router.put(
  "/order/payment-status",
  authenticateAdmin,
  updateOrderPaymentStatus
);

// Update the payment status of a payment (not order) to confirm payment
router.put("/payment/status", authenticateAdmin, updatePaymentStatus);

// Create shipping details
router.post("/shipping", authenticateAdmin, createShipping);

// Track order status
router.get("/order-status/:orderId", authenticateAdmin, getOrderStatus);

// Get all orders by a user
router.get("/user/orders", authenticateAdmin, getUserOrders);

export default router;
