import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Transaction from "../models/Transactions.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const mongoUri = process.env.MONGODB_URI.includes("/nashyol")
  ? process.env.MONGODB_URI
  : process.env.MONGODB_URI.replace(/\/+$/, "") + "/nashyol?retryWrites=true&w=majority";

async function checkDb() {
  await mongoose.connect(mongoUri, { dbName: "nashyol" });

  const orderCount = await Order.countDocuments();
  const txCount = await Transaction.countDocuments();
  const paymentCount = await Payment.countDocuments();

  console.log(`Orders: ${orderCount}`);
  console.log(`Transactions: ${txCount}`);
  console.log(`Payments: ${paymentCount}`);

  const orders = await Order.find().populate("user", "name email").limit(5).lean();
  console.log("Sample Orders:", JSON.stringify(orders, null, 2));

  const transactions = await Transaction.find().populate("userId", "name email").limit(5).lean();
  console.log("Sample Transactions:", JSON.stringify(transactions, null, 2));

  await mongoose.disconnect();
}

checkDb();
