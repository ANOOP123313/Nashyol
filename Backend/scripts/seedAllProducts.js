import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import bcrypt from "bcryptjs";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

import { REAL_CUSTOMERS } from "./seedCustomers.js";
import { electronicsProducts } from "./data/electronicsProducts.js";
import { fashionProducts } from "./data/fashionProducts.js";
import { homeGardenProducts } from "./data/homeGardenProducts.js";
import { sportsProducts } from "./data/sportsProducts.js";
import { beautyProducts } from "./data/beautyProducts.js";
import { booksProducts } from "./data/booksProducts.js";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function seed() {
  console.log("Connecting to MongoDB Atlas 'nashyol'...");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
  console.log("Connected successfully!\n");

  // 1. Fetch or create Admin user for createdBy
  let admin = await User.findOne({ role: { $in: ["admin", "superadmin"] } });
  if (!admin) {
    console.log("Admin not found, checking by email admin@naashyol.com...");
    admin = await User.findOne({ email: "admin@naashyol.com" });
  }
  if (!admin) {
    console.error("FATAL: No Admin user found in database!");
    process.exit(1);
  }
  console.log(`Using Admin: ${admin.name || admin.email} (${admin._id})`);

  // 2. Fetch or create default Vendor
  let vendor = await Vendor.findOne();
  if (!vendor) {
    console.log("Creating default vendor...");
    vendor = await Vendor.create({
      storeName: "Global Premium Logistics",
      email: "logistics@globalpremium.com",
      phone: "+919876543210",
      status: "active",
      isActive: true,
    });
  }
  console.log(`Using Vendor: ${vendor.storeName} (${vendor._id})`);

  // 3. Upsert Real Customer Users
  console.log("\nUpserting 12 real customer profiles for authentic reviews...");
  const hashedPassword = await bcrypt.hash("Customer@12345", 10);
  const customerMap = new Map();

  for (const c of REAL_CUSTOMERS) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      user = await User.create({
        name: c.name,
        email: c.email,
        phone: c.phone,
        password: hashedPassword,
        role: "user",
        isPhoneVerified: true,
        isVerified: true,
      });
      console.log(`  + Created customer: ${c.name} (${c.email})`);
    } else {
      user.name = c.name;
      user.phone = c.phone;
      user.role = "user";
      user.isVerified = true;
      user.isPhoneVerified = true;
      await user.save();
    }
    customerMap.set(c.name.toLowerCase().trim(), user);
    customerMap.set(c.email.toLowerCase().trim(), user);
  }

  const allCustomers = Array.from(customerMap.values());

  // 4. Fetch Categories & Map
  const categories = await Category.find({}).sort({ order: 1 });
  const categoryMap = new Map(categories.map((c) => [c.name.trim(), c]));

  console.log(`Found ${categories.length} core categories in DB.`);

  // 5. Aggregate all dataset products
  const categoryDatasets = [
    { catName: "Electronics", items: electronicsProducts },
    { catName: "Fashion", items: fashionProducts },
    { catName: "Home & Garden", items: homeGardenProducts },
    { catName: "Sports & Outdoors", items: sportsProducts },
    { catName: "Beauty & Personal Care", items: beautyProducts },
    { catName: "Books & Media", items: booksProducts },
  ];

  let seededCount = 0;
  let reviewsCreated = 0;
  let ordersCreated = 0;

  console.log("\n── Seeding Real Products with Specs, Variants & Reviews ──");

  for (const dataset of categoryDatasets) {
    const categoryDoc = categoryMap.get(dataset.catName);
    if (!categoryDoc) {
      console.error(`ERROR: Category '${dataset.catName}' not found in database!`);
      continue;
    }

    console.log(`\nProcessing Category: ${dataset.catName} (${dataset.items.length} products)...`);

    for (const p of dataset.items) {
      // Check if product exists by title or matching subcategory
      let product = await Product.findOne({ title: p.title });
      const slug = `${slugify(p.title)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const primaryPrice = p.offerPrice || p.price;
      const primaryVariant = p.variants?.[0] || {
        sku: `${slugify(p.brand).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        sellingPrice: primaryPrice,
        currentVendorPrice: Math.round(primaryPrice * 0.75),
        currentStock: 50,
        weight: 1,
        isActive: true,
      };

      const variants = (p.variants || [primaryVariant]).map((v) => ({
        ...v,
        currentVendor: vendor._id,
        currentVendorPrice: v.currentVendorPrice || Math.round((v.sellingPrice || primaryPrice) * 0.75),
        currentStock: v.currentStock ?? 50,
        isActive: true,
      }));

      if (!product) {
        product = new Product({
          title: p.title,
          brand: p.brand,
          category: categoryDoc._id,
          subCategory: p.subCategory,
          description: p.description,
          price: p.price,
          offerPrice: p.offerPrice,
          images: p.images,
          featured: p.featured ?? true,
          specifications: p.specifications || [],
          variants,
          seo: {
            title: `${p.title} | Buy Online at Best Price`,
            description: p.description.slice(0, 155),
            slug,
          },
          isActive: true,
          status: "active",
          createdBy: admin._id,
          reviews: [],
        });
        await product.save();
        seededCount++;
      } else {
        // Update product with rich specs and normalize subCategory
        product.category = categoryDoc._id;
        product.subCategory = p.subCategory;
        product.brand = p.brand;
        product.description = p.description;
        product.price = p.price;
        product.offerPrice = p.offerPrice;
        product.images = p.images;
        product.featured = p.featured ?? true;
        product.specifications = p.specifications || product.specifications;
        product.variants = variants;
        product.isActive = true;
        product.createdBy = admin._id;
        await product.save();
        seededCount++;
      }

      // ── Process and Attach Real Reviews ──
      const embeddedReviews = [];

      for (const rev of p.reviews || []) {
        let customerUser =
          customerMap.get((rev.customerName || "").toLowerCase().trim()) ||
          allCustomers[Math.floor(Math.random() * allCustomers.length)];

        const reviewDaysAgo = Math.floor(Math.random() * 25 + 1);
        const reviewDate = new Date(Date.now() - reviewDaysAgo * 86400000);

        // Standalone Review document
        const reviewDoc = await Review.findOneAndUpdate(
          { product: product._id, user: customerUser._id },
          {
            product: product._id,
            user: customerUser._id,
            rating: rev.rating || 5,
            title: rev.comment.slice(0, 32) + "...",
            comment: rev.comment,
            isApproved: true,
            status: "approved",
            createdAt: reviewDate,
          },
          { upsert: true, new: true }
        );
        reviewsCreated++;

        embeddedReviews.push({
          product: product._id,
          user: customerUser._id,
          rating: rev.rating || 5,
          comment: rev.comment,
          createdAt: reviewDate,
        });

        // Create delivered verified purchase Order for this customer
        const existingOrder = await Order.findOne({
          user: customerUser._id,
          "items.productId": product._id,
        });

        if (!existingOrder) {
          await Order.create({
            user: customerUser._id,
            items: [
              {
                productId: product._id,
                sku: variants[0]?.sku || "SKU-AUTO",
                title: product.title,
                image: product.images[0] || "",
                price: product.offerPrice || product.price,
                quantity: 1,
                deliveryCharge: 0,
                vendorId: vendor._id,
              },
            ],
            totalAmount: product.offerPrice || product.price,
            deliveryCharge: 0,
            paymentMethod: "Credit Card / UPI",
            paymentStatus: "paid",
            orderStatus: "delivered",
            address: {
              fullName: customerUser.name,
              phone: customerUser.phone,
              street: "Flat 402, Green Meadows Avenue",
              city: "Bengaluru",
              state: "Karnataka",
              pincode: "560001",
            },
            createdAt: new Date(reviewDate.getTime() - 4 * 86400000), // Ordered 4 days before review
          });
          ordersCreated++;
        }
      }

      // Update product's embedded reviews array
      product.reviews = embeddedReviews;
      await product.save();

      console.log(`  ✓ [${p.subCategory}] ${p.title} (${embeddedReviews.length} reviews attached)`);
    }
  }

  // 6. Enrich any pre-existing products in the DB that lack reviews or specs
  console.log("\n── Checking pre-existing products for missing specs or reviews ──");
  const olderProducts = await Product.find({
    "reviews.0": { $exists: false },
  });

  console.log(`Found ${olderProducts.length} older products without reviews.`);
  for (const op of olderProducts) {
    const cust1 = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const cust2 = allCustomers[(Math.floor(Math.random() * allCustomers.length) + 1) % allCustomers.length];

    const sampleReviews = [
      {
        user: cust1,
        rating: 5,
        comment: `Excellent quality, exactly as described. The build feels premium and shipping was very fast.`,
      },
      {
        user: cust2,
        rating: 4,
        comment: `Very satisfied with this purchase. Good value for money and performs reliably.`,
      },
    ];

    const emb = [];
    for (const sr of sampleReviews) {
      const rDate = new Date(Date.now() - Math.floor(Math.random() * 20 + 2) * 86400000);
      await Review.findOneAndUpdate(
        { product: op._id, user: sr.user._id },
        {
          product: op._id,
          user: sr.user._id,
          rating: sr.rating,
          title: sr.comment.slice(0, 32) + "...",
          comment: sr.comment,
          isApproved: true,
          status: "approved",
          createdAt: rDate,
        },
        { upsert: true, new: true }
      );
      emb.push({
        product: op._id,
        user: sr.user._id,
        rating: sr.rating,
        comment: sr.comment,
        createdAt: rDate,
      });
      reviewsCreated++;

      // Verified order
      const hasOrd = await Order.findOne({ user: sr.user._id, "items.productId": op._id });
      if (!hasOrd) {
        await Order.create({
          user: sr.user._id,
          items: [
            {
              productId: op._id,
              sku: op.variants?.[0]?.sku || "SKU-EXISTING",
              title: op.title,
              image: op.images?.[0] || "",
              price: op.offerPrice || op.price || 999,
              quantity: 1,
              vendorId: vendor._id,
            },
          ],
          totalAmount: op.offerPrice || op.price || 999,
          paymentMethod: "UPI",
          paymentStatus: "paid",
          orderStatus: "delivered",
          address: {
            fullName: sr.user.name,
            phone: sr.user.phone,
            street: "Park Street Residency",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
          },
          createdAt: new Date(rDate.getTime() - 3 * 86400000),
        });
        ordersCreated++;
      }
    }

    op.reviews = emb;
    if (!op.specifications || op.specifications.length === 0) {
      op.specifications = [
        { key: "Brand", value: op.brand || "Authentic Certified" },
        { key: "Category", value: op.subCategory || "General" },
        { key: "Condition", value: "Brand New 100% Genuine" },
        { key: "Warranty", value: "1 Year Official Manufacturer Warranty" },
      ];
    }
    await op.save();
    console.log(`  Enriched older product: ${op.title} with reviews & specs.`);
  }

  // 7. Verify 100% Subcategory Coverage
  console.log("\n=================== FINAL COVERAGE REPORT ===================");
  const finalProducts = await Product.find({}).lean();
  const finalCategories = await Category.find({}).sort({ order: 1 }).lean();
  const finalCatMap = new Map(finalCategories.map((c) => [c._id.toString(), c.name]));

  const countByCatSub = new Map();
  finalProducts.forEach((p) => {
    const cName = finalCatMap.get(p.category?.toString()) || "Unknown";
    const key = `${cName}__${p.subCategory}`;
    countByCatSub.set(key, (countByCatSub.get(key) || 0) + 1);
  });

  let emptyCount = 0;
  let populatedCount = 0;

  for (const c of finalCategories) {
    console.log(`\n── ${c.name} ──`);
    for (const sc of c.subCategories) {
      const key = `${c.name}__${sc.name}`;
      const count = countByCatSub.get(key) || 0;
      if (count > 0) {
        console.log(`  ✅ ${sc.name.padEnd(35)} : ${count} products`);
        populatedCount++;
      } else {
        console.log(`  ❌ ${sc.name.padEnd(35)} : 0 products [EMPTY]`);
        emptyCount++;
      }
    }
  }

  console.log("\n=============================================================");
  console.log(`Total Products in Catalog   : ${finalProducts.length}`);
  console.log(`Subcategories Populated     : ${populatedCount} / ${populatedCount + emptyCount}`);
  console.log(`Subcategories Empty         : ${emptyCount}`);
  console.log(`Total Reviews Seeded        : ${reviewsCreated}`);
  console.log(`Total Verified Orders Created: ${ordersCreated}`);
  console.log("=============================================================\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("FATAL Seed error:", err);
  process.exit(1);
});
