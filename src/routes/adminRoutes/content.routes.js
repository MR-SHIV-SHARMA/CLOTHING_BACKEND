import express from "express";
import session from "express-session";
import {
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  createProduct,
  getAllProductsbyMerchant,
} from "../../controllers/adminController/content.controllers.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
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
  "/getAllProductsbyMerchant",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant"]),
  getAllProductsbyMerchant
);

router.get(
  "/getProductById/:id",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  getProductById
);

export default router;
