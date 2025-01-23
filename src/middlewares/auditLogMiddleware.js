import { asyncHandler } from "../utils/asyncHandler.js";
import { createAuditLog } from "../controllers/auditLog.controllers.js";

const logAction = (action) =>
  asyncHandler(async (req, res, next) => {
    // Log only if the user is authenticated
    if (!req.user) {
      return next(); // Proceed without logging for unauthenticated users
    }

    const user = req.user._id; // Logged-in user ID
    const userRole = req.user.role; // User role
    const details = req.body ? JSON.stringify(req.body) : {};
    const ipAddress = req.ip || "unknown";
    const method = req.method;
    const route = req.originalUrl || "";
    const timestamp = new Date().toISOString();
    const userAgent = req.headers["user-agent"] || "unknown";
    const statusCode = res.statusCode;
    const errorDetails = req.error ? req.error.message : null;

    const auditLogData = {
      action,
      user,
      userRole,
      details,
      ipAddress,
      method,
      route,
      timestamp,
      userAgent,
      statusCode,
      errorDetails,
    };

    // Save audit log to the database
    await createAuditLog(auditLogData);

    next(); // Proceed to the next middleware
  });

export { logAction };
