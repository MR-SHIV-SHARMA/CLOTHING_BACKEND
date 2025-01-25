import { Review } from "../../Models/catalogModels/review.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../Models/userModels/user.models.js";

// Create a new review
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body;

  // Validate required fields
  if (!product || !rating) {
    throw new apiError(400, "Product, and rating are required.");
  }
  const userId = req.admin._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(400, "User ID is required.");
  }

  // Create the review
  const review = await Review.create({
    user,
    product,
    rating,
    comment,
  });

  return res
    .status(201)
    .json(new apiResponse(201, review, "Review created successfully."));
});

// Get all reviews for a product
const getReviewsByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId }).populate(
    "user",
    "name"
  );

  return res
    .status(200)
    .json(new apiResponse(200, reviews, "Reviews fetched successfully."));
});

// Get a review by ID
const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id).populate("user", "name");
  if (!review) {
    throw new apiError(404, "Review not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, review, "Review fetched successfully."));
});

// Update a review by ID
const updateReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating && !comment) {
    throw new apiError(400, "Rating or comment must be provided for update.");
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { rating, comment },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(200, updatedReview, "Review updated successfully."));
});

// Delete a review by ID
const deleteReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedReview = await Review.findByIdAndDelete(id);
  if (!deletedReview) {
    throw new apiError(404, "Review not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Review deleted successfully."));
});

export {
  createReview,
  getReviewsByProductId,
  getReviewById,
  updateReviewById,
  deleteReviewById,
};
