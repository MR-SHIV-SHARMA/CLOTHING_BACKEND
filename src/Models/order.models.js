import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    tax: { type: Number, required: true },
    shippingDetails: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        shippingCharge: { type: Number, required: true },
      },
    ],
    discount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    appliedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
