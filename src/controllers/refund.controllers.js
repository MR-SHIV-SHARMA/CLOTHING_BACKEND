import { Refund } from "../models/refund.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new refund request
const createRefund = asyncHandler(async (req, res) => {
  const { order, reason, refundAmount } = req.body;

  // Validate required fields
  if (!order || !reason) {
    throw new apiError(400, "Order and reason are required.");
  }

  // Create the refund
  const refund = await Refund.create({
    order,
    reason,
    refundAmount,
  });

  return res
    .status(201)
    .json(new apiResponse(201, refund, "Refund request created successfully."));
});

// Get all refunds
const getAllRefunds = asyncHandler(async (req, res) => {
  const refunds = await Refund.find().populate("order");

  return res
    .status(200)
    .json(new apiResponse(200, refunds, "Refunds fetched successfully."));
});

// Get a refund by ID
const getRefundById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const refund = await Refund.findById(id).populate("order");
  if (!refund) {
    throw new apiError(404, "Refund not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, refund, "Refund fetched successfully."));
});

// Update a refund by ID
const updateRefundById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const refundData = req.body;

  const updatedRefund = await Refund.findByIdAndUpdate(id, refundData, { new: true });
  
  if (!updatedRefund) {
    throw new apiError(404, "Refund not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedRefund, "Refund updated successfully."));
});

// Delete a refund by ID
const deleteRefundById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedRefund = await Refund.findByIdAndDelete(id);
  if (!deletedRefund) {
    throw new apiError(404, "Refund not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Refund deleted successfully."));
});

export {
  createRefund,
  getAllRefunds,
  getRefundById,
  updateRefundById,
  deleteRefundById,
};
