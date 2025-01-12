import { Admin } from "../Models/admin.models.js";
import { Product } from "../models/product.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new apiResponse(200, admins, "Admins retrieved successfully"));
});

// Get an admin by ID
const getAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (!admin) {
    throw new apiError(404, "Admin not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, admin, "Admin retrieved successfully"));
});

// Create a new admin
const createAdmin = asyncHandler(async (req, res) => {
  const { fullname, email, password, role } = req.body;

  if (!fullname || !email || !password || !role) {
    throw new apiError(422, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ email });
  if (existedAdmin) {
    throw new apiError(422, "Email already in use");
  }

  const newAdmin = await Admin.create({
    fullname,
    email,
    password,
    role,
  });

  return res
    .status(201)
    .json(new apiResponse(201, newAdmin, "Admin created successfully"));
});

// Update admin by ID
const updateAdminById = asyncHandler(async (req, res) => {
  const { fullname, email, role } = req.body;

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { fullname, email, role },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!admin) {
    throw new apiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, admin, "Admin updated successfully"));
});

// Delete admin by ID
const deleteAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndDelete(req.params.id).select(
    "-password -refreshToken"
  );
  if (!admin) {
    throw new apiError(404, "Admin not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Admin deleted successfully"));
});

// Update a product by ID
const updateProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = req.body;

  // Validate required fields (you can expand validation based on your requirements)
  if (!productData.name && !productData.description && !productData.price) {
    throw new apiError(400, "Please provide at least one field to update.");
  }

  if (!productData.images.file?.path) {
    throw new apiError(404, "image file is missing");
  }

  const images = await Product.findById(req.product._id);
  if (!images) {
    throw new apiError(404, "product is missing");
  }

  const oldImage = images.images;
  const newImage = await uploadFileToCloudinary(productData, oldImage);

  if (!newImage.url) {
    throw new apiError(400, "Error while uploading image");
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    productData,
    { images: newImage.url },
    { new: true }
  ).lean();

  return res
    .status(200)
    .json(new apiResponse(200, updatedProduct, "Product updated successfully"));
});

// Soft delete a product by ID
const deleteProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product.images.url) {
    throw new apiError(404, "Product not found");
  }

  const deleteproduct = await uploadFileToCloudinary(_, product.images.url);
  if (!deleteproduct.url) {
    throw new apiError(400, "Error while deleting product image");
  }

  // Implement soft delete
  const deletedProduct = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  ).lean();
  if (!deletedProduct) {
    throw new apiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Product deleted successfully"));
});

// Get all non-deleted products
const getNonDeletedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isDeleted: false }).lean();
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        products,
        "Non-deleted products fetched successfully"
      )
    );
});

// Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // Validate required fields
  if (!productData.name || !productData.price) {
    throw new apiError(400, "Please provide all required fields.");
  }

  const newProduct = await Product.create(productData);
  return res.status(201).json(new apiResponse(201, newProduct, "Product created successfully"));
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
  const product = await Product.findById(id).lean(); // Use lean for performance
  if (!product) {
    throw new apiError(404, "Product not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, product, "Product fetched successfully"));
});

// Exporting the controller functions
export {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdminById,
  deleteAdminById,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getNonDeletedProducts,
  createProduct,
};
