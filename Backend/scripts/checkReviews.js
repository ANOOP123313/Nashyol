import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

async function checkReviews() {
  await mongoose.connect(process.env.MONGODB_URI);
  const reviewsCount = await Review.countDocuments();
  console.log("Total Reviews in DB:", reviewsCount);
  const reviews = await Review.find().populate("user", "name email").populate("product", "title");
  console.log("Reviews:", JSON.stringify(reviews, null, 2));

  // Check orders with user and products
  const orders = await Order.find().select("user items").populate("user", "name email");
  console.log("Orders with products:");
  orders.forEach((o, i) => {
    console.log(`[Order ${i}] User: ${o.user?.name} (${o.user?._id}) -> Items:`, o.items.map(it => ({ id: it.productId, title: it.title })));
  });

  await mongoose.disconnect();
}
checkReviews().catch(console.error);
