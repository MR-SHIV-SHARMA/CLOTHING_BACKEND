import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pageViewed: { type: String },
    timeSpent: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);
