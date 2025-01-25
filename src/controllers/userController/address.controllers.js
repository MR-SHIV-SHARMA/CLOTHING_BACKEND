import { apiError } from "../../utils/apiError.js";
import { Address } from "../../Models/userModels/address.models.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new address
const createAddress = asyncHandler(async (req, res) => {
  const { fullName, addressLine, city, state, postalCode, country, phone } =
    req.body;

  // Extract the authenticated user ID
  const user = req.user?._id;
  if (!user) {
    throw new apiError(401, "User authentication is required.");
  }

  // Validate required fields
  if (
    !fullName ||
    !addressLine ||
    !city ||
    !state ||
    !postalCode ||
    !country ||
    !phone
  ) {
    throw new apiError(400, "All fields are required.");
  }

  // Create the address with the correct user field
  const address = await Address.create({
    user, // Set the authenticated user's ID
    fullName, // Use fullName from req.body
    addressLine,
    city,
    state,
    postalCode,
    country,
    phone,
  });

  return res
    .status(201)
    .json(new apiResponse(201, address, "Address created successfully"));
});

// Get an address by ID
const getAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await Address.findById(id).populate("fullName phone");
  if (!address) {
    throw new apiError(404, "Address not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, address, "Address fetched successfully"));
});

// Update an address by ID
const updateAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const addressData = req.body;

  // Ensure user is authenticated
  const user = req.user?._id;
  if (!user) {
    throw new apiError(401, "User authentication is required.");
  }

  // Update the address
  const updatedAddress = await Address.findByIdAndUpdate(id, addressData, {
    new: true,
  }).populate("fullName phone");
  if (!updatedAddress) {
    throw new apiError(404, "Address not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedAddress, "Address updated successfully"));
});

// Delete an address by ID
const deleteAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAddress = await Address.findByIdAndDelete(id);
  if (!deletedAddress) {
    throw new apiError(404, "Address not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Address deleted successfully"));
});

export { createAddress, getAddressById, updateAddressById, deleteAddressById };
