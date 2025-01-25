import Faq from "../../Models/systemModels/faq.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiError } from "../../utils/apiError.js";

const getAllFaqs = asyncHandler(async (req, res) => {
  try {
    const faqs = await Faq.find({});
    res
      .status(200)
      .json(new apiResponse(200, faqs, "All FAQs fetched successfully"));
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

const createFaq = asyncHandler(async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json(new apiResponse(201, faq, "FAQ created successfully"));
  } catch (error) {
    res.status(400).json(new apiError(400, error.message));
  }
});

const updateFaq = asyncHandler(async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(200)
      .json(new apiResponse(200, updatedFaq, "FAQ updated successfully"));
  } catch (error) {
    res.status(400).json(new apiError(400, error.message));
  }
});

const deleteFaq = asyncHandler(async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res
      .status(204)
      .json(new apiResponse(204, null, "FAQ deleted successfully"));
  } catch (error) {
    res.status(500).json(new apiError(500, error.message));
  }
});

export { getAllFaqs, createFaq, updateFaq, deleteFaq };
