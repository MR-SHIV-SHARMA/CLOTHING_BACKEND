import { Router } from "express";
import {
  getAllProducts,
  getProductById,
} from "../controllers/product.controllers.js";

const router = Router();

// Get all products with optional filters
router.route("/").get(getAllProducts);

// Get a specific product by ID
router.route("/:id").get(getProductById);

export default router;
