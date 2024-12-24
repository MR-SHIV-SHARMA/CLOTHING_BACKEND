import express from "express";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  deleteNotificationById,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Create a new notification
router.post("/", createNotification);

// Get all notifications for a user
router.get("/:userId", getAllNotifications);

// Get a single notification by ID
router.get("/:id", getNotificationById);

// Mark a notification as read
router.put("/:id/read", markNotificationAsRead);

// Delete a notification by ID
router.delete("/:id", deleteNotificationById);

export default router;
