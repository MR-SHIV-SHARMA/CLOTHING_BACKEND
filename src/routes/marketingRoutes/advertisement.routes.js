import express from "express";
import {
  createAdvertisement,
  getAllAdvertisements,
  getAdvertisementById,
  updateAdvertisementById,
  deleteAdvertisementById,
} from "../../controllers/marketingController/advertisement.controllers.js";

const router = express.Router();

// Route to create a new advertisement
router.post("/", createAdvertisement);

// Route to fetch all advertisements
router.get("/", getAllAdvertisements);

// Route to fetch a single advertisement by ID
router.get("/:id", getAdvertisementById);

// Route to update an advertisement by ID
router.put("/:id", updateAdvertisementById);

// Route to delete an advertisement by ID
router.delete("/:id", deleteAdvertisementById);

export default router;
