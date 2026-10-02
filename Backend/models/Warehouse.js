import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    capacity: {
      type: Number,
      default: 10000,
    },
    currentOccupancy: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Warehouse", warehouseSchema);
