import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import Inventory from "../models/Inventory.js";
import Return from "../models/Return.js";
import { calculateStatus } from "./inventoryController.js";
import { rewardReferrer } from "./referralController.js";
import { sendNotification } from "./notificationController.js";
import { logTransaction } from "./transactionController.js";
import Setting from "../models/Setting.js";
import { sendOrderConfirmation } from "../utils/whatsappService.js";

const deductInventoryStock = async (product, sku, qty, reason = "Product sale (Order placed)") => {
  try {
    const orConditions = [
      ...(product.inventory ? [{ _id: product.inventory }] : []),
      { product: product._id },
      ...(sku ? [{ sku }] : []),
      { title: product.title },
    ];
    const inv = await Inventory.findOne({ $or: orConditions });
    if (inv) {
      inv.currentStock = Math.max(0, (inv.currentStock || 0) - qty);
      inv.status = calculateStatus(inv.currentStock, inv.reorderPoint);
      inv.movements.unshift({
        type: "out",
        units: qty,
        reason,
        by: "System",
        date: new Date(),
      });
      await inv.save();
    }
  } catch (err) {
    console.error("Error deducting inventory stock:", err);
  }
};

const restoreInventoryStock = async (product, sku, qty, reason = "Stock restored") => {
  try {
    const orConditions = [
      ...(product.inventory ? [{ _id: product.inventory }] : []),
      { product: product._id },
      ...(sku ? [{ sku }] : []),
      { title: product.title },
    ];
    const inv = await Inventory.findOne({ $or: orConditions });
    if (inv) {
      inv.currentStock = (inv.currentStock || 0) + qty;
      inv.status = calculateStatus(inv.currentStock, inv.reorderPoint);
      inv.movements.unshift({
        type: "in",
        units: qty,
        reason,
        by: "System",
        date: new Date(),
      });
      await inv.save();
    }
  } catch (err) {
    console.error("Error restoring inventory stock:", err);
  }
};

// Return referral points spent on an order back to the user's account.
// Safe to call multiple times: the `pointsRefunded` flag is claimed atomically
// so points are only ever credited once per order.
export const refundReferralPoints = async (order) => {
  try {
    const points = Math.max(0, Number(order.pointsUsed || order.referralDiscount || 0));
    if (points <= 0) return 0;

    const orderId = order._id;
    // Atomically mark pointsRefunded = true so we never refund twice
    const claimed = await Order.findOneAndUpdate(
      { _id: orderId, pointsRefunded: { $ne: true } },
      { $set: { pointsRefunded: true } },
      { new: true }
    );
    if (!claimed) {
      return 0;
    }

    const userId = order.user?._id || order.user;
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { referralPoints: points, walletBalance: points },
      });
    }
    order.pointsRefunded = true;

    try {
      await sendNotification(
        userId,
        "Referral Points Refunded",
        `${points} referral points from cancelled order ${order.orderNumber || ""} have been returned to your account.`,
        "order",
        "/account"
      );
    } catch (notifErr) {
      console.error("Failed to send points refund notification:", notifErr);
    }

    return points;
  } catch (err) {
    console.error("Error refunding referral points:", err);
    return 0;
  }
};

