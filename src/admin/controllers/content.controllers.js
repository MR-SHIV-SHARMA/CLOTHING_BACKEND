import { Product } from "../models/product.models.js";
import { ActivityLog } from "../models/activityLog.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadFileToCloudinary } from "../../utils/cloudinary.js";
import { User } from "../../Models/user.models.js";
import { Merchant } from "../models/merchant.models.js";

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  try {
    const productData = req.body;

    if (
      !productData.name ||
      !productData.price ||
      !productData.category ||
      !productData.stock ||
      !productData.description ||
      !productData.gender
    ) {
      throw new apiError(400, "Name, price, category, and stock are required.");
    }

    let images = [];
    if (Array.isArray(req.files)) {
      images = req.files.map((file) => file.path);
    } else {
      images = (req.files.images || []).map((file) => file.path);
    }

    if (images.length === 0) {
      throw new apiError(400, "No valid image files provided.");
    }

    const uploadedImages = await Promise.all(
      images.map((image) => uploadFileToCloudinary(image))
    );

    const imageUrls = uploadedImages.map((img) => img.url);
    if (imageUrls.some((url) => !url)) {
      throw new apiError(400, "Error while uploading images.");
    }

    productData.images = imageUrls;

    // Retrieve and validate merchant
    const user = await User.findById(req.admin._id).populate("merchant");
    if (!user) {
      throw new apiError(404, "Merchant not found.");
    }

    // Attach merchant ID to product data
    productData.merchant = user._id;

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

    // Validate discount
    if (productData.discount) {
      const { percentage, startDate, endDate } = productData.discount;
      if (percentage < 0 || percentage > 100) {
        throw new apiError(
          400,
          "Discount percentage must be between 0 and 100."
        );
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new apiError(
          400,
          "Discount start date cannot be after end date."
        );
      }
    }

    // Validate ratings
    if (productData.ratings) {
      const { average, count } = productData.ratings;
      if (average < 0 || average > 5) {
        throw new apiError(400, "Average rating must be between 0 and 5.");
      }
      if (count < 0) {
        throw new apiError(400, "Rating count cannot be negative.");
      }
    }

    // Default values for optional fields
    productData.isAvailable = productData.isAvailable ?? true;
    productData.isFeatured = productData.isFeatured ?? false;

    // Create the product
    const newProduct = await Product.create(productData);

    // Update the merchant's products list
    await Merchant.findByIdAndUpdate(
      user._id,
      { $push: { products: newProduct._id } },
      { new: true }
    );

    // Update the product with merchant information
    await Product.findByIdAndUpdate(
      newProduct._id,
      { merchant: user._id },
      { new: true }
    );

    // Log the activity
    await ActivityLog.create({
      action: "CREATE",
      productId: newProduct._id,
      adminId: req.admin._id,
      description: `Product '${newProduct.name}' created successfully.`,
    });

    return res
      .status(201)
      .json(new apiResponse(201, newProduct, "Product created successfully"));
  } catch (error) {
    // Handle errors gracefully
    return res
      .status(error.statusCode || 500)
      .json(new apiResponse(error.statusCode || 500, null, error.message));
  }
});

// Update a product by ID
const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  // Ensure req.user is valid
  if (!req.user || !req.user._id) {
    throw new apiError(401, "User information is missing or invalid");
  }

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

  // Ensure req.user is valid
  if (!req.user || !req.user._id) {
    throw new apiError(401, "User information is missing or invalid");
  }

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

  const query = { isDeleted: { $ne: true } };

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
const getProductById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      throw new apiError(400, "Product ID is required");
    }

    // Ensure req.admin is valid
    if (!req.admin || !req.admin._id) {
      throw new apiError(401, "Admin information is missing or invalid");
    }

    // Find the product by ID
    const product = await Product.findById(id).lean();
    if (!product || product.isDeleted) {
      throw new apiError(404, "Product not found");
    }

    // Fetch the merchant
    const merchant = await User.findById(req.admin._id).select("merchant");
    if (!merchant) {
      throw new apiError(404, "Merchant not found");
    }

    // Ensure the product has a merchant
    product.merchant = product.merchant || merchant._id; // Use existing merchant or set to current admin's merchant
    if (!product.merchant) {
      throw new apiError(500, "Product merchant information is missing");
    }

    // Ensure the user is authorized to view
    if (product.merchant.toString() !== req.admin._id.toString()) {
      throw new apiError(403, "You are not authorized to view this product");
    }

    // Respond with the product
    return res
      .status(200)
      .json(new apiResponse(200, product, "Product fetched successfully"));
  } catch (error) {
    next(error); // Pass errors to the error-handling middleware
  }
});

// Get all products by merchant with advanced filtering
const getAllProductsbyMerchant = asyncHandler(async (req, res) => {
  // Ensure req.user is valid
  if (!req.user || !req.user._id) {
    throw new apiError(401, "User information is missing or invalid");
  }

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

  const query = { isDeleted: { $ne: true }, merchant: req.user._id };

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
      totalProducts: count, // Total number of products
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    })
  );
});

export {
  createProduct,
  updateProductById,
  deleteProductById,
  getAllProducts,
  getProductById,
  getAllProductsbyMerchant,
};
