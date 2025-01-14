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
import { upload } from "../../middlewares/multer.middlewares.js";

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
  checkRole(["admin", "super-admin", "merchant"]),
  deleteProductById
);

router.patch(
  "/update-product/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  updateProductById
);

router.post(
  "/createProduct",
  adminRateLimiter,
  authenticateAdmin,
  upload.fields([{ name: "images", maxCount: 10 }]),
  checkRole(["admin", "super-admin", "merchant"]),
  createProduct
);

router.get(
  "/getAllProducts",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  getAllProducts
);

router.get(
  "/getProductById/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  getProductById
);

export default router;
