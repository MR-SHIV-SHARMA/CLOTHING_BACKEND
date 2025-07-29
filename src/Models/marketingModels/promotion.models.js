import mongoose, { Schema } from "mongoose";

const promotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["discount", "bogo", "free_shipping", "gift_with_purchase", "flash_sale"],
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount"],
      required: function() {
        return this.type === 'discount' || this.type === 'flash_sale';
      }
    },
    discountValue: {
      type: Number,
      required: function() {
        return this.type === 'discount' || this.type === 'flash_sale';
      }
    },
    maxDiscount: {
      type: Number,
      default: null, // For percentage discounts
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableProducts: [{
      type: Schema.Types.ObjectId,
      ref: "Product",
    }],
    applicableCategories: [{
      type: Schema.Types.ObjectId,
      ref: "Category",
    }],
    applicableBrands: [{
      type: Schema.Types.ObjectId,
      ref: "Brand",
    }],
    excludedProducts: [{
      type: Schema.Types.ObjectId,
      ref: "Product",
    }],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0, // Higher numbers = higher priority
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    targetAudience: {
      type: String,
      enum: ["all", "new_customers", "returning_customers", "vip_customers"],
      default: "all",
    },
    conditions: {
      minimumQuantity: {
        type: Number,
        default: 1,
      },
      customerGroups: [{
        type: String,
      }],
      regionRestrictions: [{
        type: String, // Country codes or region names
      }],
    },
    bannerImage: {
      type: String,
      default: null,
    },
    bannerText: {
      type: String,
      default: null,
    },
    isStackable: {
      type: Boolean,
      default: false, // Can be combined with other promotions
    },
    autoApply: {
      type: Boolean,
      default: false, // Automatically apply if conditions are met
    },
    tags: [{
      type: String,
      trim: true,
    }],
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
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ priority: -1 });
promotionSchema.index({ createdBy: 1 });
promotionSchema.index({ tags: 1 });

// Virtual to check if promotion is currently valid
promotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Pre-save middleware to validate dates
promotionSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    const error = new Error('End date must be after start date');
    return next(error);
  }
  next();
});

export const Promotion = mongoose.model("Promotion", promotionSchema);
