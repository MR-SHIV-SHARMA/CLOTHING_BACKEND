import mongoose from "mongoose";

const bulkOrderSchema = new mongoose.Schema({
  orderDetails: {
    type: Array,
    required: true,
  },
  customerInfo: {
    type: Object,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  // Add any additional fields as needed
});

export const BulkOrder = mongoose.model("BulkOrder", bulkOrderSchema);
