import { Router } from "express";
import {
  getAllProducts,
  getProductById,
} from "../controllers/product.controllers.js";
import { adminRateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Get all products with optional filters
router.get("/", adminRateLimiter, getAllProducts);

// Get a specific product by ID
router.get("/:id", adminRateLimiter, getProductById);

export default router;
