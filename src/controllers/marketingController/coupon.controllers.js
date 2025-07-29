import { Coupon } from "../../Models/marketingModels/coupon.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new coupon
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate } = req.body;

  // Validate required fields
  if (!code || !discountType || discountValue === undefined || !expiryDate) {
    throw new apiError(400, "Please provide all required fields.");
  }

  // Create the coupon
  const coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscount,
    expiryDate,
  });

  return res.status(201).json(new apiResponse(201, coupon, "Coupon created successfully"));
});

// Get all coupons
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  return res.status(200).json(new apiResponse(200, coupons, "Coupons fetched successfully"));
});

// Get a coupon by ID
const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new apiError(404, "Coupon not found");
  }
  return res.status(200).json(new apiResponse(200, coupon, "Coupon fetched successfully"));
});

// Update a coupon by ID
const updateCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const couponData = req.body;

  const updatedCoupon = await Coupon.findByIdAndUpdate(id, couponData, { new: true });
  if (!updatedCoupon) {
    throw new apiError(404, "Coupon not found");
  }

  return res.status(200).json(new apiResponse(200, updatedCoupon, "Coupon updated successfully"));
});

// Delete a coupon by ID
const deleteCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedCoupon = await Coupon.findByIdAndDelete(id);
  if (!deletedCoupon) {
    throw new apiError(404, "Coupon not found");
  }
  return res.status(200).json(new apiResponse(200, {}, "Coupon deleted successfully"));
});

// Validate a coupon code
/**
 * Expected POST data:
 * {
 *   "code": "SAVE20",
 *   "orderValue": 100,
 *   "customerId": "userId" (optional)
 * }
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue, customerId } = req.body;

  if (!code || !orderValue) {
    throw new apiError(400, "Coupon code and order value are required");
  }

  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    throw new apiError(404, "Invalid coupon code");
  }

  // Check if coupon is expired
  if (new Date() > new Date(coupon.expiryDate)) {
    throw new apiError(400, "Coupon has expired");
  }

  // Check if coupon is active
  if (!coupon.isActive) {
    throw new apiError(400, "Coupon is not active");
  }

  // Check minimum order value
  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    throw new apiError(400, `Minimum order value of ${coupon.minOrderValue} required`);
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new apiError(400, "Coupon usage limit exceeded");
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, orderValue);
  }

  return res.status(200).json(new apiResponse(200, {
    valid: true,
    coupon: {
      id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      maxDiscount: coupon.maxDiscount
    }
  }, "Coupon is valid"));
});

// Apply a coupon to an order
/**
 * Expected POST data:
 * {
 *   "code": "SAVE20",
 *   "orderId": "orderIdString",
 *   "orderValue": 100,
 *   "customerId": "userId"
 * }
 */
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderId, orderValue, customerId } = req.body;

  if (!code || !orderId || !orderValue) {
    throw new apiError(400, "Code, order ID, and order value are required");
  }

  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    throw new apiError(404, "Invalid coupon code");
  }

  // Validate coupon (reuse validation logic)
  if (new Date() > new Date(coupon.expiryDate)) {
    throw new apiError(400, "Coupon has expired");
  }

  if (!coupon.isActive) {
    throw new apiError(400, "Coupon is not active");
  }

  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    throw new apiError(400, `Minimum order value of ${coupon.minOrderValue} required`);
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new apiError(400, "Coupon usage limit exceeded");
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, orderValue);
  }

  // Update coupon usage count
  await Coupon.findByIdAndUpdate(coupon._id, {
    $inc: { usedCount: 1 },
    $push: {
      usageHistory: {
        orderId,
        customerId,
        discountAmount,
        usedAt: new Date()
      }
    }
  });

  return res.status(200).json(new apiResponse(200, {
    applied: true,
    discountAmount,
    finalAmount: orderValue - discountAmount,
    coupon: {
      id: coupon._id,
      code: coupon.code
    }
  }, "Coupon applied successfully"));
});

export {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
  validateCoupon,
  applyCoupon,
};
