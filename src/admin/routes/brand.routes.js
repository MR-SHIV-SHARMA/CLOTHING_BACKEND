import express from "express";
import {
  getAllBrands,
  getBrandById,
  deleteBrandById,
} from "../controllers/brand.controllers.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import { adminRateLimiter } from "../middleware/rateLimiter.js";
import authenticateAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all brands
router.get("/", getAllBrands);

// Get a brand by ID
router.get("/:id", getBrandById);

// Delete a brand by ID
router.delete(
  "/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  deleteBrandById
);

export default router;
