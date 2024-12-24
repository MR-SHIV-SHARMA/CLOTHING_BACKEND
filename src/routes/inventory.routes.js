import express from "express";
import {
  createOrUpdateInventory,
  getInventoryByProductId,
  getAllInventories,
  updateInventoryByProductId,
  deleteInventoryByProductId,
} from "../controllers/inventory.controller.js";

const router = express.Router();

// Create or update inventory
router.post("/", createOrUpdateInventory);

// Get inventory for a specific product
router.get("/:productId", getInventoryByProductId);

// Get all inventories
router.get("/", getAllInventories);

// Update inventory by product ID
router.put("/:productId", updateInventoryByProductId);

// Delete inventory by product ID
router.delete("/:productId", deleteInventoryByProductId);

export default router;
