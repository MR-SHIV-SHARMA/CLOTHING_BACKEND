import { Analytics } from "../models/analytics.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new analytics record
const createAnalytics = asyncHandler(async (req, res) => {
  const { user, pageViewed, timeSpent } = req.body;

  // Validate required fields
  if (!pageViewed || !timeSpent) {
    throw new apiError(400, "Page viewed and time spent are required.");
  }

  // Create the analytics record
  const analyticsRecord = await Analytics.create({ user, pageViewed, timeSpent });
  return res.status(201).json(new apiResponse(201, analyticsRecord, "Analytics record created successfully"));
});

// Get all analytics records
const getAllAnalytics = asyncHandler(async (req, res) => {
  const analyticsRecords = await Analytics.find().populate("user", "username email").exec();
  return res.status(200).json(new apiResponse(200, analyticsRecords, "Analytics records fetched successfully"));
});

// Get an analytics record by ID
const getAnalyticsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const analyticsRecord = await Analytics.findById(id).populate("user", "username email");
  if (!analyticsRecord) {
    throw new apiError(404, "Analytics record not found");
  }
  return res.status(200).json(new apiResponse(200, analyticsRecord, "Analytics record fetched successfully"));
});

// Delete an analytics record by ID
const deleteAnalyticsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAnalyticsRecord = await Analytics.findByIdAndDelete(id);
  if (!deletedAnalyticsRecord) {
    throw new apiError(404, "Analytics record not found");
  }
  return res.status(200).json(new apiResponse(200, {}, "Analytics record deleted successfully"));
});

// Update an analytics record by ID
const updateAnalyticsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedAnalyticsRecord = await Analytics.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedAnalyticsRecord) {
    throw new apiError(404, "Analytics record not found");
  }
  return res.status(200).json(new apiResponse(200, updatedAnalyticsRecord, "Analytics record updated successfully"));
});

export {
  createAnalytics,
  getAllAnalytics,
  getAnalyticsById,
  deleteAnalyticsById,
  updateAnalyticsById,
};
