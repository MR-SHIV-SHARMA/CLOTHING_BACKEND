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
  this.totalPrice = await this.items.reduce(async (total, item) => {
    const product = await mongoose.model("Product").findById(item.product);
    if (product) {
      const discountedPrice =
        product.price -
        (product.price * (product.discount?.percentage || 0)) / 100;
      return total + discountedPrice * item.quantity;
    }
    return total;
  }, 0);
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
