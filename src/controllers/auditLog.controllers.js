import { AuditLog } from "../models/auditLog.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Assuming createAuditLog returns a promise
const createAuditLog = async (data) => {
  try {
    const auditLog = await AuditLog.create(data); // Assuming this is the model you're using
    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    throw error; // Ensure errors are thrown to be caught by asyncHandler
  }
};

// Get all audit logs with optional filters and pagination
const getAllAuditLogs = asyncHandler(async (req, res) => {
  const { action, user, page = 1, limit = 10 } = req.query;
  const query = {};

  if (action) query.action = action;
  if (user) query.user = user;

  const auditLogs = await AuditLog.find(query)
    .populate("user", "username email")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .exec();

  const total = await AuditLog.countDocuments(query);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { auditLogs, total, page, limit },
        "Audit logs fetched successfully"
      )
    );
});

// Get an audit log by ID
const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const auditLog = await AuditLog.findById(id).populate(
    "user",
    "username email"
  );
  if (!auditLog) {
    throw new apiError(404, "Audit log not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, auditLog, "Audit log fetched successfully"));
});

// Delete an audit log by ID
const deleteAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAuditLog = await AuditLog.findByIdAndDelete(id);
  if (!deletedAuditLog) {
    throw new apiError(404, "Audit log not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Audit log deleted successfully"));
});

// Bulk delete audit logs
const deleteMultipleAuditLogs = asyncHandler(async (req, res) => {
  const { ids } = req.body; // Expecting an array of IDs

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new apiError(400, "Invalid or empty list of IDs.");
  }

  const result = await AuditLog.deleteMany({ _id: { $in: ids } });
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        result,
        `${result.deletedCount} audit logs deleted successfully`
      )
    );
});

// Search audit logs by keyword
const searchAuditLogs = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    throw new apiError(400, "Keyword is required for search.");
  }

  const auditLogs = await AuditLog.find({
    $or: [
      { action: { $regex: keyword, $options: "i" } },
      { details: { $regex: keyword, $options: "i" } },
    ],
  }).populate("user", "username email");

  return res
    .status(200)
    .json(
      new apiResponse(200, auditLogs, "Search results fetched successfully")
    );
});

export {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLogById,
  deleteMultipleAuditLogs,
  searchAuditLogs,
};
