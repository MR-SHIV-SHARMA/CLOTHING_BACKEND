import express from "express";
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrandById,
  deleteBrandById,
} from "../controllers/brand.controllers.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import { adminRateLimiter } from "../middleware/rateLimiter.js";
import authenticateAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new brand
router.post(
  "/",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  createBrand
);

// Get all brands
router.get("/", getAllBrands);

// Get a brand by ID
router.get("/:id", getBrandById);

// Update a brand by ID
router.put(
  "/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  updateBrandById
);

// Delete a brand by ID
router.delete(
  "/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  deleteBrandById
);

export default router;
