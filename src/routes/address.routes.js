import express from "express";
import {
  createAddress,
  getAddressById,
  updateAddressById,
  deleteAddressById,
} from "../controllers/address.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.js";
import { logAction } from "../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new address
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Create Address"),
  createAddress
);

// Get an address by ID
router.get(
  "/address/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Get Address by ID"),
  getAddressById
);

// Update an address by ID
router.put(
  "/address/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Update Address by ID"),
  updateAddressById
);

// Delete an address by ID
router.delete(
  "/address/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "merchant", "customer"]),
  logAction("Delete Address by ID"),
  deleteAddressById
);

export default router;
