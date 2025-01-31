import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  deleteMultipleNotifications,
} from "../../controllers/systemController/notification.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new notification
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Create Notification"),
  createNotification
);

// Get all notifications for a user
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Get All Notifications"),
  getAllNotifications
);

// Get a single notification by ID
router.get(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Get Notification by ID"),
  getNotificationById
);

// Mark a notification as read
router.put(
  "/:id/read",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Mark Notification as Read"),
  markNotificationAsRead
);

// Mark all notifications as read
router.put(
  "/read-all",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Mark All Notifications as Read"),
  markAllNotificationsAsRead
);

// Delete a notification by ID
router.delete(
  "/:id",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Delete Notification by ID"),
  deleteNotificationById
);

// Delete multiple notifications by IDs
router.post(
  "/delete-multiple",
  authenticateAdmin,
  adminRateLimiter,
  checkRole(["admin", "super-admin", "customer", "merchant"]),
  logAction("Delete Multiple Notifications"),
  deleteMultipleNotifications
);

export default router;
