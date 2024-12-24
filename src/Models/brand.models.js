import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logo: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Brand = mongoose.model('Brand', brandSchema);