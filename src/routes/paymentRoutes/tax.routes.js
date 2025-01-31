import express from "express";
import {
  getAllTaxes,
  createTax,
  getTax,
  updateTax,
  deleteTax,
} from "../../controllers/paymentController/tax.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Get all taxes
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Get All Taxes"),
  checkRole(["admin", "superadmin"]),
  getAllTaxes
);

// Create a new tax
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Create Tax"),
  checkRole(["admin", "superadmin"]),
  createTax
);

// Get a tax by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Get Tax by ID"),
  checkRole(["admin", "superadmin"]),
  getTax
);

// Update a tax by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Update Tax by ID"),
  checkRole(["admin", "superadmin"]),
  updateTax
);

// Delete a tax by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Delete Tax by ID"),
  checkRole(["admin", "superadmin"]),
  deleteTax
);

export default router;
