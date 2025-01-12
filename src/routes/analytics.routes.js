import express from "express";
import {
  createAnalytics,
  getAllAnalytics,
  getAnalyticsById,
  deleteAnalyticsById,
  updateAnalyticsById,
} from "../controllers/analytics.controllers.js";

const router = express.Router();

// Create a new analytics record
router.post("/", createAnalytics);

// Get all analytics records
router.get("/", getAllAnalytics);

// Get an analytics record by ID
router.get("/:id", getAnalyticsById);

// Delete an analytics record by ID
router.delete("/:id", deleteAnalyticsById);

// Update an analytics record by ID
router.put("/:id", updateAnalyticsById);

export default router;
