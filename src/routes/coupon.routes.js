import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
} from "../controllers/coupon.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.js";
import { logAction } from "../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new coupon
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant"),
  logAction("Create Coupon"),
  createCoupon
);

// Get all coupons
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin"),
  logAction("Get All Coupon"),
  getAllCoupons
);

// Get a coupon by ID
router.get("/:id", getCouponById);

// Update a coupon by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant"),
  logAction("Update A Coupon By Id"),
  updateCouponById
);

// Delete a coupon by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole("admin", "superadmin", "merchant"),
  logAction("Delete A Coupon By Id"),
  deleteCouponById
);

export default router;
