import express from "express";
import {
  getAllBrands,
  getBrandById,
} from "../controllers/brand.controllers.js";

const router = express.Router();

// Get all brands
router.get("/", getAllBrands);

// Get a brand by ID
router.get("/:id", getBrandById);

export default router;
