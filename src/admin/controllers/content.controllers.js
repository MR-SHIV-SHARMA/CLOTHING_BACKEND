import { Admin } from "../models/admin.models.js";
import { Product } from "../models/product.models.js";
import { ActivityLog } from "../models/activityLog.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Update a product by ID
const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  // Validate required fields
  if (!productData.name && !productData.description && !productData.price) {
    throw new apiError(400, "Please provide at least one field to update.");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  // Check if the merchant owns this product
  if (product.merchant.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this product.");
  }

  // Update the product
  const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
    new: true,
  }).lean();

  return res
    .status(200)
    .json(new apiResponse(200, updatedProduct, "Product updated successfully"));
});

// Soft delete a product by ID
const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  // Check if the merchant owns this product
  if (product.merchant.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this product.");
  }

  // Implement soft delete
  const deletedProduct = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  ).lean();

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Product deleted successfully"));
});

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // Validate required fields
  if (!productData.name || !productData.price) {
    throw new apiError(400, "Please provide all required fields.");
  }

  // Associate the product with the merchant
  productData.merchant = req.user._id;

  const newProduct = await Product.create(productData);
  return res
    .status(201)
    .json(new apiResponse(201, newProduct, "Product created successfully"));
});

// Get all products with pagination and filtering
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, priceRange } = req.query;

  const query = { merchant: req.user._id }; // Fetch only the merchant's products
  if (category) query.category = category;
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  const products = await Product.find(query)
    .lean()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  const count = await Product.countDocuments(query);

  return res.status(200).json(
    new apiResponse(200, products, "Products fetched successfully", {
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  );
});

// Get a product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).lean();

  if (!product) {
    throw new apiError(404, "Product not found");
  }

  // Check if the merchant owns this product
  if (product.merchant.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to view this product.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, product, "Product fetched successfully"));
});

export {
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  createProduct,
};
