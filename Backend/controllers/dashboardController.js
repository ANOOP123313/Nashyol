import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Referral from "../models/Referral.js";
import Coupon from "../models/Coupon.js";

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  // ================= BASIC STATS =================
  const [
    orderCount,
    productCount,
    userCount,
    vendorCount,
    pendingVendorCount,
    totalRevenue,
    referralCount,
    referralRevenue,
    activeCoupons,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "user" }),
    Vendor.countDocuments({ approvalStatus: "approved" }),
    Vendor.countDocuments({ approvalStatus: "pending" }),

    // 💰 Total Revenue
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),

    Referral.countDocuments(),
    Referral.aggregate([
      { $match: { rewardGranted: true } },
      { $group: { _id: null, total: { $sum: "$rewardAmount" } } },
    ]),
    Coupon.countDocuments({ isActive: true }),
  ]);

  // ================= CHART DATA =================

  // 📊 Monthly Revenue
  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 📦 Monthly Orders
  const monthlyOrders = await Order.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 🎯 Referral Growth
  const referralStats = await Referral.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalReferrals: { $sum: 1 },
        conversions: {
          $sum: {
            $cond: ["$rewardGranted", 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ================= EXTRA DATA =================

  // 🧾 Recent Orders
  const recentOrders = await Order.find()
    .sort("-createdAt")
    .limit(5)
    .populate("user", "name email");

  // 🏆 Top Vendors
  const topVendors = await Vendor.find()
    .sort({ totalRevenue: -1 })
    .limit(5)
    .select("storeName email totalRevenue");

  // 🥇 Leaderboard (Top Referrers)
  const customerUsers = await User.find({
    role: { $nin: ["admin", "superadmin", "vendor"] },
  }).select("name email referralCode referralCount referralPoints createdAt").lean();

  const allReferralDocs = await Referral.find().lean();

  const userReferralStats = customerUsers.map((u) => {
    const userRefs = allReferralDocs.filter(
      (r) => r.referrer && r.referrer.toString() === u._id.toString()
    );
    const refCount = Math.max(userRefs.length, u.referralCount || 0);
    const conversions = userRefs.filter((r) => r.rewardGranted !== false).length || (refCount > 0 ? refCount : 0);
    const rate = refCount > 0 ? (conversions / refCount) * 100 : 0;
    const name = u.name || u.email || "Customer";

    return {
      _id: u._id,
      name,
      referrerName: name,
      email: u.email || "",
      referrals: refCount,
      conversions,
      rate: Math.min(100, Math.round(rate * 10) / 10),
    };
  });

  const leaderboard = userReferralStats
    .filter((u) => u.referrals > 0)
    .sort((a, b) => b.referrals - a.referrals || b.conversions - a.conversions)
    .slice(0, 5);

  // ================= RESPONSE =================
  res.json({
    stats: {
      orders: orderCount,
      products: productCount,
      customers: userCount,
      vendors: vendorCount,
      pendingApprovals: pendingVendorCount,
      revenue: totalRevenue[0]?.total || 0,
      referrals: referralCount,
      referralRevenue: referralRevenue[0]?.total || 0,
      activeCoupons,
    },

    charts: {
      revenue: monthlyRevenue,
      orders: monthlyOrders,
      referrals: referralStats,
    },

    recentOrders,
    topVendors,
    leaderboard,
  });
});

// @desc    Get vendor dashboard stats
// @route   GET /api/dashboard/vendor
// @access  Private/Vendor
export const getVendorStats = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ owner: req.user._id });

  if (!vendor) {
    res.status(404);
    throw new Error("Vendor not found");
  }

  const [productCount, pendingOrders] = await Promise.all([
    Product.countDocuments({ "variants.currentVendor": vendor._id }),

    Order.countDocuments({
      "items.vendorId": vendor._id,
      orderStatus: "pending",
    }),
  ]);

  res.json({
    stats: {
      myProducts: productCount,
      pendingOrders,
      revenue: vendor.totalRevenue,
    },
  });
});