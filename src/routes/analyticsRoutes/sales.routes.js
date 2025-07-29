import { Router } from "express";
import {
  getTotalSales,
  getSalesByProduct,
  getSalesByCategory,
  getTopSellingProducts,
} from "../../controllers/analyticsController/sales.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../../middlewares/authorize.middlewares.js";

const router = Router();

// All routes require authentication and admin/manager role
router.use(verifyJWT);
router.use(authorizeRoles(["admin", "super_admin", "manager"]));

/**
 * @route   GET /api/v1/sales/total
 * @desc    Get total sales amount
 * @access  Admin/Manager only
 */
router.route("/total").get(getTotalSales);

/**
 * @route   GET /api/v1/sales/by-product
 * @desc    Get sales breakdown by product
 * @access  Admin/Manager only
 */
router.route("/by-product").get(getSalesByProduct);

/**
 * @route   GET /api/v1/sales/by-category
 * @desc    Get sales breakdown by category
 * @access  Admin/Manager only
 */
router.route("/by-category").get(getSalesByCategory);

/**
 * @route   GET /api/v1/sales/top-products
 * @desc    Get top-selling products
 * @access  Admin/Manager only
 */
router.route("/top-products").get(getTopSellingProducts);

export default router;
