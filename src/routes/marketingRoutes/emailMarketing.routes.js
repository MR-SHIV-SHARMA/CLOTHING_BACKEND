import express from "express";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignStats,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "../../controllers/marketingController/emailMarketing.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Campaign management routes (admin/marketing manager only)
// Create a new email campaign
router.post(
  "/campaigns",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Create Email Campaign"),
  createCampaign
);

// Get all campaigns with filtering
router.get(
  "/campaigns",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Get All Email Campaigns"),
  getCampaigns
);

// Get campaign by ID
router.get(
  "/campaigns/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Get Email Campaign by ID"),
  getCampaignById
);

// Update campaign
router.put(
  "/campaigns/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Update Email Campaign"),
  updateCampaign
);

// Delete campaign
router.delete(
  "/campaigns/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Delete Email Campaign"),
  deleteCampaign
);

// Send or schedule campaign
router.post(
  "/campaigns/:id/send",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Send Email Campaign"),
  sendCampaign
);

// Get campaign statistics
router.get(
  "/campaigns/:id/stats",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "superadmin", "marketing_manager"]),
  logAction("Get Email Campaign Stats"),
  getCampaignStats
);

// Public newsletter subscription routes (no authentication required)
// Subscribe to newsletter
router.post(
  "/subscribe",
  adminRateLimiter,
  logAction("Newsletter Subscription"),
  subscribeToNewsletter
);

// Unsubscribe from newsletter
router.post(
  "/unsubscribe",
  adminRateLimiter,
  logAction("Newsletter Unsubscription"),
  unsubscribeFromNewsletter
);

export default router;
