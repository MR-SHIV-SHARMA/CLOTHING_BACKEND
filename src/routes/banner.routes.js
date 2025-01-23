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
import { logAction } from "../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new banner
router.post(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  upload.fields([{ name: "image", maxCount: 1 }]), // Accept only one image
  adminRateLimiter,
  logAction("Create Banner"),
  createBanner
);

// Get all banners (with optional filtering by isActive)
router.get("/", logAction("Get All Banners"), getAllBanners);

// Get a banner by ID
router.get("/:id", logAction("Get Banner By ID"), getBannerById);

// Update a banner by ID
router.put(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  upload.single("image"),
  adminRateLimiter,
  logAction("Update Banner By ID"),
  updateBannerById
);

// Delete a banner by ID
router.delete(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  adminRateLimiter,
  logAction("Delete Banner By ID"),
  deleteBannerById
);

// Activate or deactivate a banner by ID
router.patch(
  "/:id/status",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  adminRateLimiter,
  logAction("Toggle Banner Status"),
  toggleBannerStatus
);

// Delete multiple banners by IDs
router.post(
  "/delete-multiple",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  adminRateLimiter,
  logAction("Delete Multiple Banners"),
  deleteMultipleBanners
);

export default router;
