import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import Product from "../models/Product.js";
import Category from "../models/Category.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });

  const products = await Product.find({}).lean();
  const categories = await Category.find({}).sort({ order: 1 }).lean();
  const catMap = new Map(categories.map(c => [c._id.toString(), c.name]));

  const countByCatSub = new Map();
  products.forEach(p => {
    const cName = catMap.get(p.category?.toString()) || "Unknown";
    const key = `${cName}__${p.subCategory}`;
    countByCatSub.set(key, (countByCatSub.get(key) || 0) + 1);
  });

  console.log(`Total products in database: ${products.length}\n`);

  let emptySubcats = 0;
  let populatedSubcats = 0;

  for (const c of categories) {
    console.log(`\n=================== ${c.name} ===================`);
    for (const sc of c.subCategories) {
      const key = `${c.name}__${sc.name}`;
      const count = countByCatSub.get(key) || 0;
      if (count > 0) {
        console.log(`  ✅ ${sc.name} (${count} products)`);
        populatedSubcats++;
      } else {
        console.log(`  ❌ ${sc.name} (0 products - NEEDS REAL DATA)`);
        emptySubcats++;
      }
    }
  }

  console.log(`\nSummary: ${populatedSubcats} subcategories populated, ${emptySubcats} subcategories empty.`);
  process.exit(0);
}

run();
