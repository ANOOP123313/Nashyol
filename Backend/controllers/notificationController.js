import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";
import Product from "../models/Product.js";
import Return from "../models/Return.js";
import Coupon from "../models/Coupon.js";
import Review from "../models/Review.js";
import SupportTicket from "../models/SupportTickets.js";
import Order from "../models/Order.js";

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort("-createdAt");
  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification && notification.user.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } else {
    res.status(404);
    throw new Error("Notification not found");
  }
});

// @desc    Internal helper function to create notifications
export const sendNotification = async (userId, title, message, type, link) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
};

// @desc    Get live admin notifications for the 6 core alerts:
//          1. Stock finishes (currentStock === 0)
//          2. Stock reaches reorder point (currentStock <= 10)
//          3. Return/refund request made (status === "pending")
//          4. Coupon expired (expiryDate < now)
//          5. New reviews submitted (pending or recent)
//          6. Customer support tickets (open / in-progress)
// @route   GET /api/notifications/admin
// @access  Public / Admin
export const getAdminNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = [];
    const now = new Date();

    // 1 & 2. Inventory Stock Alerts (Finishes & Reorder Point)
    const products = await Product.find({ isActive: true }).select("title variants category brand updatedAt");
    
    products.forEach((prod) => {
      const variant = prod.variants?.[0] || {};
      const stock = variant.currentStock ?? 0;

      if (stock <= 0) {
        notifications.push({
          id: `out-of-stock-${prod._id}`,
          type: "out_of_stock",
          category: "Inventory",
          title: "Stock Finished",
          message: `Stock for "${prod.title}" has completely run out (0 units in inventory).`,
          link: "/inventory",
          timestamp: prod.updatedAt || now,
          badge: "Out of Stock",
          severity: "high",
        });
      } else if (stock <= 10) {
        notifications.push({
          id: `low-stock-${prod._id}`,
          type: "low_stock",
          category: "Inventory",
          title: "Reorder Point Reached",
          message: `"${prod.title}" is down to ${stock} unit${stock === 1 ? "" : "s"} (reorder point reached).`,
          link: "/inventory",
          timestamp: prod.updatedAt || now,
          badge: `${stock} left`,
          severity: "medium",
        });
      }
    });

    // 3. Return / Refund Requests Made
    const pendingReturns = await Return.find({ status: "pending" })
      .populate("userId", "name email phone")
      .populate("orderId", "orderNumber totalAmount")
      .sort({ createdAt: -1 })
      .limit(15);

    pendingReturns.forEach((ret) => {
      const customerName = ret.userId?.name || "Customer";
      const count = ret.items?.length || 1;
      notifications.push({
        id: `return-${ret._id}`,
        type: "return_request",
        category: "Returns",
        title: "Return/Refund Requested",
        message: `${customerName} submitted a return request for ${count} item(s). Reason: ${ret.reason || "Customer return request"}`,
        link: "/returns",
        timestamp: ret.createdAt,
        badge: "Pending",
        severity: "high",
      });
    });

    // 4. Coupon Expired
    const expiredCoupons = await Coupon.find({
      expiryDate: { $exists: true, $ne: null, $lt: now },
    })
      .sort({ expiryDate: -1 })
      .limit(10);

    expiredCoupons.forEach((coupon) => {
      notifications.push({
        id: `coupon-${coupon._id}`,
        type: "coupon_expired",
        category: "Coupons",
        title: "Coupon Expired",
        message: `Coupon code "${coupon.code}" (${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : "₹"} OFF) has expired.`,
        link: "/coupons",
        timestamp: coupon.expiryDate,
        badge: "Expired",
        severity: "info",
      });
    });

    // 5. New Reviews Submitted
    const pendingReviews = await Review.find({
      $or: [{ status: "pending" }, { isApproved: false }],
    })
      .populate("user", "name")
      .populate("product", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    if (pendingReviews.length > 0) {
      pendingReviews.forEach((rev) => {
        const prodName = rev.product?.title || "Product";
        const reviewer = rev.user?.name || "Customer";
        notifications.push({
          id: `review-${rev._id}`,
          type: "new_review",
          category: "Reviews",
          title: "New Review Submitted",
          message: `${reviewer} gave ${rev.rating}★ to "${prodName}": "${(rev.comment || "").slice(0, 50)}..."`,
          link: "/reviews",
          timestamp: rev.createdAt,
          badge: `${rev.rating} Stars`,
          severity: "medium",
        });
      });
    } else {
      // Also fetch the most recent reviews if no pending ones, so admin sees recent reviews
      const recentReviews = await Review.find()
        .populate("user", "name")
        .populate("product", "title")
        .sort({ createdAt: -1 })
        .limit(5);

      recentReviews.forEach((rev) => {
        const prodName = rev.product?.title || "Product";
        const reviewer = rev.user?.name || "Customer";
        notifications.push({
          id: `review-${rev._id}`,
          type: "new_review",
          category: "Reviews",
          title: "New Customer Review",
          message: `${reviewer} reviewed "${prodName}" (${rev.rating}★): "${(rev.comment || "").slice(0, 50)}..."`,
          link: "/reviews",
          timestamp: rev.createdAt,
          badge: `${rev.rating} Stars`,
          severity: "info",
        });
      });
    }

    // 6. Customer Support Tickets
    const openTickets = await SupportTicket.find({
      status: { $in: ["open", "in-progress"] },
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(15);

    openTickets.forEach((ticket) => {
      const sender = ticket.userId?.name || "Customer";
      notifications.push({
        id: `ticket-${ticket._id}`,
        type: "support_ticket",
        category: "Support",
        title: "Support Ticket Needs Attention",
        message: `${sender}: "${ticket.subject || "Support Request"}" - ${(ticket.message || "").slice(0, 50)}...`,
        link: "/support",
        timestamp: ticket.createdAt,
        badge: (ticket.priority || "Normal").toUpperCase(),
        severity: ticket.priority === "high" ? "high" : "medium",
      });
    });

    // 7. Order Cancellation Notifications
    const cancelledOrders = await Order.find({ orderStatus: "cancelled" })
      .populate("user", "name email phone")
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(15);

    cancelledOrders.forEach((order) => {
      const customerName = order.user?.name || order.address?.fullName || "Customer";
      const orderNum = order.orderNumber || order._id.toString().slice(-8).toUpperCase();
      const amount = order.totalAmount != null ? ` (₹${order.totalAmount})` : "";
      const reason = order.cancellationReason || "Cancelled by customer";
      notifications.push({
        id: `cancelled-order-${order._id}`,
        type: "order_cancelled",
        category: "Orders",
        title: "Order Cancelled by User",
        message: `${customerName} cancelled Order #${orderNum}${amount}. Reason: ${reason}`,
        link: "/orders",
        timestamp: order.cancelledAt || order.updatedAt || order.createdAt || now,
        badge: "Cancelled",
        severity: "high",
      });
    });

    // Sort all notifications by most recent timestamp
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Admin notifications fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
