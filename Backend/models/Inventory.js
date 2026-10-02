import mongoose from "mongoose";

const movementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["in", "out"],
    required: true,
  },
  units: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    default: "Manual adjustment",
  },
  by: {
    type: String,
    default: "Admin User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const inventorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      default: "Generic",
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    categoryName: {
      type: String,
      default: "General",
      trim: true,
    },
    subCategory: {
      type: String,
      default: "",
      trim: true,
    },
    warehouse: {
      type: String,
      default: "Central Hub - Mumbai",
      trim: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 10,
    },
    maxCapacity: {
      type: Number,
      default: 100,
    },
    price: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock"],
      default: "in_stock",
      index: true,
    },
    isAddedToProducts: {
      type: Boolean,
      default: false,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    movements: [movementSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
