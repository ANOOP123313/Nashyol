import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import Referral from "../models/Referral.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import { sendNotification } from "./notificationController.js";
import { logTransaction } from "./transactionController.js";

// @desc    Apply referral code
// @route   POST /api/referrals/apply
// @access  Private
export const applyReferralCode = asyncHandler(async (req, res) => {
  const { referralCode } = req.body;
  const user = req.user;

  if (user.referredBy) {
    res.status(400);
    throw new Error("You have already been referred");
  }

  const cleanCode = referralCode ? referralCode.trim() : "";
  if (!cleanCode) {
    res.status(400);
    throw new Error("Please provide a valid referral code");
  }

  const referrer = await User.findOne({
    $or: [
      { referralCode: cleanCode.toUpperCase() },
      { referralCode: cleanCode.toLowerCase() },
      { referralCode: { $regex: new RegExp(`^${cleanCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
    ]
  });

  if (!referrer) {
    res.status(404);
    throw new Error("Referral code not found");
  }

  if (referrer._id.toString() === user._id.toString()) {
    res.status(400);
    throw new Error("You cannot refer yourself");
  }

  // Update user with referrer
  user.referredBy = referrer._id;
  await user.save();

  // Create a record in Referral model
  const rewardPoints = 100;
  try {
    await Referral.findOneAndUpdate(
      { referredUser: user._id },
      {
        referrer: referrer._id,
        referredUser: user._id,
        rewardGranted: true,
        rewardAmount: rewardPoints,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("Error creating referral record:", err);
  }

  // Increment referrer's count & points
  referrer.referralCount = (referrer.referralCount || 0) + 1;
  referrer.referralPoints = (referrer.referralPoints || 0) + rewardPoints;
  referrer.walletBalance = (referrer.walletBalance || 0) + rewardPoints;
  await referrer.save();

  // Notify referrer
  await sendNotification(
    referrer._id,
    "New Referral!",
    `${user.name || "A new friend"} registered using your referral code. You earned ${rewardPoints} referral points!`,
    "referral"
  );

  res.json({ message: "Referral code applied successfully", referrer: referrer.name });
});

// @desc    Reward referrer after order delivery
export const rewardReferrer = async (order) => {
  const buyer = await User.findById(order.user).populate("referredBy");
  if (!buyer || !buyer.referredBy) return;

  const referral = await Referral.findOne({
    referrer: buyer.referredBy._id,
    referredUser: buyer._id,
  });

  if (!referral) return;

  const rewardAmount = order.totalAmount * 0.05; // 5% reward
  buyer.referredBy.walletBalance = (buyer.referredBy.walletBalance || 0) + rewardAmount;
  await buyer.referredBy.save();

  referral.rewardGranted = true;
  referral.rewardAmount = (referral.rewardAmount || 0) + rewardAmount;
  await referral.save();

  // Log transaction
  await logTransaction(
    buyer.referredBy._id,
    rewardAmount,
    "deposit",
    "wallet",
    "completed",
    `Referral reward from order ${order.orderNumber || order._id}`,
    order._id
  );

  // Notify referrer
  await sendNotification(
    buyer.referredBy._id,
    "Referral Reward Granted!",
    `You've received ₹${rewardAmount.toFixed(2)} reward for ${buyer.name}'s order.`,
    "referral",
    `/orders/${order.orderNumber || order._id}`
  );
};

// @desc    Get referral stats
// @route   GET /api/referrals/stats
// @access  Private
export const getReferralStats = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user.referralCode) {
    user.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    await User.findByIdAndUpdate(user._id, { referralCode: user.referralCode });
  }

  // 1. Fetch existing Referral documents
  let referrals = await Referral.find({ referrer: user._id })
    .populate("referredUser", "name email phone createdAt")
    .sort({ createdAt: -1 });

  // 2. Also check if any users in User collection have referredBy === user._id
  const directReferredUsers = await User.find({ referredBy: user._id }).select("name email phone createdAt");
  const existingRefereeIds = new Set(
    referrals
      .map((r) => r.referredUser?._id?.toString() || (typeof r.referredUser === "string" ? r.referredUser : null))
      .filter(Boolean)
  );

  for (const refUser of directReferredUsers) {
    if (!existingRefereeIds.has(refUser._id.toString())) {
      try {
        const createdRef = await Referral.findOneAndUpdate(
          { referredUser: refUser._id },
          {
            referrer: user._id,
            referredUser: refUser._id,
            rewardGranted: true,
            rewardAmount: 100,
          },
          { upsert: true, new: true }
        );
        referrals.unshift({
          ...createdRef.toObject(),
          referredUser: refUser,
        });
        existingRefereeIds.add(refUser._id.toString());
      } catch (e) {
        // ignore duplicate key
      }
    }
  }

  const referralCount = Math.max(referrals.length, user.referralCount || 0);
  const calculatedPoints = referralCount * 100;
  const points = Math.max(user.referralPoints || 0, user.walletBalance || 0, calculatedPoints);

  if ((user.referralCount || 0) < referralCount || (user.referralPoints || 0) < points) {
    await User.findByIdAndUpdate(user._id, {
      referralCount,
      referralPoints: points,
    });
  }

  res.json({
    referralCode: user.referralCode,
    referralCount,
    walletBalance: user.walletBalance || 0,
    referralPoints: points,
    points,
    referrals: referrals.map((r) => ({
      _id: r._id,
      name: r.referredUser?.name || "Friend",
      email: r.referredUser?.email || (r.referredUser?.phone ? `+91 ${r.referredUser.phone}` : "—"),
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
      points: r.rewardAmount || 100,
      rewardGranted: r.rewardGranted !== false,
      status: r.rewardGranted !== false ? "Rewarded" : "Pending",
    })),
  });
});

// @desc    Get all referrers for admin
// @route   GET /api/referrals/admin/referrers
// @access  Private/Admin
export const getAdminReferrers = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: { $ne: "admin" },
  }).select("name email phone referralCode referralCount referralPoints walletBalance isBlocked createdAt updatedAt");

  const allReferrals = await Referral.find();
  const allCoupons = await Coupon.find();

  const referrers = users.map((user) => {
    let code = user.referralCode;
    if (!code) {
      code = crypto.randomBytes(4).toString("hex").toUpperCase();
      User.findByIdAndUpdate(user._id, { referralCode: code }).catch(() => {});
    }

    const userReferrals = allReferrals.filter(
      (r) => r.referrer && r.referrer.toString() === user._id.toString()
    );
    const conversions = userReferrals.filter((r) => r.rewardGranted).length;
    const earnedReward = userReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
    const userCoupons = allCoupons.filter(
      (c) => c.earnedBy === user._id.toString() || c.earnedBy === user.email
    );

    const totalPoints = user.referralPoints || user.walletBalance || (userReferrals.length * 100) || earnedReward || 0;

    return {
      id: user._id,
      _id: user._id,
      name: user.name || "Referrer",
      email: user.email || "—",
      phone: user.phone || "+91 98765 43210",
      code,
      referrals: userReferrals.length || user.referralCount || 0,
      conversions: conversions || userReferrals.length,
      earnedCoupons: userCoupons.length,
      reward: `₹${totalPoints.toFixed(2)}`,
      rewardNum: totalPoints,
      points: totalPoints,
      status: user.isBlocked ? "inactive" : "active",
      joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently",
      lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Recently",
    };
  });

  res.json(referrers);
});

// @desc    Get specific referrer detail for admin
// @route   GET /api/referrals/admin/referrer/:id
// @access  Private/Admin
export const getAdminReferrerDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("Referrer not found");
  }

  const referrals = await Referral.find({ referrer: user._id })
    .populate("referredUser", "name email createdAt")
    .sort({ createdAt: -1 });

  const referredUserIds = referrals.map((r) => r.referredUser?._id).filter(Boolean);
  const orders = await Order.find({ user: { $in: referredUserIds } }).sort({ createdAt: -1 });

  const referralHistory = referrals.map((r) => {
    const userOrder = orders.find(
      (o) => r.referredUser && o.user && o.user.toString() === r.referredUser._id.toString()
    );
    const orderVal = userOrder ? userOrder.totalAmount : 0;
    const discount = userOrder ? (userOrder.discountAmount || orderVal * 0.1 || 5).toFixed(2) : "0.00";

    return {
      customer: r.referredUser?.name || "Referred User",
      email: r.referredUser?.email || "—",
      orderId: userOrder ? (userOrder.orderNumber || `ORD-${userOrder._id.toString().slice(-6).toUpperCase()}`) : `ORD-${r._id.toString().slice(-4).toUpperCase()}`,
      realOrderId: userOrder ? userOrder._id : null,
      orderValue: `₹${orderVal.toFixed(2)}`,
      discount: `₹${discount}`,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently",
      rewardStatus: r.rewardGranted ? "Rewarded" : "Pending",
    };
  });

  const coupons = await Coupon.find({
    $or: [{ earnedBy: user._id.toString() }, { earnedBy: user.email }],
  }).sort({ createdAt: -1 });

  const earnedCoupons = coupons.map((c) => ({
    code: c.code,
    type: c.type || "General Referral Reward",
    typeColor: c.type === "Product Referral Reward" ? "#2563eb" : "#f59e0b",
    value: c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`,
    status: c.isActive ? "active" : "used",
    expires: c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "30 days",
    usedDate: c.usedCount > 0 ? "Used" : "Not yet",
  }));

  const totalPoints = user.referralPoints || user.walletBalance || (referrals.length * 100) || 0;

  res.json({
    referrer: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "+91 98765 43210",
      code: user.referralCode || `REF${user._id.toString().slice(-6).toUpperCase()}`,
      referrals: referrals.length || user.referralCount || 0,
      conversions: referrals.filter((r) => r.rewardGranted).length || referrals.length,
      earnedCoupons: earnedCoupons.length,
      reward: `₹${totalPoints.toFixed(2)}`,
      points: totalPoints,
      status: user.isBlocked ? "inactive" : "active",
      joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently",
      lastActive: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Recently",
    },
    referralHistory,
    earnedCoupons,
  });
});

// @desc    Generate reward coupon for referrer by admin
// @route   POST /api/referrals/admin/generate-coupon
// @access  Private/Admin
export const generateAdminRewardCoupon = asyncHandler(async (req, res) => {
  const { referrerId, couponType, valueType, value, expiry, notes } = req.body;

  const referrer = await User.findById(referrerId);
  if (!referrer) {
    res.status(404);
    throw new Error("Referrer not found");
  }

  const isPercent = valueType ? valueType.includes("Percentage") || valueType.includes("%") : true;
  const expiryDays = Number(expiry) || 30;
  const expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  const couponCode = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const coupon = await Coupon.create({
    code: couponCode,
    discountType: isPercent ? "percentage" : "flat",
    discountValue: Number(value) || 5,
    type: couponType || "General Referral Reward",
    earnedBy: referrer._id.toString(),
    details: notes || `Reward for ${referrer.name}`,
    expiryDate,
    usageLimit: 1,
    isActive: true,
  });

  // Notify referrer
  await sendNotification(
    referrer._id,
    "New Reward Coupon!",
    `You've received a reward coupon ${couponCode} (${coupon.discountValue}${isPercent ? "%" : "$"} off)!`,
    "coupon"
  );

  res.status(201).json({
    message: "Coupon generated successfully",
    coupon,
  });
});

