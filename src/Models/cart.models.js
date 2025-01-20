import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "abandoned"],
      default: "active",
    },
    appliedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    tax: { type: Number, default: 0 },
    shippingDetails: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" },
        shippingCharge: { type: Number, required: true },
      },
    ],
    discount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: Date.now, index: { expires: "7d" } },
  },
  { timestamps: true }
);

// Pre-save hook for totalPrice calculation
cartSchema.pre("save", async function (next) {
  const total = await this.items.reduce(async (acc, item) => {
    const product = await mongoose.model("Product").findById(item.product);
    if (product) {
      return (await acc) + product.price * item.quantity;
    }
    return acc;
  }, Promise.resolve(0));

  this.totalPrice = total;
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
