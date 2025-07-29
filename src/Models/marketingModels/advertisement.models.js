import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  displayDuration: {
    type: Number,
    required: true,
    min: [1, "Display duration must be at least 1 second."],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  targetAudience: {
    type: [String], // e.g., ['male', '18-25']
    default: [],
  },
  budget: {
    type: Number,
    required: true,
  },
  pricePerImpression: {
    type: Number,
    required: true,
  },
  placement: {
    type: String, // e.g., 'homepage', 'category-page'
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
    required: true,
  },
  performance: {
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  analytics: {
    type: mongoose.Schema.Types.Mixed, // For storing analytics JSON data
    default: {},
  },
  advertiser: {
    name: {
      type: String,
      required: true,
    },
    contactInfo: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Advertisement = mongoose.model("Advertisement", advertisementSchema);
export default Advertisement;
