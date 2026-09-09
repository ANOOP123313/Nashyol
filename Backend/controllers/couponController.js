import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";

// ── Validate Coupon (Public) ──
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.query;
  if (!code || !code.trim()) {
    return res.status(400).json({ message: "Coupon code is required" });
  }
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
  if (!coupon) {
    return res.status(404).json({ valid: false, message: "Invalid or expired coupon" });
  }
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({ valid: false, message: "Coupon has expired" });
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ valid: false, message: "Coupon usage limit reached" });
  }
  const sub = Math.max(0, Number(subtotal) || 0);
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (sub * (coupon.discountValue || 0)) / 100;
  } else {
    discountAmount = Math.min(coupon.discountValue || 0, sub);
  }
  res.json({
    valid: true,
    code: coupon.code,
    discountAmount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    finalAmount: Math.max(0, sub - discountAmount),
  });
});

// ── Get All Coupons (Admin) ──
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

// ── Create Coupon (Admin) ──
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, type, earnedBy, details, expiryDate, usageLimit } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ message: "Coupon code and discount value are required" });
  }
  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    return res.status(400).json({ message: "Coupon code already exists" });
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    discountType: discountType || "percentage",
    discountValue: Number(discountValue),
    type: type || "Promotional",
    earnedBy,
    details,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    usageLimit: usageLimit ? Number(usageLimit) : undefined,
  });

  res.status(201).json(coupon);
});

// ── Delete Coupon (Admin) ──
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  await coupon.deleteOne();
  res.json({ message: "Coupon deleted" });
});
