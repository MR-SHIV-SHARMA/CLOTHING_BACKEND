import { Category } from "../../Models/adminModels/category.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;

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
  const categoryData = { name };
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new apiError(400, "Parent category not found.");
    }
    categoryData.parent = parent;

    // Add this category to the parent's subcategories
    parentCategory.subcategories.push(category._id);
    await parentCategory.save();
  }

  const category = await Category.create(categoryData);
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

// Seed categories and subcategories into the database
const seedCategories = asyncHandler(async (req, res) => {
  const categoriesData = [
    {
      name: "Core Clothing Categories",
      subcategories: [
        "T-Shirts",
        "Casual Shirts",
        "Formal Shirts",
        "Jeans",
        "Trousers",
        "Shorts",
        "Jackets",
        "Hoodies & Sweatshirts",
        "Blazers",
        "Suits",
        {
          name: "Ethnic Wear",
          subcategories: ["Kurta", "Sherwani", "Saree", "Lehenga"],
        },
        {
          name: "Dresses",
          subcategories: ["Casual Dresses", "Evening Gowns"],
        },
        "Skirts",
        {
          name: "Activewear",
          subcategories: ["Gym Wear", "Tracksuits"],
        },
        "Swimwear",
        "Nightwear & Loungewear",
        {
          name: "Innerwear",
          subcategories: ["Undergarments", "Lingerie"],
        },
      ],
    },
    {
      name: "Accessories",
      subcategories: [
        "Belts",
        "Hats & Caps",
        "Scarves & Stoles",
        "Ties & Bow Ties",
        "Gloves",
        "Socks",
        "Handbags",
        "Wallets",
        "Backpacks",
        {
          name: "Shoes",
          subcategories: ["Sneakers", "Formal Shoes", "Sandals", "Boots"],
        },
        {
          name: "Jewelry",
          subcategories: ["Necklaces", "Earrings", "Rings"],
        },
        "Watches",
        "Sunglasses",
      ],
    },
    {
      name: "Seasonal Categories",
      subcategories: [
        {
          name: "Winter Wear",
          subcategories: ["Thermals", "Overcoats"],
        },
        {
          name: "Rainwear",
          subcategories: ["Raincoats", "Waterproof Footwear"],
        },
      ],
    },
    {
      name: "Specialized Categories",
      subcategories: [
        "Plus Size Clothing",
        {
          name: "Kidswear",
          subcategories: ["Boys", "Girls", "Babies"],
        },
        "Maternity Wear",
        "Party Wear",
        "Wedding Wear",
        "Office Wear",
      ],
    },
    {
      name: "Fabric or Style-Based Categories",
      subcategories: [
        "Cotton Clothing",
        "Denim Wear",
        "Silk Clothing",
        "Linen Wear",
        "Printed Wear",
        "Solid Colors",
        "Embroidered Wear",
      ],
    },
  ];

  // Recursive function to insert categories and subcategories
  const insertCategory = async (categoryData, parent = null) => {
    const { name, subcategories } = categoryData;
    const category = await Category.create({ name, parent });

    if (subcategories && subcategories.length > 0) {
      for (const sub of subcategories) {
        if (typeof sub === "string") {
          await Category.create({ name: sub, parent: category._id });
        } else {
          await insertCategory(sub, category._id);
        }
      }
    }
  };

  // Insert all categories
  for (const categoryData of categoriesData) {
    await insertCategory(categoryData);
  }

  return res
    .status(201)
    .json(new apiResponse(201, {}, "Categories seeded successfully"));
});

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  seedCategories,
};
