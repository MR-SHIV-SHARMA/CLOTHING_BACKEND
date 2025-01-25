import mongoose from "mongoose";

const seoMetadataSchema = new mongoose.Schema(
  {
    pageUrl: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60, // Recommended max length for SEO titles
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160, // Recommended max length for SEO descriptions
    },
    keywords: {
      type: [String],
      default: [],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    ogImage: {
      type: String,
      trim: true,
    },
    twitterCard: {
      type: String,
      trim: true,
      enum: ["summary", "summary_large_image", "app", "player"],
    },
    twitterTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    twitterDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    twitterImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 10;
}

seoMetadataSchema.index({ pageUrl: 1 });

export const SeoMetadata = mongoose.model("SeoMetadata", seoMetadataSchema);
