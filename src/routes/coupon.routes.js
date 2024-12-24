import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Create a new coupon
router.post("/", createCoupon);

// Get all coupons
router.get("/", getAllCoupons);

// Get a coupon by ID
router.get("/:id", getCouponById);

// Update a coupon by ID
router.put("/:id", updateCouponById);

// Delete a coupon by ID
router.delete("/:id", deleteCouponById);

export default router;
