import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
} from "../../controllers/userController/feedback.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new feedback
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Create A New Feedback"),
  createFeedback
);

// Get all feedbacks
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Get All Feedbacks"),
  getAllFeedbacks
);

// Update a feedback
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Update Feedback"),
  updateFeedback
);

// Delete a feedback
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Delete Feedback"),
  deleteFeedback
);

export default router;
