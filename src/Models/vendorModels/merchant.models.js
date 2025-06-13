import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, trim: true, default: "N/A" },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, unique: true },
    panCard: { type: String, unique: true },
    aadhaarCard: { type: String, unique: true },
    gstNumber: { type: String, unique: true },
    companyName: { type: String, trim: true, default: "N/A" },
    ownerName: { type: String, trim: true, default: "N/A" },
    storeLocation: {
      address: { type: String, default: "N/A" },
      city: { type: String, default: "N/A" },
      state: { type: String, default: "N/A" },
      postalCode: { type: String, default: "N/A" },
    },
    onlineStoreUrl: { type: String },
    fabricTypes: { type: [String] },
    isSustainable: { type: Boolean, default: false },
    deliveryOptions: { type: [String] },
    returnPolicy: { type: String },
    isWholesaleAvailable: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    brands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
      },
    ],
  },
  { timestamps: true }
);

export const Merchant = mongoose.model("Merchant", merchantSchema);
