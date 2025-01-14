import express from "express";
import {
  createReview,
  getReviewsByProductId,
  getReviewById,
  updateReviewById,
  deleteReviewById,
} from "../controllers/review.controllers.js";

const router = express.Router();

// Create a new review
router.post("/", createReview);

// Get all reviews for a product
router.get("/product/:productId", getReviewsByProductId);

// Get a review by ID
router.get("/:id", getReviewById);

// Update a review by ID
router.put("/:id", updateReviewById);

// Delete a review by ID
router.delete("/:id", deleteReviewById);

export default router;
