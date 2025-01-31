import express from "express";
import {
  createAnalytics,
  getAllAnalytics,
  getAnalyticsById,
  deleteAnalyticsById,
  updateAnalyticsById,
} from "../../controllers/systemController/analytics.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new analytics record
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Create A New Analytics Record"),
  createAnalytics
);

// Get all analytics records
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Get All Analytics Records"),
  getAllAnalytics
);

// Get an analytics record by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Get Analytics Record by ID"),
  getAnalyticsById
);

// Delete an analytics record by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Delete Analytics Record by ID"),
  deleteAnalyticsById
);

// Update an analytics record by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Update Analytics Record by ID"),
  updateAnalyticsById
);

export default router;
