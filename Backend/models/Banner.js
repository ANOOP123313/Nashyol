import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: String,
    subtitle: String,
    link: String,
    linkText: String,
    type: { type: String, enum: ["card", "popup"], default: "card" },
    position: { type: String, default: "Homepage Hero" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
