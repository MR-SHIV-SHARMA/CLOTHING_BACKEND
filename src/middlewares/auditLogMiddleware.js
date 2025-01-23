import { asyncHandler } from "../utils/asyncHandler.js";
import { createAuditLog } from "../controllers/auditLog.controllers.js";

const logAction = (action) =>
  asyncHandler(async (req, res, next) => {
    const user = req.user?._id || null;
    const details = req.body ? JSON.stringify(req.body) : {}; // Ensure it's stringified or an object
    const ipAddress = req.ip || "unknown";
    const method = req.method;
    const route = req.originalUrl || "";
    const timestamp = new Date().toISOString();
    const userAgent = req.headers["user-agent"] || "unknown";
    const statusCode = res.statusCode;
    const userRole = req.user?.role || "guest";
    const errorDetails = req.error ? req.error.message : null;

    // Debugging log
    console.log("Audit Log Data:", {
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
    });

    // Ensure action is passed correctly
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

    const createdLog = await createAuditLog(auditLogData);

    next(); // Proceed to the next middleware
  });

export { logAction };
