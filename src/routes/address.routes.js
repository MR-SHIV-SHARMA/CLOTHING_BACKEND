import express from "express";
import {
  createAddress,
  getAddressById,
  updateAddressById,
  deleteAddressById,
} from "../controllers/address.controllers.js";
import authenticateAdmin from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new address
router.post("/", authenticateAdmin, createAddress);

// Get an address by ID
router.get("/address/:id", authenticateAdmin, getAddressById);

// Update an address by ID
router.put("/address/:id", authenticateAdmin, updateAddressById);

// Delete an address by ID
router.delete("/address/:id", authenticateAdmin, deleteAddressById);

export default router;
