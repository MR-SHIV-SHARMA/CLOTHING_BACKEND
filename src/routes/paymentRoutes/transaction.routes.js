import express from "express";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
} from "../../controllers/paymentController/transaction.controllers.js";

const router = express.Router();

// Create a new transaction
router.post("/", createTransaction);

// Get all transactions
router.get("/", getAllTransactions);

// Get a single transaction by ID
router.get("/:id", getTransactionById);

// Update a transaction by ID
router.put("/:id", updateTransactionById);

// Delete a transaction by ID
router.delete("/:id", deleteTransactionById);

export default router;
