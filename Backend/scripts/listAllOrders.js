import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

async function listOrders() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orders = await Order.find().populate("user", "name email").populate("items.productId", "title price images");
  console.log("Orders count:", orders.length);
  orders.forEach((o, i) => {
    console.log(`[${i}] ID: ${o._id}, User: ${o.user?.name} (${o.user?.email}), Total: $${o.totalAmount}, Status: ${o.orderStatus}, Items: ${o.items.map(it => it.title || it.productId?.title).join(", ")}`);
  });
  await mongoose.disconnect();
}
listOrders().catch(console.error);
