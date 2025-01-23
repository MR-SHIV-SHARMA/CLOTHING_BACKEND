import mongoose from "mongoose";

const seoMetadataSchema = new mongoose.Schema(
  {
    pageUrl: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    ogTitle: {
      type: String,
      trim: true,
    },
    ogDescription: {
      type: String,
      trim: true,
    },
    ogImage: {
      type: String,
      trim: true,
    },
    twitterCard: {
      type: String,
      trim: true,
    },
    twitterTitle: {
      type: String,
      trim: true,
    },
    twitterDescription: {
      type: String,
      trim: true,
    },
    twitterImage: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const SeoMetadata = mongoose.model("SeoMetadata", seoMetadataSchema);
