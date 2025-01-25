import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true, // Change to 'Object' if you want to store it as an object
    },
    ipAddress: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    errorDetails: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
