import express from "express";
import {
  createReview,
  getReviewsByProductId,
  getReviewById,
  updateReviewById,
  deleteReviewById,
} from "../../controllers/catalogController/review.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new review
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Create review"),
  checkRole(["customer"]),
  createReview
);

// Get all reviews for a product
router.get(
  "/product/:productId",

  getReviewsByProductId
);

// Get a review by ID
router.get("/:id", getReviewById);

// Update a review by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Update review"),
  checkRole(["customer", "admin"]),
  updateReviewById
);

// Delete a review by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Delete review"),
  checkRole(["customer", "admin"]),
  deleteReviewById
);

export default router;