export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, address, couponCode, useReferralPoints, paymentMethod = "card", paymentStatus, paymentId } = req.body;
  const codEnabledSetting = await Setting.findOne({ key: "codOn" }).lean();
  const codChargeSetting = await Setting.findOne({ key: "codCharge" }).lean();
  const codEnabled = codEnabledSetting?.value !== false;
  if (paymentMethod === "cod" && !codEnabled) {
    res.status(400);
    throw new Error("Cash on Delivery is currently unavailable");
  }
  const configuredCodCharge = Math.max(0, Number(codChargeSetting?.value) || 0);
  const hasGlobalCodCharge = Boolean(codChargeSetting);
  let shippingAddress = address;
  if (addressId && !address) {
    const Address = (await import("../models/Address.js")).default;
    const saved = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!saved) {
      res.status(400);
      throw new Error("Address not found");
    }
    shippingAddress = {
      fullName: saved.fullName,
      phone: saved.phone,
      street: saved.street,
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
    };
  }
  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
    res.status(400);
    throw new Error("Valid shipping address is required");
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || !cart.items.length) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const shippingOnSetting = await Setting.findOne({ key: "shippingOn" }).lean();
  const shippingChargeSetting = await Setting.findOne({ key: "shippingCharge" }).lean();
  const freeShippingThresholdSetting = await Setting.findOne({ key: "freeShippingThreshold" }).lean();

  const shippingEnabled = shippingOnSetting?.value !== false;
  const configuredShippingCharge = shippingChargeSetting ? Math.max(0, Number(shippingChargeSetting.value) || 0) : 10;
  const configuredFreeThreshold = freeShippingThresholdSetting ? Math.max(0, Number(freeShippingThresholdSetting.value) || 0) : 100;

  const items = [];
  let itemsSubtotal = 0;
  let itemCodChargeSum = 0;
  for (const line of cart.items) {
    if (!line.product) continue;
    const product = await Product.findById(line.product._id);
    if (!product || !product.isActive) continue;

    const variant = product.variants.find((v) => v.sku === line.sku);
    if (!variant || !variant.isActive) continue;

    const qty = Math.min(line.quantity, variant.currentStock);
    if (qty < 1) continue;

    const price = variant.sellingPrice;
    const itemDeliveryCharge = paymentMethod === "cod" && !hasGlobalCodCharge
      ? (Number(product.deliveryCharge) || 0) * qty
      : 0;
    items.push({
      productId: product._id,
      sku: line.sku,
      title: `${product.title} (${line.sku})`,
      image: variant.image || product.images?.[0] || null,
      price,
      quantity: qty,
      deliveryCharge: itemDeliveryCharge,
      vendorId: variant.currentVendor,
      attributes: line.attributes || [],
    });
    itemsSubtotal += price * qty;
    itemCodChargeSum += itemDeliveryCharge;

    // Deduct stock on product variant
    variant.currentStock -= qty;
    await product.save();

    // Deduct stock on inventory item
    await deductInventoryStock(product, line.sku, qty, "Product sale (Customer purchase)");
  }

  if (items.length === 0) {
    res.status(400);
    throw new Error("No valid items in cart");
  }

  const baseShippingFee = shippingEnabled
    ? (itemsSubtotal >= configuredFreeThreshold ? 0 : configuredShippingCharge)
    : 0;

  const codDeliveryCharge = paymentMethod === "cod"
    ? (hasGlobalCodCharge ? configuredCodCharge : itemCodChargeSum)
    : 0;

  const deliveryCharge = baseShippingFee + codDeliveryCharge;
  let totalAmount = itemsSubtotal + deliveryCharge;

  let discountAmount = 0;
  if (couponCode && couponCode.trim()) {
    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
    if (
      coupon &&
      (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) &&
      (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit)
    ) {
      const userRecord = (coupon.usedBy || []).find(
        (u) => u.userId && u.userId.toString() === req.user._id.toString()
      );
      const userCount = userRecord ? userRecord.count : 0;
      const maxPerUser = coupon.maxUsesPerUser || 1;

      if (userCount < maxPerUser) {
        if (coupon.discountType === "percentage") {
          discountAmount = (itemsSubtotal * (coupon.discountValue || 0)) / 100;
        } else {
          discountAmount = Math.min(coupon.discountValue || 0, itemsSubtotal);
        }
        discountAmount = Math.min(discountAmount, itemsSubtotal);
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        if (userRecord) {
          userRecord.count += 1;
        } else {
          if (!coupon.usedBy) coupon.usedBy = [];
          coupon.usedBy.push({ userId: req.user._id, count: 1 });
        }
        await coupon.save();
      }
    }
  }
  const productSubtotalAfterCoupon = Math.max(0, itemsSubtotal - discountAmount);
  totalAmount = productSubtotalAfterCoupon + deliveryCharge;

  const hasCustomPoints = req.body.referralPointsToUse !== undefined && req.body.referralPointsToUse !== null;
  const reqPoints = hasCustomPoints
    ? Number(req.body.referralPointsToUse)
    : (useReferralPoints ? 999999 : 0);
  let referralDiscount = 0;
  let pointsUsed = 0;
  if (reqPoints > 0) {
    const userDoc = await User.findById(req.user._id);
    const availablePoints = Math.max(0, userDoc?.referralPoints || userDoc?.walletBalance || 0);
    if (availablePoints > 0) {
      pointsUsed = Math.min(reqPoints, availablePoints, totalAmount);
      referralDiscount = pointsUsed;
      totalAmount = Math.max(0, totalAmount - referralDiscount);

      if (userDoc) {
        userDoc.referralPoints = Math.max(0, (userDoc.referralPoints || 0) - pointsUsed);
        userDoc.walletBalance = Math.max(0, (userDoc.walletBalance || 0) - pointsUsed);
        await userDoc.save();
      }
    }
  }

  const hexSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const orderNumber = `ORD-${hexSuffix}`;
  const invoiceNumber = `INV-${hexSuffix}`;

  const initialPaymentStatus = paymentStatus && ["paid", "pending", "failed"].includes(String(paymentStatus).toLowerCase())
    ? String(paymentStatus).toLowerCase()
    : "pending";

  const initialPaymentId = paymentId || (initialPaymentStatus === "paid" ? `PAY-${hexSuffix}` : undefined);

  const order = await Order.create({
    orderNumber,
    invoiceNumber,
    user: req.user._id,
    items,
    totalAmount,
    deliveryCharge,
    shippingCharge: baseShippingFee,
    codFee: codDeliveryCharge,
    paymentMethod,
    address: shippingAddress,
    paymentStatus: initialPaymentStatus,
    paymentId: initialPaymentId,
    orderStatus: "pending",
    couponCode: discountAmount > 0 ? couponCode.trim().toUpperCase() : undefined,
    discountAmount,
    referralDiscount,
    pointsUsed,
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

  // Mark customer as verified once they make at least one purchase
  await User.findByIdAndUpdate(req.user._id, { isVerified: true });

  if (initialPaymentStatus === "paid") {
    await logTransaction(
      req.user._id,
      totalAmount,
      "payment",
      paymentMethod,
      "completed",
      `Online payment completed for order #${order.orderNumber}`,
      order._id
    );
  }

  // Notify user in app
  await sendNotification(
    req.user._id,
    "Order Placed!",
    `Your order ${order.orderNumber} has been placed successfully.`,
    "order",
    `/orders/${order.orderNumber}`
  );

  // Trigger WhatsApp order confirmation notification in background
  handleOrderPlaced(order._id);

  res.status(201).json(order);
});

