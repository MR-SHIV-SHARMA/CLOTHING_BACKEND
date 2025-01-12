import { Admin } from "../models/admin.models.js";
import { Product } from "../../models/product.models.js";
import { ActivityLog } from "../models/activityLog.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllProducts = asyncHandler(async (req, res) => {});
const getProductById = asyncHandler(async (req, res) => {});
const updateProductById = asyncHandler(async (req, res) => {});
const deleteProductById = asyncHandler(async (req, res) => {});
const createProduct = asyncHandler(async (req, res) => {});

export {
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  createProduct,
};
