import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        reason: { type: String, default: "" },
        condition: {
          type: String,
          enum: ["new", "used", "damaged"],
          default: "used",
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "refunded"],
      default: "pending",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundMethod: {
      type: String,
      default: "Original Payment Method",
    },
    deliveryStatus: {
      type: String,
      enum: ["Pickup Pending", "In Transit", "Delivered to Warehouse", "Delivered", "N/A"],
      default: "Pickup Pending",
    },
    tracking: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Return", returnSchema);