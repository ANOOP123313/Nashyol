import mongoose from "mongoose";

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

    paymentMethod: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },

    address: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentId: String,

    couponCode: String,
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);