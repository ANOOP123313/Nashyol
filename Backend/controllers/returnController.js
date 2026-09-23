import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Return from "../models/Return.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

// Helper to auto-seed returns from real orders if collection is empty
const seedDefaultReturnsIfEmpty = async () => {
  try {
    const count = await Return.countDocuments();
    if (count > 0) return;

    // Find real orders with products and users
    const orders = await Order.find({ "items.0": { $exists: true } })
      .populate("user")
      .populate("items.productId")
      .limit(6);

    if (!orders || orders.length === 0) return;

    const sampleStatuses = [
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
      const template = sampleStatuses[i % sampleStatuses.length];
      const firstItem = order.items?.[0];
      if (!firstItem || !firstItem.productId) continue;

      const refundAmt = (firstItem.price || 0) * (firstItem.quantity || 1);

      seedDocs.push({
        orderId: order._id,
        userId: order.user?._id || order.user,
        items: [
          {
            productId: firstItem.productId?._id || firstItem.productId,
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
      await Return.insertMany(seedDocs);
      console.log(`[Return Seeder] Successfully seeded ${seedDocs.length} returns from real orders.`);
    }
  } catch (err) {
    console.error("[Return Seeder Error]:", err.message);
  }
};

// @desc    Create a return request
// @route   POST /api/returns
// @access  Private
export const createReturn = asyncHandler(async (req, res) => {
  const { orderId, items, reason, refundMethod } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to request return for this order");
  }

  // Calculate potential refund amount based on returned items
  let refundAmount = 0;
  if (items && Array.isArray(items)) {
    for (const retItem of items) {
      const orderItem = order.items.find(
        (i) => i.productId.toString() === retItem.productId.toString()
      );
      if (orderItem) {
        refundAmount += (orderItem.price || 0) * (retItem.quantity || 1);
      }
    }
  }

  const trackingNumber = "TRK-" + Math.random().toString(36).substring(2, 9).toUpperCase();

  const returnReq = await Return.create({
    orderId,
    userId: req.user._id,
    items,
    reason: reason || items?.[0]?.reason || "Return / refund requested by customer",
    refundAmount,
    refundMethod: refundMethod || "Original Payment Method",
    deliveryStatus: "Pickup Pending",
    tracking: trackingNumber,
    status: "pending",
  });

  const populated = await Return.findById(returnReq._id)
    .populate("userId", "name email phone")
    .populate("orderId")
    .populate("items.productId", "title images price SKU");

  res.status(201).json(populated);
});

// @desc    Get user return requests
// @route   GET /api/returns/my
// @access  Private
export const getMyReturns = asyncHandler(async (req, res) => {
  await seedDefaultReturnsIfEmpty();

  const returns = await Return.find({ userId: req.user._id })
    .populate("orderId")
    .populate("items.productId", "title images price SKU")
    .sort({ createdAt: -1 });

  res.json(returns);
});

// @desc    Get all return requests (Admin)
// @route   GET /api/returns/admin
// @access  Private/Admin
export const getAllReturns = asyncHandler(async (req, res) => {
  await seedDefaultReturnsIfEmpty();

  const returns = await Return.find()
    .populate("userId", "name email phone")
    .populate("orderId")
    .populate("items.productId", "title images price SKU")
    .sort({ createdAt: -1 });

  res.json(returns);
});

// @desc    Update return status (Admin)
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
export const updateReturnStatus = asyncHandler(async (req, res) => {
  const { status, refundAmount, refundMethod, deliveryStatus, tracking, adminNotes } = req.body;

  const returnReq = await Return.findById(req.params.id);
  if (!returnReq) {
    res.status(404);
    throw new Error("Return request not found");
  }

  if (status) returnReq.status = status;
  if (refundAmount !== undefined && refundAmount !== null) returnReq.refundAmount = Number(refundAmount);
  if (refundMethod) returnReq.refundMethod = refundMethod;
  if (deliveryStatus) returnReq.deliveryStatus = deliveryStatus;
  if (tracking !== undefined) returnReq.tracking = tracking;
  if (adminNotes !== undefined) returnReq.adminNotes = adminNotes;

  await returnReq.save();

  // If status is refunded, also update Order paymentStatus
  if (status === "refunded" && returnReq.orderId) {
    try {
      await Order.findByIdAndUpdate(returnReq.orderId, { paymentStatus: "refunded" });
    } catch (err) {
      console.warn("Failed to update Order paymentStatus on return refund:", err.message);
    }
  }

  const updated = await Return.findById(returnReq._id)
    .populate("userId", "name email phone")
    .populate("orderId")
    .populate("items.productId", "title images price SKU");

  res.json(updated);
});

// @desc    Track return by ID, tracking number, or order ID (Public)
// @route   GET /api/returns/track/:query
// @access  Public
export const trackReturn = asyncHandler(async (req, res) => {
  await seedDefaultReturnsIfEmpty();

  const rawQuery = (req.params.query || "").trim();
  if (!rawQuery) {
    res.status(400);
    throw new Error("Tracking or Order ID query is required");
  }

  // Clean common prefixes: RET-, ORD-, #
  const cleaned = rawQuery.replace(/^(RET-|ORD-|#)/i, "").trim();

  let match = null;

  // 1. Direct MongoDB ID match
  if (mongoose.Types.ObjectId.isValid(cleaned)) {
    match = await Return.findOne({
      $or: [{ _id: cleaned }, { orderId: cleaned }],
    })
      .populate("userId", "name email")
      .populate("orderId")
      .populate("items.productId", "title images price");
  }

  // 2. Tracking number match
  if (!match) {
    match = await Return.findOne({
      tracking: { $regex: new RegExp(rawQuery, "i") },
    })
      .populate("userId", "name email")
      .populate("orderId")
      .populate("items.productId", "title images price");
  }

  // 3. Fallback: Search all returns by ending substring of _id or orderId
  if (!match) {
    const all = await Return.find()
      .populate("userId", "name email")
      .populate("orderId")
      .populate("items.productId", "title images price");

    match = all.find((r) => {
      const retIdStr = r._id.toString().toUpperCase();
      const ordIdStr = (r.orderId?._id || r.orderId || "").toString().toUpperCase();
      const qUpper = cleaned.toUpperCase();
      return retIdStr.endsWith(qUpper) || ordIdStr.endsWith(qUpper) || retIdStr.includes(qUpper) || ordIdStr.includes(qUpper);
    });
  }

  if (!match) {
    res.status(404);
    throw new Error(`No return request found for "${rawQuery}"`);
  }

  // Mask sensitive user email for public tracking
  const safeData = match.toObject();
  if (safeData.userId && safeData.userId.email) {
    const [namePart, domain] = safeData.userId.email.split("@");
    const maskedName = namePart.length > 2 ? namePart[0] + "***" + namePart.slice(-1) : namePart[0] + "***";
    safeData.userId.email = `${maskedName}@${domain || "example.com"}`;
  }

  res.json(safeData);
});
