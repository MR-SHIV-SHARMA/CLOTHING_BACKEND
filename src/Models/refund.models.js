import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected"],
      default: "requested",
    },
    refundAmount: { type: Number },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export const Refund = mongoose.model("Refund", refundSchema);
