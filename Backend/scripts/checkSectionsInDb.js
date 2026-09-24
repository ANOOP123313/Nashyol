import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import HomePageSection from "../models/HomePageSection.js";
import Category from "../models/Category.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
  const sections = await HomePageSection.find({}).lean();
  console.log(`Found ${sections.length} HomePageSection docs in DB:`);
  sections.forEach(s => {
    console.log(`- [${s.sectionType}] key: ${s.sectionKey}, title: "${s.title}", items count: ${s.items?.length || 0}`);
    if (s.sectionKey === "quick_categories") {
      console.log("  quick_categories items:", s.items?.map(i => i.name));
    }
  });
  process.exit(0);
}

run().catch(console.error);
