import express from "express";
import session from "express-session";
import {
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  createProduct,
} from "../controllers/content.controllers.js";
import { checkRole } from "../middleware/roleMiddleware.js";
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

router.delete(
  "/product/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  deleteProductById
);

router.patch(
  "/update-product/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  updateProductById
);

router.post(
  "/createProduct",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  createProduct
);

router.get(
  "/getAllProducts",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  getAllProducts
);

router.get(
  "/getProductById",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin"]),
  getProductById
);

export default router;
