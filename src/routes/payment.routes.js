import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create a new payment
router.post("/", createPayment);

// Get all payments
router.get("/", getAllPayments);

// Get a payment by ID
router.get("/:id", getPaymentById);

// Update a payment by ID
router.put("/:id", updatePaymentById);

// Delete a payment by ID
router.delete("/:id", deletePaymentById);

export default router;
