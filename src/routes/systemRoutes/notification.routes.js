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

const router = express.Router();

// Create a new notification
router.post("/", authenticateAdmin, createNotification);

// Get all notifications for a user
router.get("/", authenticateAdmin, getAllNotifications);

// Get a single notification by ID
router.get("/:id", authenticateAdmin, getNotificationById);

// Mark a notification as read
router.put("/:id/read", authenticateAdmin, markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", authenticateAdmin, markAllNotificationsAsRead);

// Delete a notification by ID
router.delete("/:id", authenticateAdmin, deleteNotificationById);

// Delete multiple notifications by IDs
router.post("/delete-multiple", authenticateAdmin, deleteMultipleNotifications);

export default router;
