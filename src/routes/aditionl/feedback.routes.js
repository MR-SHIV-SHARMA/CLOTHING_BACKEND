import express from "express";
import {
  createFeedback,
  getAllFeedbacks,
  updateFeedback,
  deleteFeedback,
} from "../../controllers/aditionl/feedback.controllers.js";

const router = express.Router();

// Create a new feedback
router.post("/", createFeedback);

// Get all feedbacks
router.get("/", getAllFeedbacks);

// Update a feedback
router.put("/:id", updateFeedback);

// Delete a feedback
router.delete("/:id", deleteFeedback);

export default router;
