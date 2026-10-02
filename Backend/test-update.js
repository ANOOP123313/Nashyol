import mongoose from "mongoose";
import Inventory from "./models/Inventory.js";
import Product from "./models/Product.js";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/nashyol");
  console.log("Connected");

  const product = await Product.findOne().populate('variants');
  if (!product) { console.log("No product"); process.exit(0); }

  console.log("Product Title:", product.title);
  
  const invOrConditions = [
    ...(product.inventory ? [{ _id: product.inventory }] : []),
    { product: product._id },
    ...((product.variants || []).map((v) => v.sku).filter(Boolean).map((sku) => ({ sku }))),
    ...(product.title ? [{ title: product.title }] : []),
  ];

  console.log("Conditions:", JSON.stringify(invOrConditions, null, 2));

  const invItems = await Inventory.find({ $or: invOrConditions });
  console.log("Found Inventory Items:", invItems.length);
  
  process.exit(0);
}

run();
