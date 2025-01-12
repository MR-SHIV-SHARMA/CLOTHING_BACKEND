import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
} from "../controllers/brand.controllers.js";

const router = express.Router();

// Create a new brand
router.post("/", createBrand);

// Get all brands
router.get("/", getAllBrands);

// Get a brand by ID
router.get("/:id", getBrandById);

// Update a brand by ID
router.put("/:id", updateBrandById);

// Delete a brand by ID
router.delete("/:id", deleteBrandById);

export default router;
