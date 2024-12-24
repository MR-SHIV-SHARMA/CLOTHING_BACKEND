import express from "express";
import {
  createRefund,
  getAllRefunds,
  getRefundById,
  updateRefundById,
  deleteRefundById,
} from "../controllers/refund.controller.js";

const router = express.Router();

// Create a new refund request
router.post("/", createRefund);

// Get all refunds
router.get("/", getAllRefunds);

// Get a refund by ID
router.get("/:id", getRefundById);

// Update a refund by ID
router.put("/:id", updateRefundById);

// Delete a refund by ID
router.delete("/:id", deleteRefundById);

export default router;
