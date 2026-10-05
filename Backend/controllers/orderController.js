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

export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, address, couponCode, paymentMethod = "card", paymentStatus, paymentId } = req.body;
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
    if (coupon && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) && (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit)) {
      if (coupon.discountType === "percentage") {
        discountAmount = (totalAmount * (coupon.discountValue || 0)) / 100;
      } else {
        discountAmount = Math.min(coupon.discountValue || 0, totalAmount);
      }
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      await coupon.save();
    }
  }
  totalAmount = Math.max(0, totalAmount - discountAmount);

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
    couponCode: discountAmount > 0 ? couponCode : undefined,
    discountAmount,
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
  const newStatus = req.body.orderStatus || req.body.status;

  if (!newStatus) {
    res.status(400);
    throw new Error("Order status is required");
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = newStatus;
  await order.save();

  // If order is delivered, reward the referrer
  if (newStatus === "delivered") {
    await rewardReferrer(order);
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
    return {
      ...o,
      orderNumber: o.orderNumber || `ORD-${shortCode}`,
      invoiceNumber: o.invoiceNumber || `INV-${shortCode}`,
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

  res.json({ message: "Order cancelled successfully", order });
});
