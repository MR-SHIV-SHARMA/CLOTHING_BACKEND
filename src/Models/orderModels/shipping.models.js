import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    trackingNumber: { type: String },
    carrier: { type: String },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    estimatedDeliveryDate: { type: Date },
  },
  { timeseries: true }
);

export const Shipping = mongoose.model("Shipping", shippingSchema);
