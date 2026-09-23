import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Transaction from "../models/Transactions.js";
import { logTransaction } from "./transactionController.js";
import { rewardReferrer } from "./referralController.js";

// @desc    Get all payments & stats for admin from real database orders
// @route   GET /api/payments/admin
// @access  Private/Admin
export const getAdminPayments = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalRevenue = 0;
  let pendingAmount = 0;
  let paidThisMonth = 0;
  let paidCount = 0;
  let pendingCount = 0;

  const payments = orders.map((order) => {
    const amount = Number(order.totalAmount) || 0;
    const status = (order.paymentStatus || "pending").toLowerCase();
    const orderDate = new Date(order.createdAt || Date.now());

    if (status === "paid") {
      totalRevenue += amount;
      paidCount += 1;
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        paidThisMonth += amount;
      }
    } else if (status === "pending") {
      pendingAmount += amount;
      pendingCount += 1;
    }

    const itemsSummary = order.items && order.items.length > 0
      ? order.items.map((i) => `${i.quantity || 1}x ${i.title || "Item"}`).join(", ")
      : "1 item";

    return {
      _id: order._id,
      orderId: order._id,
      paymentId: order.paymentId || `PAY-${order._id.toString().slice(-8).toUpperCase()}`,
      name: order.user?.name || order.address?.fullName || "Customer",
      email: order.user?.email || "N/A",
      phone: order.user?.phone || order.address?.phone || "",
      amount: `₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amountNum: amount,
      orders: itemsSummary,
      itemsCount: order.items?.length || 1,
      paymentMethod: (order.paymentMethod || "card").toUpperCase(),
      dueDate: orderDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      rawDate: orderDate.toISOString(),
      status: status === "paid" ? "Paid" : status === "pending" ? "Pending" : status === "failed" ? "Failed" : "Refunded",
      orderStatus: order.orderStatus || "pending",
    };
  });

  res.json({
    payments,
    stats: {
      totalRevenue,
      pendingAmount,
      paidThisMonth,
      totalTransactions: orders.length,
      paidCount,
      pendingCount,
    },
  });
});

// @desc    Update order payment status
// @route   PUT /api/payments/admin/:id/status
// @access  Private/Admin
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, status } = req.body;
  const newStatus = (paymentStatus || status || "").toLowerCase();

  if (!["paid", "pending", "failed", "refunded"].includes(newStatus)) {
    res.status(400);
    throw new Error("Invalid payment status. Allowed: paid, pending, failed, refunded");
  }

  const order = await Order.findById(id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const oldStatus = order.paymentStatus;
  order.paymentStatus = newStatus;
  await order.save();

  // Log transaction
  if (order.user?._id) {
    await logTransaction(
      order.user._id,
      order.totalAmount,
      newStatus === "refunded" ? "refund" : "payment",
      order.paymentMethod || "card",
      newStatus === "paid" ? "completed" : newStatus,
      `Payment status updated to ${newStatus} for order #${order._id}`,
      order._id
    );
  }

  // If newly marked as paid and order is delivered, reward referrer if eligible
  if (newStatus === "paid" && oldStatus !== "paid" && order.orderStatus === "delivered") {
    await rewardReferrer(order);
  }

  res.json({
    message: `Payment status updated to ${newStatus}`,
    order,
  });
});
