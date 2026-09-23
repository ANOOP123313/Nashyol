import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { rewardReferrer } from "./referralController.js";
import { sendNotification } from "./notificationController.js";
import { logTransaction } from "./transactionController.js";
import Setting from "../models/Setting.js";
import { sendOrderConfirmation } from "../utils/whatsappService.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, address, couponCode, paymentMethod = "card" } = req.body;
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

  const items = [];
  let totalAmount = 0;
  let deliveryCharge = 0;
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
    });
    totalAmount += price * qty + itemDeliveryCharge;
    deliveryCharge += itemDeliveryCharge;

    // Deduct stock
    variant.currentStock -= qty;
    await product.save();
  }

  if (items.length === 0) {
    res.status(400);
    throw new Error("No valid items in cart");
  }

  if (paymentMethod === "cod" && hasGlobalCodCharge) {
    totalAmount += configuredCodCharge;
    deliveryCharge = configuredCodCharge;
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
      coupon.usedCount = (coupon.usedCount || 0) + 1;
      await coupon.save();
    }
  }
  totalAmount = Math.max(0, totalAmount - discountAmount);

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    deliveryCharge,
    paymentMethod,
    address: shippingAddress,
    paymentStatus: "pending",
    orderStatus: "pending",
    couponCode: discountAmount > 0 ? couponCode : undefined,
    discountAmount,
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

  // Notify user in app
  await sendNotification(
    req.user._id,
    "Order Placed!",
    `Your order ${order._id} has been placed successfully.`,
    "order",
    `/orders/${order._id}`
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

  const ordersWithImages = orders.map((order) => ({
    ...order,
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
  }));

  res.json(ordersWithImages);
});

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to cancel this order");
  }

  if (order.orderStatus !== "pending") {
    res.status(400);
    throw new Error(`Cannot cancel order in ${order.orderStatus} status`);
  }

  order.orderStatus = "cancelled";
  await order.save();

  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      const variant = product.variants.find((v) => v.sku === item.sku);
      if (variant) {
        variant.currentStock += item.quantity;
        await product.save();
      }
    }
  }

  res.json({ message: "Order cancelled successfully", order });
});
