import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

dotenv.config();

const check = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
  console.log("Connected DB name:", mongoose.connection.db.databaseName);
  const prods = await Product.find();
  console.log("Products found:", prods.map(p => ({ id: p._id, title: p.title, isActive: p.isActive })));
  const cats = await Category.find();
  console.log("Categories found:", cats.map(c => ({ id: c._id, name: c.name })));
  process.exit(0);
};

check();
