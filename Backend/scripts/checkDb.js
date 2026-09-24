import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

async function check() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
  const users = await User.find({}).limit(10).lean();
  const vendors = await Vendor.find({}).limit(5).lean();
  const sampleProduct = await Product.findOne({}).lean();
  const categories = await Category.find({}).lean();

  console.log("=== USERS ===");
  users.forEach(u => console.log(`User: ${u._id} | ${u.name} | ${u.role} | ${u.phone || u.email}`));

  console.log("\n=== VENDORS ===");
  vendors.forEach(v => console.log(`Vendor: ${v._id} | ${v.storeName}`));

  console.log("\n=== SAMPLE PRODUCT ===");
  console.log("Product:", sampleProduct?.title);
  console.log("CreatedBy:", sampleProduct?.createdBy);
  console.log("Variants:", JSON.stringify(sampleProduct?.variants?.[0], null, 2));
  console.log("Specifications:", sampleProduct?.specifications);
  console.log("Reviews:", sampleProduct?.reviews);

  console.log("\n=== CATEGORIES & SUBCATEGORIES ===");
  categories.forEach(c => {
    console.log(`\n• ${c.name} (${c.subCategories.length} subcategories):`);
    c.subCategories.forEach(sc => console.log(`   - ${sc.name}`));
  });

  process.exit(0);
}

check();
