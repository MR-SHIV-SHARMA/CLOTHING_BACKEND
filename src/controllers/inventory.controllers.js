import { Inventory } from "../models/inventory.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create or update inventory for a product
const createOrUpdateInventory = asyncHandler(async (req, res) => {
  const { product, quantity } = req.body;

  // Validate required fields
  if (!product || quantity === undefined) {
    throw new apiError(400, "Product and quantity are required.");
  }

  // Check if inventory entry already exists
  let inventory = await Inventory.findOne({ product });

  if (inventory) {
    // Update quantity if inventory exists
    inventory.quantity += quantity;
    await inventory.save();
    return res.status(200).json(new apiResponse(200, inventory, "Inventory updated successfully."));
  } else {
    // Create new inventory entry
    inventory = await Inventory.create({ product, quantity });
    return res.status(201).json(new apiResponse(201, inventory, "Inventory created successfully."));
  }
});

// Get inventory for a specific product
const getInventoryByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const inventory = await Inventory.findOne({ product: productId }).populate("product");
  if (!inventory) {
    throw new apiError(404, "Inventory not found for this product.");
  }

  return res.status(200).json(new apiResponse(200, inventory, "Inventory fetched successfully."));
});

// Get all inventory items
const getAllInventories = asyncHandler(async (req, res) => {
  const inventories = await Inventory.find().populate("product");
  return res.status(200).json(new apiResponse(200, inventories, "All inventories fetched successfully."));
});

// Update inventory quantity by product ID
const updateInventoryByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const inventory = await Inventory.findOneAndUpdate(
    { product: productId },
    { quantity },
    { new: true }
  );

  if (!inventory) {
    throw new apiError(404, "Inventory not found for this product.");
  }

  return res.status(200).json(new apiResponse(200, inventory, "Inventory updated successfully."));
});

// Delete inventory for a specific product
const deleteInventoryByProductId = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const deletedInventory = await Inventory.findOneAndDelete({ product: productId });
  if (!deletedInventory) {
    throw new apiError(404, "Inventory not found for this product.");
  }

  return res.status(200).json(new apiResponse(200, {}, "Inventory deleted successfully."));
});

export {
  createOrUpdateInventory,
  getInventoryByProductId,
  getAllInventories,
  updateInventoryByProductId,
  deleteInventoryByProductId,
};
