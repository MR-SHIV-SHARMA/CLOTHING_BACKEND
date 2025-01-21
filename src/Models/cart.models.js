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

// Pre-save hook for totalPrice and discount calculation
cartSchema.pre("save", async function (next) {
  let totalPrice = 0;
  let totalDiscount = 0;

  // Asynchronously calculate total price and discount
  await Promise.all(
    this.items.map(async (item) => {
      const product = await mongoose.model("Product").findById(item.product);

      if (product) {
        // Check if discount is valid
        const currentDate = new Date();
        const isDiscountValid =
          product.discount &&
          currentDate >= new Date(product.discount.startDate) &&
          currentDate <= new Date(product.discount.endDate);

        const discountPercentage = isDiscountValid
          ? product.discount.percentage
          : 0;

        const productDiscount = (product.price * discountPercentage) / 100; // Discount per unit
        const discountedPrice = product.price - productDiscount;

        totalDiscount += productDiscount * item.quantity; // Total discount for this item
        totalPrice += discountedPrice * item.quantity; // Accumulate discounted price
      }
    })
  );

  this.totalPrice = totalPrice;
  this.discount = totalDiscount;
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
