import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "WhatsApp User",
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false, // never return password by default
    },

    role: {
      type: String,
      enum: ["user", "admin", "vendor", "superadmin", "customer"],
      default: "user",
      index: true,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    referralCount: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    // OTP fields for WhatsApp verification / password reset
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
    },
    otpResendAfter: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  // If already hashed (bcrypt hashes start with $2a$ or $2b$), don't rehash
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate referral code before saving
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex");
  }
  next();
});

export default mongoose.model("User", userSchema);