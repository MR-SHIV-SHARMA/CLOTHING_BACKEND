import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  seedCategories,
} from "../../controllers/adminController/category.controllers.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new category
router.post(
  "/",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  createCategory
);

// Get all categories
router.get("/", getAllCategories);

// Get a category by ID
router.get("/:id", getCategoryById);

// Update a category by ID
router.put(
  "/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  updateCategoryById
);

// Delete a category by ID
router.delete(
  "/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  deleteCategoryById
);

router.post("/categories/seed", seedCategories);

export default router;
