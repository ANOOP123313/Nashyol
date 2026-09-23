import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Return from "../models/Return.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

async function checkReturns() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Return.countDocuments();
  console.log("Total Returns in DB:", count);
  const returns = await Return.find().populate("userId", "name email").populate("orderId").populate("items.productId", "title price");
  console.log("Returns list:", JSON.stringify(returns, null, 2));

  const orders = await Order.find().select("_id user totalAmount orderStatus paymentStatus items").populate("user", "name email");
  console.log("Total Orders in DB:", orders.length);
  console.log("Sample Orders:", JSON.stringify(orders.slice(0, 3), null, 2));

  await mongoose.disconnect();
}
checkReturns().catch(console.error);
