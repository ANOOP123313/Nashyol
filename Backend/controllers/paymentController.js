import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Transaction from "../models/Transactions.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";
import Coupon from "../models/Coupon.js";
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

    const rawMethod = String(order.paymentMethod || "card").toLowerCase();
    const formattedMethod = rawMethod === "cod" ? "COD" : rawMethod === "card" ? "Card" : rawMethod.toUpperCase();

    return {
      _id: order._id,
      orderId: order._id,
      orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      invoiceNumber: order.invoiceNumber || `INV-${order._id.toString().slice(-6).toUpperCase()}`,
      paymentId: order.paymentId || `PAY-${order._id.toString().slice(-6).toUpperCase()}`,
      name: order.user?.name || order.address?.fullName || "Customer",
      email: order.user?.email || "N/A",
      phone: order.user?.phone || order.address?.phone || "",
      amount: `₹${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amountNum: amount,
      orders: itemsSummary,
      itemsCount: order.items?.length || 1,
      paymentMethod: formattedMethod,
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

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400);
    throw new Error("Order ID is required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to pay for this order");
  }

  if (order.paymentStatus === "paid") {
    res.status(400);
    throw new Error("Order is already paid");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Convert totalAmount to smallest currency unit (e.g. paise for INR)
  const amount = Math.round(order.totalAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
    metadata: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId: order._id,
    totalAmount: order.totalAmount,
  });
});

// @desc    Create Stripe Payment Intent directly from Cart
// @route   POST /api/payments/create-intent-cart
// @access  Private
export const createPaymentIntentFromCart = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || !cart.items.length) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  let totalAmount = 0;
  for (const line of cart.items) {
    if (!line.product) continue;
    const product = await Product.findById(line.product._id);
    if (!product || !product.isActive) continue;

    const variant = product.variants.find((v) => v.sku === line.sku);
    if (!variant || !variant.isActive) continue;

    const qty = Math.min(line.quantity, variant.currentStock);
    if (qty < 1) continue;

    totalAmount += variant.sellingPrice * qty;
  }

  if (totalAmount === 0) {
    res.status(400);
    throw new Error("Total amount is 0");
  }

  let discountAmount = 0;
  if (couponCode && couponCode.trim()) {
    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
    if (coupon && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) && (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit)) {
      if (coupon.discountType === "percentage") {
        discountAmount = (totalAmount * (coupon.discountValue || 0)) / 100;
      } else {
        discountAmount = Math.min(coupon.discountValue || 0, totalAmount);
      }
    }
  }

  const shippingOnSetting = await Setting.findOne({ key: "shippingOn" }).lean();
  const shippingChargeSetting = await Setting.findOne({ key: "shippingCharge" }).lean();
  const freeShippingThresholdSetting = await Setting.findOne({ key: "freeShippingThreshold" }).lean();

  const shippingEnabled = shippingOnSetting?.value !== false;
  const configuredShippingCharge = shippingChargeSetting ? Math.max(0, Number(shippingChargeSetting.value) || 0) : 10;
  const configuredFreeThreshold = freeShippingThresholdSetting ? Math.max(0, Number(freeShippingThresholdSetting.value) || 0) : 100;

  const shipping = shippingEnabled
    ? (configuredFreeThreshold > 0 && totalAmount >= configuredFreeThreshold ? 0 : configuredShippingCharge)
    : 0;
  totalAmount += shipping;

  const amount = Math.round(totalAmount * 100);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
    metadata: {
      userId: req.user._id.toString(),
      isFromCart: "true"
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    totalAmount,
  });
});

// @desc    Verify Stripe Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentIntentId } = req.body;
  if (!orderId || !paymentIntentId) {
    res.status(400);
    throw new Error("Order ID and Payment Intent ID are required");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.paymentStatus === "paid") {
    return res.json({ success: true, message: "Order is already paid", order });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status === "succeeded") {
    order.paymentStatus = "paid";
    order.paymentId = paymentIntent.id;
    await order.save();

    await logTransaction(
      order.user,
      order.totalAmount,
      "payment",
      order.paymentMethod || "card",
      "completed",
      `Payment successful via Stripe for order #${order.orderNumber}`,
      order._id
    );

    res.json({ success: true, message: "Payment verified successfully", order });
  } else {
    res.status(400);
    throw new Error("Payment not successful");
  }
});

// @desc    Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public
export const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Note: express rawBody middleware needs to be configured in server.js for this to work
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.paymentId = paymentIntent.id;
        await order.save();

        await logTransaction(
          order.user,
          order.totalAmount,
          "payment",
          order.paymentMethod || "card",
          "completed",
          `Payment successful via Stripe Webhook for order #${order.orderNumber}`,
          order._id
        );
      }
    }
  }

  res.json({ received: true });
});

// @desc    Pay Now for an existing unpaid order (Client)
// @route   POST /api/payments/pay-now/:id
// @access  Private
export const payNowOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentMethod = "card" } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to pay for this order");
  }

  order.paymentStatus = "paid";
  order.paymentMethod = paymentMethod.toUpperCase();
  order.paymentId = `PAY-${Date.now()}`;
  await order.save();

  await logTransaction(
    req.user._id,
    order.totalAmount,
    "payment",
    order.paymentMethod,
    "completed",
    `Online payment completed via Pay Now for order #${order.orderNumber || order._id}`,
    order._id
  );

  res.json({
    success: true,
    message: "Payment completed successfully",
    order,
  });
});

