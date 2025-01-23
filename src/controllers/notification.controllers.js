import { Notification } from "../Models/notification.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.models.js";

// Create a new notification
const createNotification = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const userId = req.user._id;
  const user = await User.findById(userId);

  // Validate required fields
  if (!user || !message) {
    throw new apiError(400, "User and message are required.");
  }

  // Create the notification
  const notification = await Notification.create({
    user,
    message,
  });

  return res
    .status(201)
    .json(
      new apiResponse(201, notification, "Notification created successfully.")
    );
});

// Get all notifications for a specific user
const getAllNotifications = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const userId = await User.findById(user);

  const notifications = await Notification.find({ user: userId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(
      new apiResponse(200, notifications, "Notifications fetched successfully.")
    );
});

// Get a notification by ID
const getNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new apiError(404, "Notification not found.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, notification, "Notification fetched successfully.")
    );
});

// Mark a notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new apiError(404, "Notification not found.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        notification,
        "Notification marked as read successfully."
      )
    );
});

// Delete a notification by ID
const deleteNotificationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedNotification = await Notification.findByIdAndDelete(id);
  if (!deletedNotification) {
    throw new apiError(404, "Notification not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Notification deleted successfully."));
});

export {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markNotificationAsRead,
  deleteNotificationById,
};
