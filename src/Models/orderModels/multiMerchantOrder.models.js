import mongoose from "mongoose";

// Sub-order schema for individual merchant orders
const subOrderSchema = new mongoose.Schema({
  subOrderId: {
    type: String,
    required: true,
    unique: true
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      size: { type: String },
      color: { type: String },
      productTotal: { type: Number, required: true } // quantity * price
    },
  ],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Merchant-specific order status
  status: {
    type: String,
    enum: [
      "pending",        // Waiting for merchant confirmation
      "confirmed",      // Merchant confirmed the order
      "processing",     // Merchant is preparing the order
      "ready_to_ship",  // Order is ready for pickup/shipping
      "shipped",        // Order has been shipped
      "delivered",      // Order delivered to customer
      "cancelled",      // Order cancelled by merchant/customer
      "returned",       // Order returned by customer
      "refunded"        // Order refunded
    ],
    default: "pending",
  },
  
  // Shipping details
  trackingNumber: { type: String },
  shippingMethod: { 
    type: String,
    enum: ["standard", "express", "overnight", "pickup"]
  },
  shippingCarrier: { type: String }, // FedEx, UPS, DHL, etc.
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  
  // Merchant management
  merchantNotes: { type: String },
  customerNotes: { type: String },
  
  // Status tracking for this sub-order
  statusHistory: [
    {
      status: { type: String },
      timestamp: { type: Date, default: Date.now },
      updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      },
      updatedByType: {
        type: String,
        enum: ["customer", "merchant", "admin"]
      },
      notes: { type: String }
    }
  ],
  
  // Fulfillment details
  packedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  packedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  
  // Return/refund details
  returnReason: { type: String },
  returnStatus: {
    type: String,
    enum: ["none", "requested", "approved", "received", "refunded"]
  },
  refundAmount: { type: Number, default: 0 }
  
}, { timestamps: true });

// Main order schema
const multiMerchantOrderSchema = new mongoose.Schema(
  {
    // Order identification
    orderNumber: {
      type: String,
      unique: true,
      required: true
    },
    
    // Customer information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Order composition
    subOrders: [subOrderSchema],
    merchantCount: { type: Number, default: 1 },
    isMultiMerchant: { type: Boolean, default: false },
    
    // Order totals
    subtotal: { type: Number, required: true },
    totalShipping: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    
    // Overall order status (derived from sub-orders)
    overallStatus: {
      type: String,
      enum: [
        "pending",           // All sub-orders pending
        "partially_confirmed", // Some sub-orders confirmed
        "confirmed",         // All sub-orders confirmed
        "processing",        // Some sub-orders processing
        "partially_shipped", // Some sub-orders shipped
        "shipped",           // All sub-orders shipped
        "delivered",         // All sub-orders delivered
        "cancelled",         // Order cancelled
        "partially_returned", // Some items returned
        "returned",          // All items returned
        "refunded"           // Order refunded
      ],
      default: "pending",
    },
    
    // Address information
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String }
    },
    
    billingAddress: {
      fullName: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phoneNumber: { type: String }
    },
    
    // Payment information
    paymentMethod: { 
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "stripe", "cash_on_delivery"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially_refunded"],
      default: "pending"
    },
    paymentId: { type: String }, // Payment gateway transaction ID
    
    // Customer preferences
    customerNotes: { type: String },
    specialInstructions: { type: String },
    
    // Discounts and coupons
    couponsApplied: [
      {
        couponCode: { type: String },
        discountAmount: { type: Number },
        discountType: { type: String, enum: ["percentage", "fixed"] },
        appliedTo: { type: String, enum: ["order", "shipping", "specific_merchant"] },
        merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" }
      }
    ],
    
    // Delivery expectations
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    
    // Order-level status tracking
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: { type: String },
        affectedSubOrders: [{ type: String }] // Array of subOrderIds
      }
    ],
    
    // Administrative fields
    adminNotes: { type: String },
    tags: [{ type: String }], // For categorization
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal"
    }
  },
  { timestamps: true }
);

// Indexes for performance
multiMerchantOrderSchema.index({ orderNumber: 1 });
multiMerchantOrderSchema.index({ user: 1, createdAt: -1 });
multiMerchantOrderSchema.index({ "subOrders.merchant": 1, "subOrders.status": 1 });
multiMerchantOrderSchema.index({ overallStatus: 1 });
multiMerchantOrderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
multiMerchantOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp.slice(-6)}-${random}`;
  }
  
  // Set isMultiMerchant flag
  this.isMultiMerchant = this.subOrders.length > 1;
  this.merchantCount = this.subOrders.length;
  
  next();
});

// Method to update overall status based on sub-order statuses
multiMerchantOrderSchema.methods.updateOverallStatus = function() {
  const subOrderStatuses = this.subOrders.map(sub => sub.status);
  const uniqueStatuses = [...new Set(subOrderStatuses)];
  
  if (uniqueStatuses.length === 1) {
    // All sub-orders have the same status
    this.overallStatus = uniqueStatuses[0];
  } else {
    // Mixed statuses - determine overall status
    if (subOrderStatuses.some(status => status === 'cancelled')) {
      this.overallStatus = 'cancelled';
    } else if (subOrderStatuses.every(status => ['delivered', 'returned'].includes(status))) {
      this.overallStatus = subOrderStatuses.some(status => status === 'returned') ? 'partially_returned' : 'delivered';
    } else if (subOrderStatuses.some(status => status === 'shipped')) {
      this.overallStatus = 'partially_shipped';
    } else if (subOrderStatuses.some(status => status === 'confirmed')) {
      this.overallStatus = 'partially_confirmed';
    } else {
      this.overallStatus = 'processing';
    }
  }
  
  return this.save();
};

// Method to get orders by merchant
multiMerchantOrderSchema.statics.getOrdersByMerchant = function(merchantId, status = null) {
  const matchStage = {
    "subOrders.merchant": new mongoose.Types.ObjectId(merchantId)
  };
  
  if (status) {
    matchStage["subOrders.status"] = status;
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $unwind: "$subOrders" },
    { $match: { "subOrders.merchant": new mongoose.Types.ObjectId(merchantId) } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "customer"
      }
    },
    { $unwind: "$customer" },
    {
      $project: {
        orderNumber: 1,
        subOrder: "$subOrders",
        customer: {
          fullname: "$customer.fullname",
          email: "$customer.email"
        },
        shippingAddress: 1,
        createdAt: 1,
        overallStatus: 1
      }
    }
  ]);
};

export const MultiMerchantOrder = mongoose.model("MultiMerchantOrder", multiMerchantOrderSchema);
