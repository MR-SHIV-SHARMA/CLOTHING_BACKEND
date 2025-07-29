import express from "express";
import session from "express-session";
import {
  createDefaultSuperAdmin,
  deleteSuperAdmin,
  registerSuperAdmin,
  superAdminCreateAdmin,
  superAdminDeleteAdmin,
  getAllSuperAdmins,
  getAllAdmins,
} from "../../controllers/adminController/superAdmin.controllers.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
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

// Create Default Super Admin
router.post(
  "/super-admin/create-Default/SuperAdmin",
  // adminRateLimiter,
  createDefaultSuperAdmin
);

// Register a super admin
router.post(
  "/super-admin/register",
  // adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  registerSuperAdmin
);

// Only the default super admin can delete other super admins
router.delete(
  "/super-admin/delete/:id",
  // adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  deleteSuperAdmin
);

// Super admin creates a new admin
router.post(
  "/super-admin/create-admin",
  // adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  superAdminCreateAdmin
);

// Super admin deletes an admin by ID
router.delete(
  "/super-admin/delete-admin/:id",
  // adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  superAdminDeleteAdmin
);

// Get all super admins
router.get(
  "/super-admin",
  // adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  getAllSuperAdmins
);

// Get all admins
router.get(
  "/admins",
  // adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  getAllAdmins
);

export default router;
