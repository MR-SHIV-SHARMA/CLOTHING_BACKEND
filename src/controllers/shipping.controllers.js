import { Shipping } from "../Models/shipping.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new shipping record
const createShipping = asyncHandler(async (req, res) => {
  const { order, trackingNumber, carrier, estimatedDeliveryDate } = req.body;

  // Validate required fields
  if (!order) {
    throw new apiError(400, "Order ID is required.");
  }

  const shipping = await Shipping.create({
    order,
    trackingNumber,
    carrier,
    estimatedDeliveryDate,
  });

  return res
    .status(201)
    .json(
      new apiResponse(201, shipping, "Shipping record created successfully.")
    );
});

// Get all shipping records
const getAllShippingRecords = asyncHandler(async (req, res) => {
  const shippingRecords = await Shipping.find().populate("order");

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        shippingRecords,
        "Shipping records fetched successfully."
      )
    );
});

// Get a shipping record by ID
const getShippingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shipping = await Shipping.findById(id).populate("order");
  if (!shipping) {
    throw new apiError(404, "Shipping record not found.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, shipping, "Shipping record fetched successfully.")
    );
});

// Update a shipping record by ID
const updateShippingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const shippingData = req.body;

  const updatedShipping = await Shipping.findByIdAndUpdate(id, shippingData, {
    new: true,
  });

  if (!updatedShipping) {
    throw new apiError(404, "Shipping record not found.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedShipping,
        "Shipping record updated successfully."
      )
    );
});

// Delete a shipping record by ID
const deleteShippingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedShipping = await Shipping.findByIdAndDelete(id);
  if (!deletedShipping) {
    throw new apiError(404, "Shipping record not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Shipping record deleted successfully."));
});

export {
  createShipping,
  getAllShippingRecords,
  getShippingById,
  updateShippingById,
  deleteShippingById,
};
