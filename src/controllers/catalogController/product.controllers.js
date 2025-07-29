import { Product } from "../../Models/adminmodels/product.models.js";
import { Review } from "../../Models/catalogModels/review.models.js";
import { Inventory } from "../../Models/catalogModels/inventory.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Advanced search and filtering for products
const searchProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    brand,
    priceRange,
    sizes,
    colors,
    gender,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    inStock,
    discount,
    season,
    occasion,
    fabric,
    pattern,
    fit
  } = req.query;

  // Build search query
  const query = { isAvailable: true };
  
  // Text search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { material: { $regex: search, $options: 'i' } },
      { fabric: { $regex: search, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Brand filter
  if (brand) {
    query.brand = brand;
  }

  // Price range filter
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split(',').map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  // Size filter
  if (sizes) {
    const sizeArray = sizes.split(',');
    query['sizes.size'] = { $in: sizeArray };
  }

  // Color filter
  if (colors) {
    const colorArray = colors.split(',');
    query['colors.color'] = { $in: colorArray };
  }

  // Gender filter
  if (gender) {
    query.gender = gender;
  }

  // Rating filter (products with rating >= specified value)
  if (rating) {
    query['ratings.average'] = { $gte: parseFloat(rating) };
  }

  // In stock filter
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Discount filter
  if (discount === 'true') {
    query['discount.percentage'] = { $gt: 0 };
    query['discount.startDate'] = { $lte: new Date() };
    query['discount.endDate'] = { $gte: new Date() };
  }

  // Additional filters
  if (season) query.season = season;
  if (occasion) query.occasion = occasion;
  if (fabric) query.fabric = { $regex: fabric, $options: 'i' };
  if (pattern) query.pattern = pattern;
  if (fit) query.fit = fit;

  // Build sort object
  const sortObj = {};
  if (sortBy === 'price') {
    sortObj.price = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'rating') {
    sortObj['ratings.average'] = sortOrder === 'desc' ? -1 : 1;
  } else if (sortBy === 'popularity') {
    sortObj['ratings.count'] = -1;
  } else {
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // Execute query with pagination
  const products = await Product.find(query)
    .populate('category', 'name')
    .populate('brand', 'name')
    .populate('merchant', 'name')
    .sort(sortObj)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Product.countDocuments(query);

  // Get filter aggregation data for frontend
  const filterData = await Product.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        priceRange: {
          $push: {
            min: { $min: '$price' },
            max: { $max: '$price' }
          }
        },
        availableSizes: { $addToSet: '$sizes.size' },
        availableColors: { $addToSet: '$colors.color' },
        availableBrands: { $addToSet: '$brand' },
        ratingRange: {
          $push: {
            min: { $min: '$ratings.average' },
            max: { $max: '$ratings.average' }
          }
        }
      }
    }
  ]);

  return res.status(200).json(
    new apiResponse(200, {
      products,
      filters: filterData[0] || {},
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalProducts: count,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    }, "Products searched successfully")
  );
});

// Get all products with basic pagination and filtering (legacy support)
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, priceRange } = req.query;

  const query = { isAvailable: true };
  if (category) query.category = category;
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  const products = await Product.find(query)
    .populate('category', 'name')
    .populate('brand', 'name')
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

export { getAllProducts, getProductById };
