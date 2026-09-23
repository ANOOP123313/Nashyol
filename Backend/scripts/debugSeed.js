import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Return from "../models/Return.js";

async function runSeed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const count = await Return.countDocuments();
  console.log("Current return count:", count);

  const orders = await Order.find({ "items.0": { $exists: true } })
    .populate("user")
    .populate("items.productId")
    .limit(6);

  console.log("Found orders with items:", orders.length);

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    console.log(`Order ${i}: ${o._id}, User: ${o.user?._id || o.user}, Items count: ${o.items?.length}`);
    const firstItem = o.items?.[0];
    console.log(`First item:`, firstItem);
  }

  await mongoose.disconnect();
}
runSeed().catch(console.error);
