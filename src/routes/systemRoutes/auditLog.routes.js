import express from "express";
import {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLogById,
  deleteMultipleAuditLogs,
  searchAuditLogs,
} from "../../controllers/systemController/auditLog.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new audit log
router.post("/", createAuditLog);

// Get all audit logs
router.get(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Get All Audit Logs"),
  getAllAuditLogs
);

// Get an audit log by ID
router.get(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Get An Audit Log By ID"),
  getAuditLogById
);

// Delete an audit log by ID
router.delete(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Delete An Audit Log By ID"),
  deleteAuditLogById
);

// Bulk delete audit logs
router.delete(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Delete Multiple Audit Logs"),
  deleteMultipleAuditLogs
);

// Search audit logs
router.get(
  "/search",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Search Audit Logs"),
  searchAuditLogs
);

export default router;
