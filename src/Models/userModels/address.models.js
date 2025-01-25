import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    addressLine: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^[0-9]{5}(?:-[0-9]{4})?$/.test(value), // US ZIP code example
        message: "Invalid postal code format.",
      },
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^\+?[1-9]\d{1,14}$/.test(value), // E.164 phone number format
        message: "Invalid phone number format.",
      },
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt
);

export const Address = mongoose.model("Address", addressSchema);
