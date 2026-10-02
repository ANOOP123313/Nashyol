import mongoose from "mongoose";
import Inventory from "./models/Inventory.js";
import Product from "./models/Product.js";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/nashyol");
  console.log("Connected to MongoDB");

  const p = await Product.findOne().sort({ _id: -1 });
  if (p) {
    console.log("Product found:", p.title);
    const orConditions = [
      { product: p._id },
      ...(p.inventory ? [{ _id: p.inventory }] : []),
      ...(p.variants && p.variants.length > 0 ? [{ sku: { $in: p.variants.map(v => v.sku) } }] : []),
      ...(p.title ? [{ title: p.title }] : []),
    ];
    
    console.log("Conditions:", JSON.stringify(orConditions, null, 2));
    const invBefore = await Inventory.find({ $or: orConditions });
    console.log("Inventory before:", invBefore.length, invBefore.map(i => ({ id: i._id, isAdded: i.isAddedToProducts })));
    
    const result = await Inventory.updateMany(
      { $or: orConditions },
      { isAddedToProducts: false, product: null }
    );
    console.log("Update result:", result);
    
    const invAfter = await Inventory.find({ $or: orConditions });
    console.log("Inventory after:", invAfter.map(i => ({ id: i._id, isAdded: i.isAddedToProducts })));
  } else {
    console.log("No product found");
  }
  process.exit(0);
}
run();
