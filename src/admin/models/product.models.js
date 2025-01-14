import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    stock: { type: Number, required: true },
    images: [{ type: String, required: true }],
    isFeatured: { type: Boolean, default: false },
    discount: {
      percentage: { type: Number, default: 0 },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number },
      },
    ],
    colors: [
      {
        color: { type: String, required: true },
        stock: { type: Number },
      },
    ],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isAvailable: { type: Boolean, default: true },
    material: { type: String },
    manufacturer: {
      name: { type: String },
      address: { type: String },
      contact: { type: String },
    },
    warranty: {
      period: { type: String },
      details: { type: String },
    },
    availabilityZones: [{ type: String }],
    gender: { type: String, enum: ["Men", "Women", "Kids"], required: true },
    style: { type: String },
    season: { type: String, enum: ["Summer", "Winter", "All Seasons"] },
    occasion: { type: String, enum: ["Casual", "Formal", "Party", "Sports"] },
    fabric: { type: String },
    pattern: {
      type: String,
      enum: ["Solid", "Striped", "Printed", "Checked", "Other"],
    },
    fit: { type: String, enum: ["Regular", "Slim", "Loose"] },
    origin: { type: String },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
