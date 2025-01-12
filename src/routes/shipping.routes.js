import express from "express";
import {
  createShipping,
  getAllShippingRecords,
  getShippingById,
  updateShippingById,
  deleteShippingById,
} from "../controllers/shipping.controllers.js";

const router = express.Router();

// Create a new shipping record
router.post("/", createShipping);

// Get all shipping records
router.get("/", getAllShippingRecords);

// Get a shipping record by ID
router.get("/:id", getShippingById);

// Update a shipping record by ID
router.put("/:id", updateShippingById);

// Delete a shipping record by ID
router.delete("/:id", deleteShippingById);

export default router;
