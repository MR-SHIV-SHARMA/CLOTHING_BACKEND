import express from "express";
import {
  createShipping,
  getAllShippingRecords,
  getShippingById,
  updateShippingById,
  deleteShippingById,
} from "../controllers/shipping.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.js";
import { logAction } from "../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new shipping record
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Create Shipping Record"),
  checkRole("admin", "superadmin", "merchant", "customer"),
  createShipping
);

// Get all shipping records
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get All Shipping Records"),
  getAllShippingRecords
);

// Get a shipping record by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Get Shipping Record by ID"),
  getShippingById
);

// Update a shipping record by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Update Shipping Record by ID"),
  updateShippingById
);

// Delete a shipping record by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant", "customer"),
  logAction("Delete Shipping Record by ID"),
  deleteShippingById
);

export default router;
