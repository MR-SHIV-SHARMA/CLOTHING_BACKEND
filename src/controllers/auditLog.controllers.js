import { AuditLog } from "../models/auditLog.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new audit log
const createAuditLog = asyncHandler(async (req, res) => {
  const { action, user, details } = req.body;

  // Validate required fields
  if (!action) {
    throw new apiError(400, "Action is required.");
  }

  // Create the audit log
  const auditLog = await AuditLog.create({ action, user, details });
  return res.status(201).json(new apiResponse(201, auditLog, "Audit log created successfully"));
});

// Get all audit logs
const getAllAuditLogs = asyncHandler(async (req, res) => {
  const auditLogs = await AuditLog.find().populate("user", "username email").exec();
  return res.status(200).json(new apiResponse(200, auditLogs, "Audit logs fetched successfully"));
});

// Get an audit log by ID
const getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const auditLog = await AuditLog.findById(id).populate("user", "username email");
  if (!auditLog) {
    throw new apiError(404, "Audit log not found");
  }
  return res.status(200).json(new apiResponse(200, auditLog, "Audit log fetched successfully"));
});

// Delete an audit log by ID
const deleteAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedAuditLog = await AuditLog.findByIdAndDelete(id);
  if (!deletedAuditLog) {
    throw new apiError(404, "Audit log not found");
  }
  return res.status(200).json(new apiResponse(200, {}, "Audit log deleted successfully"));
});

// Update an audit log by ID (optional, as audit logs are often immutable)
const updateAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedAuditLog = await AuditLog.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedAuditLog) {
    throw new apiError(404, "Audit log not found");
  }
  return res.status(200).json(new apiResponse(200, updatedAuditLog, "Audit log updated successfully"));
});

export {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLogById,
  updateAuditLogById,
};
