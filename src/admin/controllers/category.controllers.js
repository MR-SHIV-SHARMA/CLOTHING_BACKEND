import { Category } from "../models/category.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validate required fields
  if (!name) {
    throw new apiError(400, "Category name is required.");
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new apiError(400, "Category name must be unique.");
  }

  // Create the category
  const category = await Category.create({ name });
  return res
    .status(201)
    .json(new apiResponse(201, category, "Category created successfully"));
});

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().populate("parent");
  return res
    .status(200)
    .json(new apiResponse(200, categories, "Categories fetched successfully"));
});

// Get a category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id).populate("parent");
  if (!category) {
    throw new apiError(404, "Category not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, category, "Category fetched successfully"));
});

// Update a category by ID
const updateCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const categoryData = req.body;

  // Validate required fields
  if (categoryData.name === undefined) {
    throw new apiError(400, "Category name is required.");
  }

  const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, {
    new: true,
  });
  if (!updatedCategory) {
    throw new apiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedCategory, "Category updated successfully")
    );
});

// Delete a category by ID
const deleteCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedCategory = await Category.findByIdAndDelete(id);
  if (!deletedCategory) {
    throw new apiError(404, "Category not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Category deleted successfully"));
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
