import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Ensure DNS resolution for Windows MongoDB Atlas SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const cleanSlug = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CATEGORY_TAXONOMY = [
  {
    name: "Electronics",
    slug: "electronics",
    order: 1,
    icon: "💻",
    description: "Smartphones, Laptops, Audio Gear & Smart Accessories",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
    subCategories: [
      { name: "Smartphones", slug: "smartphones", icon: "📱", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
      { name: "Laptops & Computers", slug: "laptops", icon: "💻", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
      { name: "Headphones & Audio", slug: "audio", icon: "🎧", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
      { name: "Smart Watches", slug: "smartwatches", icon: "⌚", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400" },
      { name: "Cameras & Photography", slug: "cameras", icon: "📷", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400" },
      { name: "Gaming & Consoles", slug: "gaming", icon: "🎮", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400" },
      { name: "Tablets", slug: "tablets", icon: "📱", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400" },
      { name: "Smart Home", slug: "smart-home", icon: "🏡", image: "https://images.unsplash.com/photo-1558089687-e5c0c58d7c49?w=400" },
      { name: "TV & Video", slug: "tv-video", icon: "📺", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400" },
      { name: "Computer Accessories", slug: "accessories", icon: "⌨️", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" },
      { name: "Audio & Speakers", slug: "speakers", icon: "🔊", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
      { name: "Power Banks & Storage", slug: "storage-power", icon: "🔋", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    order: 2,
    icon: "👕",
    description: "Trending Men & Women Apparel, Shoes, and Accessories",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600",
    subCategories: [
      { name: "T-Shirts & Shirts", slug: "shirts", icon: "👕", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
      { name: "Jeans & Trousers", slug: "jeans", icon: "👖", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
      { name: "Dresses & Tops", slug: "dresses", icon: "👗", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
      { name: "Jackets & Coats", slug: "jackets", icon: "🧥", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
      { name: "Shoes & Footwear", slug: "footwear", icon: "👟", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
      { name: "Bags & Luggage", slug: "bags", icon: "👜", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400" },
      { name: "Watches", slug: "watches", icon: "⌚", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
      { name: "Sunglasses & Eyewear", slug: "sunglasses", icon: "🕶️", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
      { name: "Kurtas & Ethnic Wear", slug: "ethnic-wear", icon: "👘", image: "https://images.unsplash.com/photo-1727835523550-18478cacefa2?w=400" },
      { name: "Activewear & Sports", slug: "activewear", icon: "🏃", image: "https://images.unsplash.com/photo-1695459468644-717c8ae17eed?w=400" },
    ],
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    order: 3,
    icon: "🏡",
    description: "Modern Living Room, Bedroom & Kitchen Essentials",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    subCategories: [
      { name: "Furniture", slug: "furniture", icon: "🛋️", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" },
      { name: "Bedding & Mattresses", slug: "bedding", icon: "🛏️", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
      { name: "Lighting", slug: "lighting", icon: "💡", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400" },
      { name: "Home Decor", slug: "decor", icon: "🖼️", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400" },
      { name: "Kitchen & Dining", slug: "kitchen", icon: "🍳", image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400" },
      { name: "Storage & Organization", slug: "storage", icon: "📦", image: "https://images.unsplash.com/photo-1595428773653-30a35a1c7a1b?w=400" },
      { name: "Rugs & Carpets", slug: "rugs", icon: "🧶", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400" },
      { name: "Curtains & Blinds", slug: "curtains", icon: "🪟", image: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400" },
      { name: "Plants & Garden", slug: "plants", icon: "🪴", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400" },
      { name: "Bathroom Essentials", slug: "bathroom", icon: "🛁", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    order: 4,
    icon: "⚽",
    description: "Professional Sports Equipment, Activewear & Outdoor Gear",
    image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600",
    subCategories: [
      { name: "Running & Athletic Shoes", slug: "running-shoes", icon: "👟", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
      { name: "Fitness & Gym Equipment", slug: "fitness", icon: "🏋️", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400" },
      { name: "Dumbbells & Weights", slug: "dumbbells", icon: "🏋️‍♂️", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400" },
      { name: "Yoga Mats & Gear", slug: "yoga", icon: "🧘", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400" },
      { name: "Bicycles & Cycling", slug: "bicycles", icon: "🚲", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400" },
      { name: "Sports Apparel", slug: "sports-apparel", icon: "🎽", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400" },
      { name: "Tennis & Racket Sports", slug: "tennis", icon: "🎾", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400" },
      { name: "Outdoor & Camping", slug: "outdoor-gear", icon: "⛺", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty",
    order: 5,
    icon: "💄",
    description: "Skincare, Cosmetics, Perfumes, & Wellness",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
    subCategories: [
      { name: "Skincare", slug: "skincare", icon: "🧴", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
      { name: "Makeup & Cosmetics", slug: "makeup", icon: "💄", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400" },
      { name: "Perfumes & Fragrances", slug: "perfumes", icon: "🌸", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400" },
      { name: "Hair Care", slug: "hair-care", icon: "💇", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400" },
      { name: "Face Masks & Scrubs", slug: "face-masks", icon: "🧖", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400" },
      { name: "Lip Care & Lipstick", slug: "lipstick", icon: "💋", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400" },
      { name: "Eye Makeup", slug: "eye-makeup", icon: "👁️", image: "https://images.unsplash.com/photo-1631214524020-7e18db7f0796?w=400" },
      { name: "Bath & Body", slug: "bath-body", icon: "🧼", image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400" },
    ],
  },
  {
    name: "Books & Media",
    slug: "books",
    order: 6,
    icon: "📚",
    description: "Fiction, Non-Fiction, Self-Help, Business, & Academic Books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
    subCategories: [
      { name: "Fiction", slug: "fiction", icon: "📖", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
      { name: "Non-Fiction", slug: "non-fiction", icon: "📚", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400" },
      { name: "Self-Help & Business", slug: "self-help", icon: "💡", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
      { name: "Biographies & Memoirs", slug: "biographies", icon: "✍️", image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400" },
      { name: "Science & Technology", slug: "science", icon: "🔬", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
      { name: "History & Politics", slug: "history", icon: "🏛️", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400" },
      { name: "Children & Young Adult", slug: "children", icon: "🎨", image: "https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=400" },
      { name: "Comics & Graphic Novels", slug: "comics", icon: "🦸", image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=400" },
    ],
  },
];

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
    console.log("Connected successfully to database: nashyol");

    const categoryMap = new Map();

    // 1. Normalize the 6 Core Categories
    for (const catDef of CATEGORY_TAXONOMY) {
      // Find existing category matching either slug, or name variations
      let existing = await Category.findOne({
        $or: [
          { slug: catDef.slug },
          { name: new RegExp(`^${catDef.name}$`, "i") },
          ...(catDef.slug === "books" ? [{ name: /^books$/i }, { slug: "books" }] : []),
          ...(catDef.slug === "beauty" ? [{ name: /beauty/i }, { slug: "beauty" }] : []),
          ...(catDef.slug === "sports-outdoors" ? [{ name: /sports/i }, { slug: /sports/i }] : []),
        ],
      });

      if (existing) {
        console.log(`Updating existing category: "${existing.name}" -> "${catDef.name}"`);
        existing.name = catDef.name;
        existing.slug = catDef.slug;
        existing.order = catDef.order;
        existing.icon = catDef.icon;
        existing.description = catDef.description;
        if (!existing.image || existing.image.includes("placehold")) {
          existing.image = catDef.image;
        }
        existing.isActive = true;

        // Clean up subcategories: remove test junk like "ovjdsoijv", update with full taxonomy
        existing.subCategories = catDef.subCategories.map((sc) => ({
          name: sc.name,
          slug: sc.slug,
          icon: sc.icon,
          image: sc.image,
          description: sc.description || "",
          isActive: true,
        }));

        await existing.save();
        categoryMap.set(catDef.name, existing);
        categoryMap.set(catDef.slug, existing);
      } else {
        console.log(`Creating new core category: "${catDef.name}"`);
        const created = await Category.create({
          name: catDef.name,
          slug: catDef.slug,
          order: catDef.order,
          icon: catDef.icon,
          description: catDef.description,
          image: catDef.image,
          isActive: true,
          subCategories: catDef.subCategories.map((sc) => ({
            name: sc.name,
            slug: sc.slug,
            icon: sc.icon,
            image: sc.image,
            description: sc.description || "",
            isActive: true,
          })),
        });
        categoryMap.set(catDef.name, created);
        categoryMap.set(catDef.slug, created);
      }
    }

    // 2. Reassign any orphaned categories, e.g. "gaming"
    const gamingCat = await Category.findOne({ slug: "gaming" });
    const electronicsCat = categoryMap.get("Electronics");

    if (gamingCat && electronicsCat) {
      console.log(`Migrating products from standalone category "gaming" into Electronics -> Gaming & Consoles...`);
      const migrated = await Product.updateMany(
        { category: gamingCat._id },
        {
          $set: {
            category: electronicsCat._id,
            subCategory: "Gaming & Consoles",
          },
        }
      );
      console.log(`Migrated ${migrated.modifiedCount} products from "gaming" category.`);
      await Category.deleteOne({ _id: gamingCat._id });
      console.log(`Removed redundant "gaming" category document.`);
    }

    // 3. Intelligently assign Subcategories to all products
    console.log("Analyzing and assigning subcategories to existing products...");
    const products = await Product.find({}).populate("category");

    let updatedCount = 0;

    for (const p of products) {
      const catName = p.category?.name || "";
      const titleLower = (p.title || "").toLowerCase();
      let assignedSub = p.subCategory || "";

      // Electronics
      if (catName.includes("Electronics")) {
        if (titleLower.includes("headphone") || titleLower.includes("audio") || titleLower.includes("wh-1000")) assignedSub = "Headphones & Audio";
        else if (titleLower.includes("macbook") || titleLower.includes("laptop") || titleLower.includes("computer")) assignedSub = "Laptops & Computers";
        else if (titleLower.includes("phone")) assignedSub = "Smartphones";
        else if (titleLower.includes("watch")) assignedSub = "Smart Watches";
        else if (titleLower.includes("camera")) assignedSub = "Cameras & Photography";
        else if (titleLower.includes("ps0") || titleLower.includes("gaming") || titleLower.includes("playstation")) assignedSub = "Gaming & Consoles";
        else if (titleLower.includes("tablet") || titleLower.includes("ipad")) assignedSub = "Tablets";
        else assignedSub = "Smartphones"; // default for tech test products
      }
      // Fashion
      else if (catName.includes("Fashion")) {
        if (titleLower.includes("shirt") || titleLower.includes("oxford")) assignedSub = "T-Shirts & Shirts";
        else if (titleLower.includes("dress")) assignedSub = "Dresses & Tops";
        else if (titleLower.includes("jacket") || titleLower.includes("coat")) assignedSub = "Jackets & Coats";
        else if (titleLower.includes("bag") || titleLower.includes("crossbody")) assignedSub = "Bags & Luggage";
        else if (titleLower.includes("watch")) assignedSub = "Watches";
        else if (titleLower.includes("shoe") || titleLower.includes("footwear")) assignedSub = "Shoes & Footwear";
        else if (titleLower.includes("jean") || titleLower.includes("trouser")) assignedSub = "Jeans & Trousers";
        else assignedSub = "T-Shirts & Shirts";
      }
      // Home & Garden
      else if (catName.includes("Home") || catName.includes("Garden")) {
        if (titleLower.includes("lamp") || titleLower.includes("light")) assignedSub = "Lighting";
        else if (titleLower.includes("plant") || titleLower.includes("pot")) assignedSub = "Plants & Garden";
        else if (titleLower.includes("chair") || titleLower.includes("armchair") || titleLower.includes("furniture") || titleLower.includes("sofa")) assignedSub = "Furniture";
        else if (titleLower.includes("bed")) assignedSub = "Bedding & Mattresses";
        else if (titleLower.includes("kitchen")) assignedSub = "Kitchen & Dining";
        else assignedSub = "Home Decor";
      }
      // Sports & Outdoors
      else if (catName.includes("Sport")) {
        if (titleLower.includes("dumbbell") || titleLower.includes("weight")) assignedSub = "Dumbbells & Weights";
        else if (titleLower.includes("backpack") || titleLower.includes("camp") || titleLower.includes("hiking")) assignedSub = "Outdoor & Camping";
        else if (titleLower.includes("racket") || titleLower.includes("tennis")) assignedSub = "Tennis & Racket Sports";
        else if (titleLower.includes("yoga")) assignedSub = "Yoga Mats & Gear";
        else if (titleLower.includes("bicycle") || titleLower.includes("cycling")) assignedSub = "Bicycles & Cycling";
        else assignedSub = "Fitness & Gym Equipment";
      }
      // Beauty & Personal Care
      else if (catName.includes("Beauty")) {
        if (titleLower.includes("lipstick") || titleLower.includes("lip")) assignedSub = "Lip Care & Lipstick";
        else if (titleLower.includes("serum") || titleLower.includes("mist") || titleLower.includes("toner") || titleLower.includes("wash") || titleLower.includes("cream")) assignedSub = "Skincare";
        else if (titleLower.includes("perfume") || titleLower.includes("fragrance")) assignedSub = "Perfumes & Fragrances";
        else if (titleLower.includes("hair")) assignedSub = "Hair Care";
        else assignedSub = "Skincare";
      }
      // Books & Media
      else if (catName.includes("Book")) {
        if (titleLower.includes("mindful") || titleLower.includes("leader") || titleLower.includes("business")) assignedSub = "Self-Help & Business";
        else if (titleLower.includes("architecture") || titleLower.includes("microservices") || titleLower.includes("science")) assignedSub = "Science & Technology";
        else if (titleLower.includes("visionary") || titleLower.includes("biograph")) assignedSub = "Biographies & Memoirs";
        else assignedSub = "Fiction";
      }

      if (assignedSub && assignedSub !== p.subCategory) {
        p.subCategory = assignedSub;
        await p.save();
        updatedCount++;
        console.log(`Product [${p.title}] -> Category: "${catName}" | Subcategory: "${assignedSub}"`);
      }
    }

    console.log(`✅ Finished: Updated ${updatedCount} products with logical subcategories.`);

    // 4. Output final verification count
    const allCategories = await Category.find({}).sort({ order: 1 });
    console.log("\n=== FINAL NORMALIZED CATEGORIES ===");
    for (const c of allCategories) {
      const pCount = await Product.countDocuments({ category: c._id });
      console.log(`• [${c.order}] ${c.icon} ${c.name} (${c.slug}) - ${pCount} products, ${c.subCategories.length} subcategories`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
