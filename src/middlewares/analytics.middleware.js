import { Analytics } from "../Models/systemModels/analytics.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to track page views and user activity
export const trackAnalytics = asyncHandler(async (req, res, next) => {
  const { originalUrl, method, user } = req; // Capture request details
  const startTime = Date.now();

  res.on("finish", async () => {
    // Calculate time spent on the page
    const timeSpent = Date.now() - startTime;

    // Create analytics record
    await Analytics.create({
      user: user?._id || null, // Associate the user (if authenticated)
      pageViewed: originalUrl, // Log the page URL
      timeSpent, // Time spent in milliseconds
      method, // HTTP method (e.g., GET, POST)
    });
  });

  next(); // Proceed to the next middleware/route handler
});
