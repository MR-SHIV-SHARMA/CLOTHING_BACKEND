import { Banner } from "../models/banner.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new banner
const createBanner = asyncHandler(async (req, res) => {
  const { title, image, link, isActive } = req.body;

  // Validate required fields
  if (!title || !image) {
    throw new apiError(400, "Title and image are required.");
  }

  // Create the banner
  const banner = await Banner.create({ title, image, link, isActive });
  return res.status(201).json(new apiResponse(201, banner, "Banner created successfully"));
});

// Get all banners
const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  return res.status(200).json(new apiResponse(200, banners, "Banners fetched successfully"));
});

// Get a banner by ID
const getBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);
  if (!banner) {
    throw new apiError(404, "Banner not found");
  }
  return res.status(200).json(new apiResponse(200, banner, "Banner fetched successfully"));
});

// Update a banner by ID
const updateBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const bannerData = req.body;

  // Validate required fields
  if (!bannerData.title || !bannerData.image) {
    throw new apiError(400, "Title and image are required.");
  }

  const updatedBanner = await Banner.findByIdAndUpdate(id, bannerData, { new: true });
  if (!updatedBanner) {
    throw new apiError(404, "Banner not found");
  }
  return res.status(200).json(new apiResponse(200, updatedBanner, "Banner updated successfully"));
});

// Delete a banner by ID
const deleteBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBanner = await Banner.findByIdAndDelete(id);
  if (!deletedBanner) {
    throw new apiError(404, "Banner not found");
  }
  return res.status(200).json(new apiResponse(200, {}, "Banner deleted successfully"));
});

export {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBannerById,
  deleteBannerById,
};
