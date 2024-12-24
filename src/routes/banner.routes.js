import express from "express";
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBannerById,
  deleteBannerById,
} from "../controllers/banner.controller.js";

const router = express.Router();

// Create a new banner
router.post("/", createBanner);

// Get all banners
router.get("/", getAllBanners);

// Get a banner by ID
router.get("/:id", getBannerById);

// Update a banner by ID
router.put("/:id", updateBannerById);

// Delete a banner by ID
router.delete("/:id", deleteBannerById);

export default router;
