import { Promotion } from "../../Models/marketingModels/promotion.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new promotion
/**
 * Expected POST data:
 * {
 *   "name": "Summer Flash Sale",
 *   "description": "50% off on all summer collection",
 *   "type": "flash_sale",
 *   "discountType": "percentage",
 *   "discountValue": 50,
 *   "maxDiscount": 100,
 *   "minOrderValue": 50,
 *   "applicableProducts": ["productId1", "productId2"],
 *   "applicableCategories": ["categoryId1"],
 *   "applicableBrands": ["brandId1"],
 *   "excludedProducts": ["productId3"],
 *   "startDate": "2024-07-15T00:00:00Z",
 *   "endDate": "2024-07-31T23:59:59Z",
 *   "priority": 1,
 *   "usageLimit": 1000,
 *   "targetAudience": "all",
 *   "conditions": {
 *     "minimumQuantity": 2,
 *     "customerGroups": ["premium"],
 *     "regionRestrictions": ["US", "CA"]
 *   },
 *   "bannerImage": "https://example.com/banner.jpg",
 *   "bannerText": "Limited Time Offer!",
 *   "isStackable": false,
 *   "autoApply": true,
 *   "tags": ["summer", "flash_sale", "clothing"]
 * }
 */
const createPromotion = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue,
    applicableProducts,
    applicableCategories,
    applicableBrands,
    excludedProducts,
    startDate,
    endDate,
    priority,
    usageLimit,
    targetAudience,
    conditions,
    bannerImage,
    bannerText,
    isStackable,
    autoApply,
    tags
  } = req.body;

  // Validate required fields
  if (!name || !description || !type || !startDate || !endDate) {
    throw new apiError(400, "Name, description, type, start date, and end date are required");
  }

  // Validate discount fields for discount types
  if ((type === 'discount' || type === 'flash_sale') && (!discountType || discountValue === undefined)) {
    throw new apiError(400, "Discount type and value are required for discount promotions");
  }

  const promotion = await Promotion.create({
    name,
    description,
    type,
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue: minOrderValue || 0,
    applicableProducts: applicableProducts || [],
    applicableCategories: applicableCategories || [],
    applicableBrands: applicableBrands || [],
    excludedProducts: excludedProducts || [],
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    priority: priority || 0,
    usageLimit,
    targetAudience: targetAudience || "all",
    conditions: conditions || {},
    bannerImage,
    bannerText,
    isStackable: isStackable || false,
    autoApply: autoApply || false,
    tags: tags || [],
    createdBy: req.user._id,
  });

  return res.status(201).json(
    new apiResponse(201, promotion, "Promotion created successfully")
  );
});

// Get all promotions
const getPromotions = asyncHandler(async (req, res) => {
  const { 
    type, 
    isActive, 
    targetAudience, 
    tags, 
    page = 1, 
    limit = 10,
    sortBy = 'priority',
    sortOrder = 'desc'
  } = req.query;
  
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (targetAudience) filter.targetAudience = targetAudience;
  if (tags) filter.tags = { $in: tags.split(',') };

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const promotions = await Promotion.find(filter)
    .populate("createdBy", "fullName email")
    .populate("applicableProducts", "name price")
    .populate("applicableCategories", "name")
    .populate("applicableBrands", "name")
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Promotion.countDocuments(filter);

  return res.status(200).json(
    new apiResponse(200, {
      promotions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, "Promotions fetched successfully")
  );
});

// Get active promotions (public endpoint)
const getActivePromotions = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
    ]
  })
  .populate("applicableProducts", "name price")
  .populate("applicableCategories", "name")
  .populate("applicableBrands", "name")
  .sort({ priority: -1 })
  .select("-createdBy -__v");

  return res.status(200).json(
    new apiResponse(200, promotions, "Active promotions fetched successfully")
  );
});

// Get promotion by ID
const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findById(id)
    .populate("createdBy", "fullName email")
    .populate("applicableProducts", "name price")
    .populate("applicableCategories", "name")
    .populate("applicableBrands", "name");

  if (!promotion) {
    throw new apiError(404, "Promotion not found");
  }

  return res.status(200).json(
    new apiResponse(200, promotion, "Promotion fetched successfully")
  );
});

// Update promotion
/**
 * Expected PUT data: Same as create, but all fields optional
 */
const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Don't allow updating usage stats directly
  delete updateData.usedCount;
  delete updateData.createdBy;

  const promotion = await Promotion.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
  .populate("createdBy", "fullName email")
  .populate("applicableProducts", "name price")
  .populate("applicableCategories", "name")
  .populate("applicableBrands", "name");

  if (!promotion) {
    throw new apiError(404, "Promotion not found");
  }

  return res.status(200).json(
    new apiResponse(200, promotion, "Promotion updated successfully")
  );
});

// Delete promotion
const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findByIdAndDelete(id);
  if (!promotion) {
    throw new apiError(404, "Promotion not found");
  }

  return res.status(200).json(
    new apiResponse(200, {}, "Promotion deleted successfully")
  );
});

// Activate promotion
const activatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  );

  if (!promotion) {
    throw new apiError(404, "Promotion not found");
  }

  return res.status(200).json(
    new apiResponse(200, promotion, "Promotion activated successfully")
  );
});

// Deactivate promotion
const deactivatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!promotion) {
    throw new apiError(404, "Promotion not found");
  }

  return res.status(200).json(
    new apiResponse(200, promotion, "Promotion deactivated successfully")
  );
});

// Get promotion statistics
const getPromotionStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findById(id);
  if (!promotion) {
    throw new apiError(404, "Promotion not found");
  }

  const stats = {
    totalUsage: promotion.usedCount,
    remainingUsage: promotion.usageLimit ? promotion.usageLimit - promotion.usedCount : null,
    usagePercentage: promotion.usageLimit ? 
      ((promotion.usedCount / promotion.usageLimit) * 100).toFixed(2) : null,
    isCurrentlyActive: promotion.isCurrentlyActive,
    daysRemaining: Math.ceil((promotion.endDate - new Date()) / (1000 * 60 * 60 * 24)),
    totalDuration: Math.ceil((promotion.endDate - promotion.startDate) / (1000 * 60 * 60 * 24)),
  };

  return res.status(200).json(
    new apiResponse(200, stats, "Promotion statistics fetched successfully")
  );
});

export {
  createPromotion,
  getPromotions,
  getActivePromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  activatePromotion,
  deactivatePromotion,
  getPromotionStats,
};
