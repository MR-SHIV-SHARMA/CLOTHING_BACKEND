import express from "express";
import session from "express-session";
import {
  createDefaultSuperAdmin,
  deleteSuperAdmin,
  registerSuperAdmin,
  superAdminCreateAdmin,
  superAdminDeleteAdmin,
  createMerchant,
  deleteMerchantById,
  updateMerchantById,
  getMerchantAccountById,
  getAllMerchantAccounts,
  createBrand,
  updateBrandById,
  deleteBrandById,
} from "../controllers/superAdmin.controllers.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import { upload } from "../../middlewares/multer.middlewares.js";
import { adminRateLimiter } from "../middleware/rateLimiter.js";
import authenticateAdmin from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true },
  })
);

// Create Default Super Admin
router.post(
  "/super-admin/create-Default/SuperAdmin",
  adminRateLimiter,
  createDefaultSuperAdmin
);

// Register a super admin
router.post(
  "/super-admin/register",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  registerSuperAdmin
);

// Only the default super admin can delete other super admins
router.delete(
  "/super-admin/delete/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  deleteSuperAdmin
);

// Super admin creates a new admin
router.post(
  "/super-admin/create-admin",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  superAdminCreateAdmin
);

// Super admin deletes an admin by ID
router.delete(
  "/super-admin/delete-admin/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  superAdminDeleteAdmin
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

export default router;
