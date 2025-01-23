import Feedback from "../../Models/feedback.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiError } from "../../utils/apiError.js";

const createFeedback = asyncHandler(async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res
      .status(201)
      .json(new apiResponse(201, feedback, "Feedback created successfully"));
  } catch (error) {
    res.status(400).json(new apiError(400, error.message));
  }
});

const getAllFeedbacks = asyncHandler(async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res
      .status(200)
      .json(
        new apiResponse(200, feedbacks, "All feedbacks fetched successfully")
      );
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

const updateFeedback = asyncHandler(async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res
      .status(200)
      .json(
        new apiResponse(200, updatedFeedback, "Feedback updated successfully")
      );
  } catch (error) {
    res.status(400).json(new apiError(400, error.message));
  }
});

const deleteFeedback = asyncHandler(async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res
      .status(204)
      .json(new apiResponse(204, null, "Feedback deleted successfully"));
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

export { createFeedback, getAllFeedbacks, updateFeedback, deleteFeedback };
