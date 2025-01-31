import express from "express";
import {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../../controllers/vendorController/vendor.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Get all vendors"),
  getAllVendors
);

router.get(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Get vendor by ID"),
  getVendorById
);

router.post(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Create vendor"),
  createVendor
);

router.put(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Update vendor by ID"),
  updateVendor
);

router.delete(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  adminRateLimiter,
  logAction("Delete vendor by ID"),
  deleteVendor
);

export default router;
