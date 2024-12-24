import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  getNonDeletedProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

// Create a new product
router.post("/", createProduct);

// Get all products with optional filters
router.get("/", getAllProducts);

// Get a specific product by ID
router.get("/:id", getProductById);

// Update a product by ID
router.put("/:id", updateProductById);

// Soft delete a product by ID
router.delete("/:id", deleteProductById);

// Get all non-deleted products (optional)
router.get("/non-deleted", getNonDeletedProducts);

export default router;
