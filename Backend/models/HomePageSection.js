import mongoose from "mongoose";

const homePageSectionItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    name: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    badge: { type: String, default: "" },
    badgeColor: { type: String, default: "" },
    emoji: { type: String, default: "" },
    price: { type: String, default: "" },
    discount: { type: String, default: "" },
    offer: { type: String, default: "" },
    buttonText: { type: String, default: "" },
    buttonLink: { type: String, default: "" },
    link: { type: String, default: "" },
    gradient: { type: String, default: "" },
    backgroundColor: { type: String, default: "" },
    icon: { type: String, default: "" }, // e.g. "Truck", "RotateCcw", "Shield", "Headphones"
    count: { type: String, default: "" },
    type: { type: String, default: "" }, // e.g. "hero", "banner", "square", "wide" for ad banners
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: true }
);

const homePageSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sectionType: {
      type: String,
      required: true,
      enum: [
        "hero_banner",
        "service_features",
        "promo_carousel",
        "quick_categories",
        "loved_ones",
        "promotional_cards",
        "clearance_offers",
        "shop_by_category",
        "special_offers",
        "category_products",
        "product_grid",
        "featured_products",
        "rewards",
        "newsletter",
        "footer",
        "custom",
      ],
    },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    badge: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    settings: {
      sourceType: {
        type: String,
        enum: ["category", "manual", "latest", "featured", "offers", "best_selling"],
        default: "category",
      },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },
      categoryName: { type: String, default: "" },
      productLimit: { type: Number, default: 8 },
      sort: { type: String, default: "-createdAt" },
      viewAllLink: { type: String, default: "" },
      backgroundColor: { type: String, default: "" },
      textColor: { type: String, default: "" },
      buttonText: { type: String, default: "" },
      buttonLink: { type: String, default: "" },
      placeholder: { type: String, default: "" },
      products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
    },
    items: [homePageSectionItemSchema],
  },
  { timestamps: true }
);

homePageSectionSchema.index({ displayOrder: 1, isActive: 1 });

export default mongoose.model("HomePageSection", homePageSectionSchema);
