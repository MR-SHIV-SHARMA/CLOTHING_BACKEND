import { Product } from "../models/product.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    stock,
    images,
    sku,
    gender,
    // Add other fields as necessary
  } = req.body;

  // Validate required fields
  if (!name || !description || !price || !category || !stock || !images || !sku || !gender) {
    throw new apiError(400, "Please provide all required fields.");
  }

  // Create the product
  const product = await Product.create(req.body);
  return res.status(201).json(new apiResponse(201, product, "Product created successfully"));
});

// Get all products with pagination and filtering
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, priceRange } = req.query;

  const query = {};
  if (category) query.category = category;
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  const products = await Product.find(query).lean().limit(limit * 1).skip((page - 1) * limit).exec();
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
  const product = await Product.findById(id).lean(); // Use lean for performance
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  return res.status(200).json(new apiResponse(200, product, "Product fetched successfully"));
});

// Update a product by ID
const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  // Validate required fields (you can expand validation based on your requirements)
  if (!productData.name && !productData.description && !productData.price) {
    throw new apiError(400, "Please provide at least one field to update.");
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true }).lean();
  if (!updatedProduct) {
    throw new apiError(404, "Product not found");
  }
  return res.status(200).json(new apiResponse(200, updatedProduct, "Product updated successfully"));
});

// Soft delete a product by ID
const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Implement soft delete
  const deletedProduct = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean();
  if (!deletedProduct) {
    throw new apiError(404, "Product not found");
  }
  return res.status(200).json(new apiResponse(200, {}, "Product deleted successfully"));
});

// Get all non-deleted products
const getNonDeletedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isDeleted: false }).lean();
  return res.status(200).json(new apiResponse(200, products, "Non-deleted products fetched successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getNonDeletedProducts,
};
