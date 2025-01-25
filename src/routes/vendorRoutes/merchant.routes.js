import express from "express";
import session from "express-session";
import {
  createMerchant,
  deleteMerchantById,
  updateMerchantById,
  getMerchantAccountById,
  getAllMerchantAccounts,
  createBrand,
  updateBrandById,
  deleteBrandById,
} from "../../controllers/vendorController/merchant.controllers.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true },
  })
);

router.post("/super-admin/create-merchant", adminRateLimiter, createMerchant);

router.delete(
  "/super-admin/delete-merchant/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin", "merchant"]),
  deleteMerchantById
);

router.patch(
  "/super-admin/update-merchant/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  updateMerchantById
);

router.get(
  "/super-admin/get-merchant/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin", "merchant"]),
  getMerchantAccountById
);

router.get(
  "/super-admin/getAll-merchant",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin", "admin"]),
  getAllMerchantAccounts
);

// Create a new brand for a merchant
router.post(
  "/super-admin/createBrand/:id",
  upload.fields([{ name: "logo", maxCount: 1 }]),
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  createBrand
);

// Update a brand by ID
router.patch(
  "/super-admin/updateBrand/:id",
  upload.single("logo"),
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  updateBrandById
);

// Delete a brand by ID
router.delete(
  "/super-admin/deleteBrand/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  deleteBrandById
);

export default router;
