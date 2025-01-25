import express from "express";
import {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../controllers/aditionl/vendor.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  getAllVendors
);

router.get(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  getVendorById
);

router.post(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  createVendor
);

router.put(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  updateVendor
);

router.delete(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  deleteVendor
);

export default router;
