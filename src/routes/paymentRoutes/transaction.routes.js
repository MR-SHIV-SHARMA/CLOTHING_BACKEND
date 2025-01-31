import express from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
} from "../../controllers/paymentController/transaction.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new transaction
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  logAction("create transaction"),
  createTransaction
);

// Get all transactions
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  logAction("get all transactions"),
  getAllTransactions
);

// Get a single transaction by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  logAction("get transaction by id"),
  getTransactionById
);

// Update a transaction by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  logAction("update transaction by id"),
  updateTransactionById
);

// Delete a transaction by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  logAction("delete transaction by id"),
  deleteTransactionById
);

export default router;
