import { Brand } from "../../Models/adminmodels/brand.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

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

export {
  getAllBrands,
  getBrandById,
};