export const handleOrderPlaced = async (orderId) => {
  try {
    const orderWithDetails = await Order.findById(orderId)
      .populate("user", "name phone email")
      .populate("items.productId", "name title");
    if (orderWithDetails) {
      sendOrderConfirmation(orderWithDetails).catch((err) =>
        console.error("WhatsApp notification background error:", err)
      );
    }
  } catch (err) {
    console.error("Failed to fetch order for WhatsApp notification:", err);
  }
};

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rawStatus = req.body.orderStatus || req.body.status;

  if (!rawStatus) {
    res.status(400);
    throw new Error("Order status is required");
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const normalizedStatus = String(rawStatus).toLowerCase();
  order.orderStatus = normalizedStatus;
  await order.save();

  // If order is delivered, reward the referrer
  if (normalizedStatus === "delivered") {
    await rewardReferrer(order);
  }

  // If order is cancelled, return any referral points the user spent on it
  if (normalizedStatus === "cancelled") {
    await refundReferralPoints(order);
  }

  res.json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const productIds = orders.flatMap((order) => order.items.map((item) => item.productId).filter(Boolean));
  const products = await Product.find({ _id: { $in: productIds } }).select("title images variants").lean();
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  // Also query any returns for this user to attach up-to-date return & refund status
  const userReturns = await Return.find({ userId: req.user._id }).lean();
  const returnsByOrderId = new Map();
  for (const ret of userReturns) {
    const ordKey = (ret.orderId?._id || ret.orderId || "").toString();
    if (ordKey) {
      returnsByOrderId.set(ordKey, ret);
    }
  }

  const ordersWithImages = orders.map((order) => {
    const shortCode = (order._id || "").toString().slice(-6).toUpperCase();
    const orderNumber = order.orderNumber || `ORD-${shortCode}`;
    const invoiceNumber = order.invoiceNumber || `INV-${shortCode}`;

    const linkedReturn = returnsByOrderId.get(order._id.toString());
    const effectiveReturnStatus = linkedReturn?.status || order.returnStatus || "none";
    const effectiveReturnId = linkedReturn?._id || order.returnId || null;
    const effectiveRefundAmount = linkedReturn?.refundAmount ?? order.refundAmount ?? 0;
    const effectiveRefundMethod = linkedReturn?.refundMethod || order.refundMethod || "Original Payment Method";
    const effectiveReturnDeliveryStatus = linkedReturn?.deliveryStatus || "Pickup Pending";
    const effectiveReturnTracking = linkedReturn?.tracking || "";

    return {
      ...order,
      orderNumber,
      invoiceNumber,
      returnStatus: effectiveReturnStatus,
      returnId: effectiveReturnId,
      refundAmount: effectiveRefundAmount,
      refundMethod: effectiveRefundMethod,
      returnDeliveryStatus: effectiveReturnDeliveryStatus,
      returnTracking: effectiveReturnTracking,
      items: order.items.map((item) => {
        if (item.image) return item;
        const product = productsById.get(item.productId?.toString());
        const variant = product?.variants?.find((entry) => entry.sku === item.sku);
        return {
          ...item,
          title: item.title || product?.title || "Product",
          image: variant?.image || product?.images?.[0] || null,
        };
      }),
    };
  });

  res.json(ordersWithImages);
});

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).lean();

  const formatted = orders.map((o) => {
    const shortCode = (o._id || "").toString().slice(-6).toUpperCase();
    const itemsSubtotal = (o.items || []).reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
    const discountAmount = Number(o.discountAmount || 0);
    const shippingCharge = o.shippingCharge !== undefined ? o.shippingCharge : (o.paymentMethod === "cod" ? 0 : o.deliveryCharge || 0);
    const codFee = o.codFee !== undefined ? o.codFee : (o.paymentMethod === "cod" ? o.deliveryCharge || 0 : 0);
    const referralDiscount = Number(o.referralDiscount || 0);

    const productSubtotalAfterCoupon = Math.max(0, itemsSubtotal - discountAmount);
    const calculatedTotal = Math.max(0, productSubtotalAfterCoupon + shippingCharge + codFee - referralDiscount);

    return {
      ...o,
      orderNumber: o.orderNumber || `ORD-${shortCode}`,
      invoiceNumber: o.invoiceNumber || `INV-${shortCode}`,
      discountAmount,
      referralDiscount,
      totalAmount: o.totalAmount != null ? o.totalAmount : calculatedTotal,
    };
  });
  res.json(formatted);
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
  const order = await Order.findOne(
    isObjectId
      ? { $or: [{ _id: req.params.id }, { orderNumber: req.params.id.toUpperCase() }] }
      : { orderNumber: req.params.id.toUpperCase() }
  ).populate("user", "name email");

  if (!order || (order.user?._id?.toString() !== req.user._id.toString() && order.user?.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
    res.status(404);
    throw new Error("Order not found");
  }
  const shortCode = (order._id || "").toString().slice(-6).toUpperCase();
  const orderObj = order.toObject ? order.toObject() : order;
  orderObj.orderNumber = orderObj.orderNumber || `ORD-${shortCode}`;
  orderObj.invoiceNumber = orderObj.invoiceNumber || `INV-${shortCode}`;

  const itemsSubtotal = (orderObj.items || []).reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
  const discountAmount = Number(orderObj.discountAmount || 0);
  const shippingCharge = orderObj.shippingCharge !== undefined ? orderObj.shippingCharge : (orderObj.paymentMethod === "cod" ? 0 : orderObj.deliveryCharge || 0);
  const codFee = orderObj.codFee !== undefined ? orderObj.codFee : (orderObj.paymentMethod === "cod" ? orderObj.deliveryCharge || 0 : 0);
  const referralDiscount = Number(orderObj.referralDiscount || 0);
  const productSubtotalAfterCoupon = Math.max(0, itemsSubtotal - discountAmount);

  orderObj.discountAmount = discountAmount;
  orderObj.totalAmount = orderObj.totalAmount != null ? orderObj.totalAmount : Math.max(0, productSubtotalAfterCoupon + shippingCharge + codFee - referralDiscount);

  res.json(orderObj);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const isObjectId = mongoose.Types.ObjectId.isValid(targetId) && /^[0-9a-fA-F]{24}$/.test(String(targetId));

  const order = await Order.findOne(
    isObjectId
      ? { $or: [{ _id: targetId }, { orderNumber: String(targetId).toUpperCase() }] }
      : { orderNumber: String(targetId).toUpperCase() }
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const userId = order.user?._id ? order.user._id.toString() : order.user?.toString();
  if (userId !== req.user._id.toString() && req.user.role !== "admin" && req.user.role !== "superadmin") {
    res.status(401);
    throw new Error("Not authorized to cancel this order");
  }

  const currentStatus = (order.orderStatus || "").toLowerCase();
  if (!["pending", "processing", "placed", "confirmed"].includes(currentStatus)) {
    res.status(400);
    throw new Error(`Cannot cancel order in ${order.orderStatus} status. Only pending or processing orders can be cancelled.`);
  }

  const reason = req.body?.reason || req.body?.cancellationReason || "Customer cancelled order";
  order.orderStatus = "cancelled";
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  order.cancelledBy = req.user?.role === "admin" ? "admin" : "user";
  await order.save();

  // Return referral points used on this order back to the user
  const refundedPoints = await refundReferralPoints(order);

  // Restore stock
  if (Array.isArray(order.items)) {
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId);
      const qty = item.quantity || 1;
      if (product && Array.isArray(product.variants)) {
        const variant = product.variants.find((v) => v.sku === item.sku) || product.variants[0];
        if (variant) {
          variant.currentStock = (variant.currentStock || 0) + qty;
          product.markModified("variants");
          await product.save();
        }
      }
      if (product) {
        await restoreInventoryStock(
          product,
          item.sku,
          qty,
          `Order #${order.orderNumber || order._id} cancelled - stock restored`
        );
      }
    }
  }

  // Notify admins that user cancelled an order
  try {
    const adminUsers = await User.find({ role: { $in: ["admin", "superadmin"] } });
    const orderNum = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
    const customerName = req.user?.name || order.address?.fullName || "Customer";
    const amount = order.totalAmount != null ? ` (₹${order.totalAmount})` : "";
    for (const admin of adminUsers) {
      await sendNotification(
        admin._id,
        "Order Cancelled by User",
        `${customerName} cancelled Order #${orderNum}${amount}. Reason: ${reason}`,
        "order_cancelled",
        "/orders"
      );
    }
  } catch (adminNotifErr) {
    console.error("Failed to notify admins of cancelled order:", adminNotifErr);
  }

  res.json({
    message: refundedPoints > 0
      ? `Order cancelled successfully. ${refundedPoints} referral points returned to your account.`
      : "Order cancelled successfully",
    order,
    refundedPoints,
  });
});
