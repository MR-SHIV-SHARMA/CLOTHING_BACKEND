import { Banner } from "../../Models/adminModels/banner.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadFileToCloudinary } from "../../utils/cloudinary.js";

// Create a new banner
const createBanner = asyncHandler(async (req, res) => {
  const { title, link, isActive } = req.body;

  // Validate required fields
  if (!title) {
    throw new apiError(400, "Title is required.");
  }

  if (!req.files || !req.files.image || req.files.image.length === 0) {
    throw new apiError(400, "Image is required.");
  }

  // Extract the image file
  const imageFile = req.files.image[0];

  // Upload the image to Cloudinary
  const uploadedImage = await uploadFileToCloudinary(imageFile.path);

  if (!uploadedImage || !uploadedImage.url) {
    throw new apiError(500, "Error while uploading image to Cloudinary.");
  }

  // Create the banner
  const banner = await Banner.create({
    title,
    image: uploadedImage.url, // Use the uploaded image URL
    link,
    isActive: isActive || false,
  });

  return res
    .status(201)
    .json(new apiResponse(201, banner, "Banner created successfully"));
});

// Get all banners
const getAllBanners = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  // Fetch banners based on active status if provided
  const filter =
    isActive !== undefined ? { isActive: isActive === "true" } : {};
  const banners = await Banner.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new apiResponse(200, banners, "Banners fetched successfully"));
});

// Get a banner by ID
const getBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await Banner.findById(id);
  if (!banner) {
    throw new apiError(404, "Banner not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, banner, "Banner fetched successfully"));
});

// Update a banner by ID
const updateBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, link, isActive } = req.body;

  // Find the banner to ensure it exists
  const existingBanner = await Banner.findById(id);
  if (!existingBanner) {
    throw new apiError(404, "Banner not found");
  }

  // Validate title
  if (!title) {
    throw new apiError(400, "Title is required.");
  }

  let imageUrl = existingBanner.image; // Keep the existing image URL by default

  // If a new image file is provided, upload it to Cloudinary
  if (req.file) {
    const uploadedImage = await uploadFileToCloudinary(req.file.path);

    if (!uploadedImage || !uploadedImage.url) {
      throw new apiError(500, "Error while uploading image to Cloudinary.");
    }

    imageUrl = uploadedImage.url; // Use the new image URL
  }

  // Update the banner with new data
  const updatedBanner = await Banner.findByIdAndUpdate(
    id,
    {
      title,
      image: imageUrl,
      link,
      isActive,
    },
    { new: true } // Return the updated document
  );

  return res
    .status(200)
    .json(new apiResponse(200, updatedBanner, "Banner updated successfully"));
});

// Delete a banner by ID
const deleteBannerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBanner = await Banner.findByIdAndDelete(id);
  if (!deletedBanner) {
    throw new apiError(404, "Banner not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Banner deleted successfully"));
});

// Activate or deactivate a banner by ID
const toggleBannerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the banner to ensure it exists
  const existingBanner = await Banner.findById(id);
  if (!existingBanner) {
    throw new apiError(404, "Banner not found");
  }

  // Toggle the isActive status
  const newStatus = !existingBanner.isActive;

  // Update the banner's status
  const updatedBanner = await Banner.findByIdAndUpdate(
    id,
    { isActive: newStatus },
    { new: true } // Return the updated document
  );

  const message = newStatus
    ? "Banner activated successfully"
    : "Banner deactivated successfully";

  return res.status(200).json(new apiResponse(200, updatedBanner, message));
});

// Delete multiple banners by IDs
const deleteMultipleBanners = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new apiError(400, "Please provide an array of banner IDs.");
  }

  const result = await Banner.deleteMany({ _id: { $in: ids } });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { deletedCount: result.deletedCount },
        "Banners deleted successfully"
      )
    );
});

export {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBannerById,
  deleteBannerById,
  toggleBannerStatus,
  deleteMultipleBanners,
};
