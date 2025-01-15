import { Brand } from "../models/brand.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new brand
const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, isActive } = req.body;

  // Validate required fields
  if (!name) {
    throw new apiError(400, "Brand name is required.");
  }

  // Create the brand
  const brand = await Brand.create({ name, logo, isActive });
  return res
    .status(201)
    .json(new apiResponse(201, brand, "Brand created successfully"));
});

// Get all brands
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  return res
    .status(200)
    .json(new apiResponse(200, brands, "Brands fetched successfully"));
});

// Get a brand by ID
const getBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new apiError(404, "Brand not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, brand, "Brand fetched successfully"));
});

// Update a brand by ID
const updateBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const brandData = req.body;

  // Validate required fields
  if (!brandData.name) {
    throw new apiError(400, "Brand name is required.");
  }

  const updatedBrand = await Brand.findByIdAndUpdate(id, brandData, {
    new: true,
  });
  if (!updatedBrand) {
    throw new apiError(404, "Brand not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedBrand, "Brand updated successfully"));
});

// Delete a brand by ID
const deleteBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBrand = await Brand.findByIdAndDelete(id);
  if (!deletedBrand) {
    throw new apiError(404, "Brand not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Brand deleted successfully"));
});

export {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
};
