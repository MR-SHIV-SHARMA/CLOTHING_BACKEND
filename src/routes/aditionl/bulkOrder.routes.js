import express from "express";
import {
  createBulkOrder,
  getAllBulkOrders,
  getBulkOrderById,
  updateBulkOrderById,
  deleteBulkOrderById,
} from "../../controllers/aditionl/bulkOrder.controllers.js";

const router = express.Router();

// Create a new bulk order
router.post("/", createBulkOrder);

// Get all bulk orders
router.get("/", getAllBulkOrders);

// Get a single bulk order by ID
router.get("/:id", getBulkOrderById);

// Update a bulk order by ID
router.put("/:id", updateBulkOrderById);

// Delete a bulk order by ID
router.delete("/:id", deleteBulkOrderById);

export default router;
