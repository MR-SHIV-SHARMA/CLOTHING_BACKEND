import express from "express";
import {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddressById,
  deleteAddressById,
} from "../controllers/address.controller.js";

const router = express.Router();

// Create a new address
router.post("/", createAddress);

// Get all addresses for a user
router.get("/:userId", getAllAddresses);

// Get an address by ID
router.get("/address/:id", getAddressById);

// Update an address by ID
router.put("/address/:id", updateAddressById);

// Delete an address by ID
router.delete("/address/:id", deleteAddressById);

export default router;