import express from "express";
import {
  createAuditLog,
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLogById,
  updateAuditLogById,
} from "../controllers/auditLog.controller.js";

const router = express.Router();

// Create a new audit log
router.post("/", createAuditLog);

// Get all audit logs
router.get("/", getAllAuditLogs);

// Get an audit log by ID
router.get("/:id", getAuditLogById);

// Delete an audit log by ID
router.delete("/:id", deleteAuditLogById);

// Update an audit log by ID
router.put("/:id", updateAuditLogById); // Optional, as audit logs are often immutable

export default router;
