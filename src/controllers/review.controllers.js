import { Review } from "../models/review.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new review
const createReview = asyncHandler(async (req, res) => {
  const { user, product, rating, comment } = req.body;

  // Validate required fields
  if (!user || !product || !rating) {
    throw new apiError(400, "User, product, and rating are required.");
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
  const reviewData = req.body;

  const updatedReview = await Review.findByIdAndUpdate(id, reviewData, {
    new: true,
  });

  if (!updatedReview) {
    throw new apiError(404, "Review not found.");
  }

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
