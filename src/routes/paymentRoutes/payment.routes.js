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
} from "../../controllers/paymentController/payment.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new payment
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Create A New Payment"),
  createPayment
);

// Status callback endpoint
// router.get(
//   "/status",
//   authenticateAdmin,
//   adminRateLimiter,
//   checkRole("admin", "superadmin", "merchant", "customer"),
//   logAction("Payment Status"),
//   paymentStatus
// );

// router.post(
//   "/status",
//   authenticateAdmin,
//   adminRateLimiter,
//   checkRole("admin", "superadmin", "merchant", "customer"),
//   logAction("Payment Status"),
//   paymentStatus
// );

// router
//   .route("/status")
//   .get(authenticateAdmin, paymentStatus)
//   .post(authenticateAdmin, paymentStatus); // Fallback for POST requests

router.route("/status").get(paymentStatus).post(paymentStatus); // Fallback for POST requests

// Get all payments
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get All Payment"),
  getAllPayments
);

// Get a payment by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get Payment by ID"),
  getPaymentById
);

// Update a payment by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Update Payment by ID"),
  updatePaymentById
);

// Delete a payment by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Delete Payment by ID"),
  deletePaymentById
);

// Update the payment status of an order to confirm payment
router.put(
  "/order/payment-status",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Update Order Payment by ID"),
  updateOrderPaymentStatus
);

// Update the payment status of a payment (not order) to confirm payment
router.put(
  "/payment/status",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Update Payment Status by ID"),
  updatePaymentStatus
);

// Create shipping details
router.post(
  "/shipping",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Create Shipping Details"),
  createShipping
);

// Track order status
router.get(
  "/order-status/:orderId",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Track Order Status"),
  getOrderStatus
);

// Get all orders by a user
router.get(
  "/user/orders",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get All Orders by User"),
  getUserOrders
);

export default router;
