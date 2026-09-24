import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import Product from "../models/Product.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
  const products = await Product.find({}, "title brand subCategory price").lean();
  console.log(`Total products: ${products.length}`);
  const junk = products.filter(p => {
    const t = (p.title || "").toLowerCase();
    return (
      t.includes("test") ||
      t === "dog" ||
      t === "shirt" ||
      t === "lfjflkjf" ||
      t === "lndskjjn" ||
      t === "ps0" ||
      t === "watch"
    );
  });
  console.log(`Potential junk/test products (${junk.length}):`);
  junk.forEach(j => console.log(`  - "${j.title}" (brand: ${j.brand}, subCategory: ${j.subCategory}) id: ${j._id}`));
  process.exit(0);
}

run();
