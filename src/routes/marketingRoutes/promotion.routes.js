import express from "express";
import {
  createPromotion,
  getPromotions,
  getActivePromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  activatePromotion,
  deactivatePromotion,
  getPromotionStats,
} from "../../controllers/marketingController/promotion.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
// Get active promotions
router.get(
  "/active",
  adminRateLimiter,
  getActivePromotions
);

// Admin routes (authentication required)
// Create a new promotion
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Create Promotion"),
  createPromotion
);

// Get all promotions with filtering
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Get All Promotions"),
  getPromotions
);

// Get promotion by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Get Promotion by ID"),
  getPromotionById
);

// Update promotion
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Update Promotion"),
  updatePromotion
);

// Delete promotion
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Delete Promotion"),
  deletePromotion
);

// Activate promotion
router.patch(
  "/:id/activate",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Activate Promotion"),
  activatePromotion
);

// Deactivate promotion
router.patch(
  "/:id/deactivate",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Deactivate Promotion"),
  deactivatePromotion
);

// Get promotion statistics
router.get(
  "/:id/stats",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Get Promotion Stats"),
  getPromotionStats
);

export default router;
