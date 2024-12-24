import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    transactionId: { type: String },
  },
  { timeseries: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);