import { Admin } from "../models/admin.models.js";
import { Product } from "../models/product.models.js";
import { ActivityLog } from "../models/activityLog.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadFileToCloudinary } from "../../utils/cloudinary.js";

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // Validate essential fields
  if (
    !productData.name ||
    !productData.price ||
    !productData.category ||
    !productData.stock
  ) {
    throw new apiError(400, "Name, price, category, and stock are required.");
  }

  // Validate additional details about the product
  if (
    !productData.description ||
    !productData.gender ||
    !productData.images ||
    productData.images.length === 0
  ) {
    throw new apiError(
      400,
      "Description, gender, and at least one image are required."
    );
  }

  // Associate the product with the merchant
  productData.merchant = req.user._id;

  // Validate sizes
  if (
    productData.sizes &&
    (!Array.isArray(productData.sizes) ||
      productData.sizes.some((size) => !size.size || size.stock < 0))
  ) {
    throw new apiError(
      400,
      "Sizes must be an array of objects with 'size' and valid 'stock'."
    );
  }

  // Validate colors
  if (
    productData.colors &&
    (!Array.isArray(productData.colors) ||
      productData.colors.some((color) => !color.color || color.stock < 0))
  ) {
    throw new apiError(
      400,
      "Colors must be an array of objects with 'color' and valid 'stock'."
    );
  }

  // Validate discount details if provided
  if (productData.discount) {
    const { percentage, startDate, endDate } = productData.discount;
    if (percentage < 0 || percentage > 100) {
      throw new apiError(400, "Discount percentage must be between 0 and 100.");
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new apiError(400, "Discount start date cannot be after end date.");
    }
  }

  // Validate ratings (if provided)
  if (productData.ratings) {
    const { average, count } = productData.ratings;
    if (average < 0 || average > 5) {
      throw new apiError(400, "Average rating must be between 0 and 5.");
    }
    if (count < 0) {
      throw new apiError(400, "Rating count cannot be negative.");
    }
  }

  // Add default values for optional fields (if not provided)
  productData.isAvailable = productData.isAvailable ?? true;
  productData.isFeatured = productData.isFeatured ?? false;

  // Create the product
  const newProduct = await Product.create(productData);

  // Log the activity
  await logActivity({
    action: "CREATE",
    productId: newProduct._id,
    userId: req.user._id,
    description: `Product '${newProduct.name}' created successfully.`,
  });

  return res
    .status(201)
    .json(new apiResponse(201, newProduct, "Product created successfully"));
});

// Update a product by ID
const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  // Validate at least one field to update
  if (Object.keys(productData).length === 0) {
    throw new apiError(400, "Provide at least one field to update.");
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new apiError(404, "Product not found");
  }

  // Ensure the user is authorized to update
  if (product.merchant.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to update this product.");
  }

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

  // Ensure the user is authorized to delete
  if (product.merchant.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this product.");
  }

  // Perform soft delete
  const deletedProduct = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true, isAvailable: false },
    { new: true }
  ).lean();

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Product deleted successfully"));
});

// Get all products with advanced filtering
const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    brand,
    priceRange,
    availability,
    rating,
    season,
  } = req.query;

  const query = { merchant: req.user._id, isDeleted: { $ne: true } };

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }
  if (availability) query.isAvailable = availability === "true";
  if (rating) query["ratings.average"] = { $gte: Number(rating) };
  if (season) query.season = season;

  const products = await Product.find(query)
    .lean()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  const count = await Product.countDocuments(query);

  return res.status(200).json(
    new apiResponse(200, products, "Products fetched successfully", {
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    })
  );
});

// Get a product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).lean();
  if (!product || product.isDeleted) {
    throw new apiError(404, "Product not found");
  }

  // Ensure the user is authorized to view
  if (product.merchant.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to view this product.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, product, "Product fetched successfully"));
});

export {
  createProduct,
  updateProductById,
  deleteProductById,
  getAllProducts,
  getProductById,
};
