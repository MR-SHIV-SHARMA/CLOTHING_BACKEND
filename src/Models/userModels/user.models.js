import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

// Address sub-schema
const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'billing', 'shipping', 'other'],
    default: 'home'
  },
  label: { type: String }, // Custom label like "Mom's House", "Office"
  fullName: { type: String, required: true },
  street: { type: String, required: true },
  apartment: { type: String }, // Apt, Suite, Floor
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'US' },
  phoneNumber: { type: String },
  isDefault: { type: Boolean, default: false },
  deliveryInstructions: { type: String },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { timestamps: true });

// Preference sub-schema
const preferencesSchema = new mongoose.Schema({
  // Shopping preferences
  favoriteCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  favoriteStyles: [{ type: String }],
  favoriteBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  sizePreferences: {
    tops: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
    bottoms: { type: String },
    shoes: { type: String },
    dresses: { type: String }
  },
  
  // Communication preferences
  notifications: {
    email: {
      promotions: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: false },
      priceDrops: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false }
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false }
    },
    push: {
      enabled: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    }
  },
  
  // Privacy settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'private'
    },
    shareWishlist: { type: Boolean, default: false },
    allowRecommendations: { type: Boolean, default: true },
    dataCollection: { type: Boolean, default: true }
  },
  
  // Language and currency
  language: { type: String, default: 'en' },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' }
});

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    fullname: {
      type: String,
      required: [true, "Please enter your full name"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      lowercase: true,
      unique: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"]
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false // Don't include password in queries by default
    },
    
    // Contact Information
    phoneNumber: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v);
        },
        message: "Please enter a valid phone number"
      }
    },
    alternatePhone: { type: String },
    
    // Profile Information
    avatar: {
      url: { type: String },
      publicId: { type: String } // For Cloudinary
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v < new Date();
        },
        message: "Date of birth cannot be in the future"
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"]
    },
    
    // Account Status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    
    // Authentication & Security
    refreshToken: { type: String },
    role: {
      type: String,
      enum: ["admin", "super-admin", "merchant", "customer"],
      default: "customer",
      required: true,
    },
  isDefaultSuperAdmin: { type: Boolean, default: false }, // Ensure this field is defined
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
  },
  
  // Security Features
  
  // Two-Factor Authentication
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    secret: { type: String },
    backupCodes: [
      {
        code: { type: String },
        used: { type: Boolean, default: false }
      }
    ],
    lastUsed: { type: Date }
  },
  
  // Account Lockout
  accountLockout: {
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLogin: { type: Date }
  },
  
  // Security Logs
  securityLogs: [
    {
      action: {
        type: String,
        enum: ['login', 'logout', 'password_change', '2fa_enabled', '2fa_disabled', 'account_locked', 'account_unlocked']
      },
      timestamp: { type: Date, default: Date.now },
      ipAddress: { type: String },
      userAgent: { type: String },
      success: { type: Boolean }
    }
  ],
  
  // Session Management
  activeSessions: [
    {
      sessionId: { type: String },
      deviceInfo: { type: String },
      ipAddress: { type: String },
      lastActivity: { type: Date, default: Date.now },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  
  // Password History (to prevent reuse)
  passwordHistory: [
    {
      hash: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  
  // Email verification
  emailVerification: {
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date }
  },
  
  // Social Media Providers
  socialProviders: {
    google: {
      id: { type: String },
      connected: { type: Boolean, default: false },
      connectedAt: { type: Date },
      disconnectedAt: { type: Date }
    },
    facebook: {
      id: { type: String },
      connected: { type: Boolean, default: false },
      connectedAt: { type: Date },
      disconnectedAt: { type: Date }
    },
    twitter: {
      id: { type: String },
      connected: { type: Boolean, default: false },
      connectedAt: { type: Date },
      disconnectedAt: { type: Date }
    }
  },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
