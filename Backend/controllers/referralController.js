import asyncHandler from "express-async-handler";
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

  const referrer = await User.findOne({ referralCode });
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
  await Referral.create({
    referrer: referrer._id,
    referredUser: user._id,
  });

  // Increment referrer's count
  referrer.referralCount += 1;
  await referrer.save();

  // Notify referrer
  await sendNotification(
    referrer._id,
    "New Referral!",
    `${user.name} used your referral code. You'll get a reward after their first order!`,
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
    rewardGranted: false,
  });

  if (!referral) return;

  const rewardAmount = order.totalAmount * 0.05; // 5% reward
  buyer.referredBy.walletBalance += rewardAmount;
  await buyer.referredBy.save();

  referral.rewardGranted = true;
  referral.rewardAmount = rewardAmount;
  await referral.save();

  // Log transaction
  await logTransaction(
    buyer.referredBy._id,
    rewardAmount,
    "deposit",
    "wallet",
    "completed",
    `Referral reward from order ${order._id}`,
    order._id
  );

  // Notify referrer
  await sendNotification(
    buyer.referredBy._id,
    "Referral Reward Granted!",
    `You've received ${rewardAmount} reward for ${buyer.name}'s order.`,
    "referral",
    `/orders/${order._id}`
  );

  console.log(`Referral reward of ${rewardAmount} granted to ${buyer.referredBy.name}`);
};

// @desc    Get referral stats
// @route   GET /api/referrals/stats
// @access  Private
export const getReferralStats = asyncHandler(async (req, res) => {
  const user = req.user;
  const referrals = await Referral.find({ referrer: user._id }).populate("referredUser", "name createdAt");
  
  res.json({
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    walletBalance: user.walletBalance,
    referrals,
  });
});

// @desc    Get all referrers for admin
// @route   GET /api/referrals/admin/referrers
// @access  Private/Admin
export const getAdminReferrers = asyncHandler(async (req, res) => {
  const users = await User.find({
    $or: [
      { referralCode: { $exists: true, $ne: "" } },
      { referralCount: { $gt: 0 } },
      { role: "customer" },
    ],
  }).select("name email phone referralCode referralCount walletBalance isBlocked createdAt updatedAt");

  const allReferrals = await Referral.find();
  const allCoupons = await Coupon.find();

  const referrers = users.map((user) => {
    const userReferrals = allReferrals.filter(
      (r) => r.referrer && r.referrer.toString() === user._id.toString()
    );
    const conversions = userReferrals.filter((r) => r.rewardGranted).length;
    const earnedReward = userReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
    const userCoupons = allCoupons.filter(
      (c) => c.earnedBy === user._id.toString() || c.earnedBy === user.email
    );

    return {
      id: user._id,
      _id: user._id,
      name: user.name || "Referrer",
      email: user.email || "—",
      phone: user.phone || "+1 (555) 000-0000",
      code: user.referralCode || `REF${user._id.toString().slice(-6).toUpperCase()}`,
      referrals: userReferrals.length || user.referralCount || 0,
      conversions,
      earnedCoupons: userCoupons.length,
      reward: `$${(earnedReward || user.walletBalance || 0).toFixed(2)}`,
      rewardNum: earnedReward || user.walletBalance || 0,
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
      orderId: userOrder ? userOrder._id.toString().slice(-6).toUpperCase() : `ORD-${r._id.toString().slice(-4).toUpperCase()}`,
      orderValue: `$${orderVal.toFixed(2)}`,
      discount: `$${discount}`,
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
    value: c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`,
    status: c.isActive ? "active" : "used",
    expires: c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "30 days",
    usedDate: c.usedCount > 0 ? "Used" : "Not yet",
  }));

  res.json({
    referrer: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "+1 (555) 000-0000",
      code: user.referralCode || `REF${user._id.toString().slice(-6).toUpperCase()}`,
      referrals: referrals.length || user.referralCount || 0,
      conversions: referrals.filter((r) => r.rewardGranted).length,
      earnedCoupons: earnedCoupons.length,
      reward: `$${(user.walletBalance || 0).toFixed(2)}`,
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

