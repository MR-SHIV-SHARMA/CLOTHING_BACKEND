import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, unique: true },
    panCard: { type: String, required: true, unique: true },
    aadhaarCard: { type: String, required: true, unique: true },
    gstNumber: { type: String, unique: true },
    companyName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    productCategories: { type: [String], required: true },
    storeLocation: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
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
  },
  { timestamps: true }
);

export const Merchant = mongoose.model("Merchant", merchantSchema);
