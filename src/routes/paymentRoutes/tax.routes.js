import express from "express";
import {
  getAllTaxes,
  createTax,
  getTax,
  updateTax,
  deleteTax,
} from "../../controllers/paymentController/tax.controllers.js";

const router = express.Router();

// Get all taxes
router.get("/", getAllTaxes);

// Create a new tax
router.post("/", createTax);

// Get a tax by ID
router.get("/:id", getTax);

// Update a tax by ID
router.put("/:id", updateTax);

// Delete a tax by ID
router.delete("/:id", deleteTax);

export default router;
