import express from "express";
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../../controllers/systemController/faq.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Get all faqs
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin"]),
  logAction("Get All FAQs"),
  getAllFaqs
);

// Create a new faq
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin"]),
  logAction("Create FAQ"),
  createFaq
);

// Update a faq by ID
router.put(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin"]),
  logAction("Update FAQ by ID"),
  updateFaq
);

// Delete a faq by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin"]),
  logAction("Delete FAQ by ID"),
  deleteFaq
);

export default router;
