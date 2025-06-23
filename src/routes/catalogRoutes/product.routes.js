import { Router } from "express";
import {
  getAllProducts,
  getProductById,
} from "../../controllers/catalogController/product.controllers.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { trackAnalytics } from "../../middlewares/analytics.middleware.js";

const router = Router();

// Get all products with optional filters
router.get("/", trackAnalytics, adminRateLimiter, getAllProducts);

// Get a specific product by ID
router.get("/:id", adminRateLimiter, getProductById);

export default router;
