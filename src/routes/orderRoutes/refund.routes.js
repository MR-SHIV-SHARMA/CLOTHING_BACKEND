import express from "express";
import {
  createRefund,
  getAllRefunds,
  getRefundById,
  updateRefundById,
  deleteRefundById,
} from "../../controllers/orderController/refund.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new refund request
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Create A New Refund Request"),
  createRefund
);

// Get all refunds
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get All Refunds"),
  getAllRefunds
);

// Get a refund by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get Refund by ID"),
  getRefundById
);

// Update a refund by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Update Refund by ID"),
  updateRefundById
);

// Delete a refund by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Delete Refund by ID"),
  deleteRefundById
);

export default router;
