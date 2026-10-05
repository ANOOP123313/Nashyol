import mongoose from "mongoose";
import crypto from "crypto";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        sku: String,
        title: String,
        image: String,
        price: Number,
        quantity: Number,
        deliveryCharge: { type: Number, default: 0 },
        vendorId: mongoose.Schema.Types.ObjectId,
        attributes: [
          {
            name: String,
            value: String,
          }
        ],
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    codFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "return_requested", "returned", "refunded"],
      default: "pending",
      index: true,
    },

    returnStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected", "refunded"],
      default: "none",
      index: true,
    },

    returnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Return",
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: Date,

    cancelledBy: {
      type: String,
      default: "",
    },

    address: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      index: true,
    },

    paymentId: String,

    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    referralDiscount: { type: Number, default: 0 },
    pointsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.orderNumber = `ORD-${hex}`;
  }
  if (!this.invoiceNumber) {
    const hex = this.orderNumber ? this.orderNumber.replace("ORD-", "") : crypto.randomBytes(3).toString("hex").toUpperCase();
    this.invoiceNumber = `INV-${hex}`;
  }
  next();
});

orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);