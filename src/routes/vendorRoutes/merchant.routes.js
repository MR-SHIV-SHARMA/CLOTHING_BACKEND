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
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true },
  })
);

router.post(
  "/super-admin/create-merchant",
  adminRateLimiter,

  createMerchant
);

router.delete(
  "/super-admin/delete-merchant/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin", "merchant"]),
  logAction("Delete Merchant"),
  deleteMerchantById
);

router.patch(
  "/super-admin/update-merchant/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  logAction("Update Merchant"),
  updateMerchantById
);

router.get(
  "/super-admin/get-merchant/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin", "merchant"]),
  logAction("Get Merchant by ID"),
  getMerchantAccountById
);

router.get(
  "/super-admin/getAll-merchant",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin", "admin"]),
  logAction("Get All Merchant Accounts"),
  getAllMerchantAccounts
);

// Create a new brand for a merchant
router.post(
  "/super-admin/createBrand/:id",
  upload.fields([{ name: "logo", maxCount: 1 }]),
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  logAction("Create Brand"),
  createBrand
);

// Update a brand by ID
router.patch(
  "/super-admin/updateBrand/:id",
  upload.single("logo"),
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  logAction("Update Brand by ID"),
  updateBrandById
);

// Delete a brand by ID
router.delete(
  "/super-admin/deleteBrand/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["merchant"]),
  logAction("Delete Brand by ID"),
  deleteBrandById
);

export default router;
