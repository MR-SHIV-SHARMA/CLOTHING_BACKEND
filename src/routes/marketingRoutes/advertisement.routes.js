import express from "express";
import {
  createAdvertisement,
  getAllAdvertisements,
  getAdvertisementById,
  updateAdvertisementById,
  deleteAdvertisementById,
} from "../../controllers/marketingController/advertisement.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Route to create a new advertisement
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant"]),
  logAction("Create A New Advertisement"),
  createAdvertisement
);

// Route to fetch all advertisements
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant"]),
  logAction("Get All Advertisements"),
  getAllAdvertisements
);

// Route to fetch a single advertisement by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant"]),
  logAction("Get Advertisement by ID"),
  getAdvertisementById
);

// Route to update an advertisement by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant"]),
  logAction("Update Advertisement by ID"),
  updateAdvertisementById
);

// Route to delete an advertisement by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "merchant"]),
  logAction("Delete Advertisement by ID"),
  deleteAdvertisementById
);

export default router;
