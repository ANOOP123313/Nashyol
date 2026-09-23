import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Return from "../models/Return.js";

async function seedReturns() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existingCount = await Return.countDocuments();
  console.log("Existing returns before seed:", existingCount);

  // Find real orders
  const orders = await Order.find({ "items.0": { $exists: true } })
    .populate("user")
    .limit(6);

  console.log(`Found ${orders.length} orders for seeding returns`);

  const sampleTemplates = [
    {
      status: "pending",
      deliveryStatus: "Pickup Pending",
      reason: "Wrong color received - requested replacement or refund",
      condition: "new",
      refundMethod: "Original Payment Method",
      tracking: "TRK-RET-89211",
      adminNotes: "",
    },
    {
      status: "approved",
      deliveryStatus: "In Transit",
      reason: "Audio balance issue on right ear cup",
      condition: "used",
      refundMethod: "Original Payment Method",
      tracking: "TRK-RET-44023",
      adminNotes: "Approved for warehouse inspection.",
    },
    {
      status: "refunded",
      deliveryStatus: "Delivered to Warehouse",
      reason: "Unopened box - changed mind within 30 days",
      condition: "new",
      refundMethod: "Original Payment Method",
      tracking: "TRK-RET-10928",
      adminNotes: "Item inspected at warehouse in pristine condition. Refund issued.",
    },
    {
      status: "rejected",
      deliveryStatus: "N/A",
      reason: "Item shows signs of unauthorized modification / physical damage",
      condition: "damaged",
      refundMethod: "Original Payment Method",
      tracking: "",
      adminNotes: "Return rejected per warranty terms regarding physical damage.",
    },
  ];

  const seedDocs = [];

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const template = sampleTemplates[i % sampleTemplates.length];
    const firstItem = order.items?.[0];
    if (!firstItem || !firstItem.productId) continue;

    const refundAmt = (firstItem.price || 0) * (firstItem.quantity || 1);

    seedDocs.push({
      orderId: order._id,
      userId: order.user?._id || order.user,
      items: [
        {
          productId: firstItem.productId,
          quantity: firstItem.quantity || 1,
          reason: template.reason,
          condition: template.condition,
        },
      ],
      status: template.status,
      refundAmount: refundAmt,
      refundMethod: template.refundMethod,
      deliveryStatus: template.deliveryStatus,
      tracking: template.tracking,
      adminNotes: template.adminNotes,
      reason: template.reason,
    });
  }

  if (seedDocs.length > 0) {
    const inserted = await Return.insertMany(seedDocs);
    console.log(`Successfully seeded ${inserted.length} returns from real orders!`);
  }

  const finalCount = await Return.countDocuments();
  console.log("Total returns in DB now:", finalCount);

  await mongoose.disconnect();
}

seedReturns().catch(console.error);
