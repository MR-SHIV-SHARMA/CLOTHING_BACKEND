import express from "express";
import session from "express-session";
import {
  getAllAdmins,
  getAdminById,
} from "../../controllers/adminController/admin.controllers.js";
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

// Get all admins
router.get(
  "/super-admin/admins",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  getAllAdmins
);

router.get(
  "/super-admin/admins/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  getAdminById
);

export default router;
