import { apiError } from "../utils/apiError.js";
import { Address } from "../models/address.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new address
const createAddress = asyncHandler(async (req, res) => {
  const { user, fullName, addressLine, city, state, postalCode, country, phone } = req.body;

  // Validate required fields
  if (!user || !fullName || !addressLine || !city || !state || !postalCode || !country || !phone) {
    throw new apiError(400, "All fields are required.");
  }

  // Create the address
  const address = await Address.create(req.body);
  return res.status(201).json(new apiResponse(201, address, "Address created successfully"));
});

// Get all addresses for a user
const getAllAddresses = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const addresses = await Address.find({ user: userId }).exec();
  return res.status(200).json(new apiResponse(200, addresses, "Addresses fetched successfully"));
});

// Get an address by ID
const getAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await Address.findById(id);
  if (!address) {
    throw new apiError(404, "Address not found");
  }
  return res.status(200).json(new apiResponse(200, address, "Address fetched successfully"));
});

// Update an address by ID
const updateAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const addressData = req.body;

  const updatedAddress = await Address.findByIdAndUpdate(id, addressData, { new: true });
  if (!updatedAddress) {
    throw new apiError(404, "Address not found");
  }
  return res.status(200).json(new apiResponse(200, updatedAddress, "Address updated successfully"));
});

// Delete an address by ID
const deleteAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAddress = await Address.findByIdAndDelete(id);
  if (!deletedAddress) {
    throw new apiError(404, "Address not found");
  }
  return res.status(200).json(new apiResponse(200, {}, "Address deleted successfully"));
});

export {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddressById,
  deleteAddressById,
};
