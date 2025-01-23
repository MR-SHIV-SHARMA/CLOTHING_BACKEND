import express from "express";
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBannerById,
  deleteBannerById,
  toggleBannerStatus,
  deleteMultipleBanners,
} from "../controllers/banner.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = express.Router();

// Create a new banner
router.post(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  upload.fields([{ name: "image", maxCount: 1 }]), // Accept only one image
  adminRateLimiter,
  createBanner
);

// Get all banners (with optional filtering by isActive)
router.get("/", getAllBanners);

// Get a banner by ID
router.get("/:id", getBannerById);

// Update a banner by ID
router.put(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  upload.single("image"), // Accept a single image file
  adminRateLimiter,
  updateBannerById
);

// Delete a banner by ID
router.delete(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  adminRateLimiter,
  deleteBannerById
);

// Activate or deactivate a banner by ID
router.patch(
  "/:id/status",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  adminRateLimiter,
  toggleBannerStatus
);

// Delete multiple banners by IDs
router.post(
  "/delete-multiple",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  adminRateLimiter,
  deleteMultipleBanners
);

export default router;
