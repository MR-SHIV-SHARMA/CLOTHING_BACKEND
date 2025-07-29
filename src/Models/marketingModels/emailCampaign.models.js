import mongoose, { Schema } from "mongoose";

const emailCampaignSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      default: "",
    },
    senderName: {
      type: String,
      required: true,
      default: "Clothing Store",
    },
    senderEmail: {
      type: String,
      required: true,
    },
    recipientLists: [{
      type: String, // Could be "all_customers", "newsletter_subscribers", "specific_list"
      required: true,
    }],
    specificRecipients: [{
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        default: "",
      },
    }],
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed"],
      default: "draft",
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    stats: {
      totalSent: {
        type: Number,
        default: 0,
      },
      totalDelivered: {
        type: Number,
        default: 0,
      },
      totalOpened: {
        type: Number,
        default: 0,
      },
      totalClicked: {
        type: Number,
        default: 0,
      },
      totalBounced: {
        type: Number,
        default: 0,
      },
      totalUnsubscribed: {
        type: Number,
        default: 0,
      },
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
emailCampaignSchema.index({ status: 1 });
emailCampaignSchema.index({ scheduledAt: 1 });
emailCampaignSchema.index({ createdBy: 1 });
emailCampaignSchema.index({ tags: 1 });

export const EmailCampaign = mongoose.model("EmailCampaign", emailCampaignSchema);
