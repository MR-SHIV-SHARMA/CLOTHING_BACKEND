import { Coupon } from "../Models/coupon.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

export {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
};
