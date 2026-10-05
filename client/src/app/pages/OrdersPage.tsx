"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Eye,
  Truck,
  RotateCcw,
  Download,
  MapPin,
  Calendar,
  CreditCard,
  ChevronRight,
  Box,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { ReturnRefundModal } from "../components/ReturnRefundModal";
import { OrderPlacedModal } from "../components/OrderPlacedModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { useAuth } from "../contexts/AuthContext";
import { ordersApi, paymentsApi } from "../../services/api";
import { StripePaymentModal } from "../components/StripePaymentModal";

interface OrdersPageProps {
  hideHero?: boolean;
}

export function OrdersPage({ hideHero = false }: OrdersPageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending" | "delivered" | "cancelled">("all");
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [orderPlacedModalOpen, setOrderPlacedModalOpen] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");

  // Stripe Modal state for Pay Later
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);

  const handlePayNow = async (orderId: string) => {
    try {
      const intentData = await paymentsApi.createIntent(orderId);
      setStripeClientSecret(intentData.clientSecret);
      setStripeOrderId(orderId);
      setStripeModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return "Processing";
    return status.replace(/(^|_)(\w)/g, (_, separator, character) => `${separator ? " " : ""}${character.toUpperCase()}`);
  };

  const fetchOrders = useCallback(() => {
    if (!user) return;
    setOrdersLoading(true);
    ordersApi.myOrders()
      .then((data) => setOrders(data.map((order: any) => {
        const shortSuffix = (order._id || "").toString().slice(-6).toUpperCase();
        const ordNumber = order.orderNumber || `ORD-${shortSuffix}`;
        const invNumber = order.invoiceNumber || `INV-${shortSuffix}`;

        const retStatus = (order.returnStatus && order.returnStatus !== "none") ? order.returnStatus : null;
        let displayStatus = formatStatus(order.orderStatus);
        if (retStatus === "pending") displayStatus = "Return Requested";
        else if (retStatus === "approved") displayStatus = "Return Approved";
        else if (retStatus === "refunded") displayStatus = "Refunded";
        else if (retStatus === "rejected") displayStatus = "Return Rejected";

        return {
          id: `#${shortSuffix}`,
          orderNumber: ordNumber,
          invoiceNumber: invNumber,
          rawId: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          dateTime: order.createdAt,
          status: displayStatus,
          orderStatus: order.orderStatus,
          returnStatus: retStatus,
          returnId: order.returnId,
          refundAmount: order.refundAmount,
          refundMethod: order.refundMethod,
          returnDeliveryStatus: order.returnDeliveryStatus,
          returnTracking: order.returnTracking,
          paymentStatus: order.paymentStatus,
          couponCode: order.couponCode || "",
          discountAmount: Number(order.discountAmount) || 0,
          referralDiscount: Number(order.referralDiscount) || 0,
          pointsUsed: Number(order.pointsUsed) || 0,
          shippingCharge: Number(order.shippingCharge) || 0,
          deliveryDate: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "Pending",
          total: order.totalAmount || 0,
          productAmount: (order.items || []).reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
          codCharge: order.codFee !== undefined ? Number(order.codFee) || 0 : (order.paymentMethod === "cod" ? Number(order.deliveryCharge) || 0 : 0),
          items: (order.items || []).map((item: any) => ({
            id: item.productId,
            name: item.title?.replace(/ \([^)]*\)$/, "") || "Product",
            quantity: item.quantity,
            price: item.price,
            image: item.image || null,
            attributes: item.attributes || [],
          })),
          shippingAddress: {
            name: order.address?.fullName || "",
            address: order.address?.street || "",
            city: order.address?.city || "",
            state: order.address?.state || "",
            zip: order.address?.pincode || "",
          },
          paymentMethod: order.paymentMethod || "Not specified",
          trackingNumber: order.trackingNumber || null,
        };
      })))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load your orders"))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/orders");
      setOrdersLoading(false);
      return;
    }
    fetchOrders();
  }, [authLoading, user, router, fetchOrders]);

  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = orders.find((o) => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders]);

  if (authLoading || (!user && ordersLoading)) {
    return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "In Transit":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Processing":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "Cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "Return Requested":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Return Approved":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Refunded":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "Return Rejected":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      default:
        return "bg-muted text-muted-foreground dark:text-muted-foreground border-gray-200 dark:border-gray-700";
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string, paymentMethod: string) => {
    const statusLower = (paymentStatus || "pending").toLowerCase();
    if (statusLower === "paid") {
      return {
        label: "Paid",
        class: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      };
    }
    if (statusLower === "failed") {
      return {
        label: "Payment Failed",
        class: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      };
    }
    if (statusLower === "refunded") {
      return {
        label: "Refunded",
        class: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      };
    }
    const isCod = (paymentMethod || "").toLowerCase() === "cod";
    return {
      label: isCod ? "Pending (COD)" : "Unpaid",
      class: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    };
  };

  const getReturnBadge = (returnStatus: string) => {
    switch (returnStatus) {
      case "pending":
        return { label: "Return Pending", class: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200" };
      case "approved":
        return { label: "Return Approved", class: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200" };
      case "refunded":
        return { label: "Refunded", class: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200" };
      case "rejected":
        return { label: "Return Rejected", class: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200" };
      default:
        return { label: returnStatus || "N/A", class: "bg-muted text-muted-foreground border-gray-200" };
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleTrackOrder = (orderNumber: string) => {
    router.push(`/delivery-status?track=${encodeURIComponent(orderNumber)}`);
  };

  const handleReturnRequest = (order: any) => {
    setSelectedOrder(order);
    setReturnModalOpen(true);
  };

  const handleDownloadInvoice = (order: any) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 22;

    pdf.setTextColor(249, 115, 22);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("Global Premium", 20, y);
    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text("Customer Invoice", 20, y + 8);
    pdf.text(`Invoice: ${order.invoiceNumber || "INV-" + (order.orderNumber ? order.orderNumber.replace("ORD-", "") : "")}`, pageWidth - 20, y, { align: "right" });
    pdf.text(`Order: ${order.orderNumber}`, pageWidth - 20, y + 7, { align: "right" });
    pdf.text(`Date: ${order.date}`, pageWidth - 20, y + 14, { align: "right" });
    pdf.text(`Status: ${order.status}`, pageWidth - 20, y + 21, { align: "right" });

    y += 35;
    pdf.setDrawColor(249, 115, 22);
    pdf.line(20, y, pageWidth - 20, y);
    y += 15;
    pdf.setFont("helvetica", "bold");
    pdf.text("Shipping Address", 20, y);
    pdf.setFont("helvetica", "normal");
    y += 7;
    const address = order.shippingAddress;
    pdf.text(address.name || "", 20, y);
    pdf.text(address.address || "", 20, y + 6);
    pdf.text(`${address.city || ""}, ${address.state || ""} ${address.zip || ""}`, 20, y + 12);
    pdf.text(`Payment: ${order.paymentMethod || "Not specified"}`, pageWidth - 20, y, { align: "right" });

    y += 28;
    pdf.setFillColor(255, 247, 237);
    pdf.rect(20, y - 6, pageWidth - 40, 10, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("Product", 24, y);
    pdf.text("Qty", 125, y);
    pdf.text("Unit Price", 145, y);
    pdf.text("Amount", pageWidth - 24, y, { align: "right" });
    y += 12;
    pdf.setFont("helvetica", "normal");

    order.items.forEach((item: any) => {
      const name = pdf.splitTextToSize(item.name || "Product", 92)[0];
      pdf.text(name, 24, y);
      pdf.text(String(item.quantity), 125, y);
      pdf.text(`Rs. ${Number(item.price).toFixed(2)}`, 145, y);
      pdf.text(`Rs. ${(Number(item.price) * item.quantity).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
      y += 9;
    });

    pdf.setDrawColor(210, 210, 210);
    pdf.line(20, y, pageWidth - 20, y);
    y += 14;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(`Products Subtotal: Rs. ${Number(order.productAmount ?? order.total).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    if (order.shippingCharge) {
      y += 7;
      pdf.text(`Shipping Charge: Rs. ${Number(order.shippingCharge).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    }
    if (order.codCharge) {
      y += 7;
      pdf.text(`COD Fee: Rs. ${Number(order.codCharge).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    }
    if (order.discountAmount) {
      y += 7;
      pdf.text(`Coupon Discount: -Rs. ${Number(order.discountAmount).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    }
    if (order.referralDiscount) {
      y += 7;
      pdf.text(`Referral Points Discount: -Rs. ${Number(order.referralDiscount).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    }
    y += 10;
    pdf.setFontSize(14);
    pdf.text(`Total Amount Paid: Rs. ${Number(order.total).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    const invCode = order.invoiceNumber || `INV-${String(order.orderNumber).replace("ORD-", "")}`;
    pdf.save(`invoice-${String(invCode).replace(/[^a-z0-9_-]/gi, "-")}.pdf`);
    toast.success("Invoice PDF downloaded", { description: `${invCode} (${order.orderNumber})` });
  };

  const handleOrderPlaced = (order: any) => {
    const demoData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      productAmount: order.productAmount,
      codCharge: order.codCharge,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.deliveryDate,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        attributes: item.attributes || [],
      })),
    };
    setDemoOrderData(demoData);
    setOrderPlacedModalOpen(true);
  };

  const handleCancelOrder = (order: any) => {
    setOrderToCancel(order);
    setCancelReason("Changed my mind");
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    const targetId = orderToCancel.rawId || orderToCancel._id || orderToCancel.orderNumber || orderToCancel.id;
    setCancelling(true);
    try {
      await ordersApi.cancel(targetId, cancelReason);
      toast.success("Order cancelled successfully");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel.id || o.rawId === targetId || o.orderNumber === orderToCancel.orderNumber
            ? { ...o, status: "Cancelled" }
            : o
        )
      );
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (err: any) {
      toast.error("Failed to cancel order: " + (err.message || "Error"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className={hideHero ? "w-full space-y-6" : "min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:bg-transparent dark:from-transparent dark:via-transparent dark:to-transparent pb-24 md:pb-0"}>
      {/* Hero Header */}
      {!hideHero && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 dark:from-orange-600 dark:to-orange-800"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-background/20 backdrop-blur-sm rounded-2xl">
                <Package className="size-8 md:size-10 text-inverse" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-inverse drop-shadow-lg">
                  My Orders
                </h1>
                <p className="text-inverse/90 text-sm md:text-base mt-1">
                  Track and manage your orders
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={hideHero ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        {/* Status Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-border scrollbar-none">
            {[
              { id: "all", label: `All Orders (${orders.length})` },
              { id: "paid", label: `Paid (${orders.filter(o => (o.paymentStatus || "").toLowerCase() === "paid").length})` },
              { id: "pending", label: `Pending / Unpaid (${orders.filter(o => (o.paymentStatus || "").toLowerCase() !== "paid" && (o.orderStatus || "").toLowerCase() !== "cancelled").length})` },
              { id: "delivered", label: `Delivered (${orders.filter(o => (o.orderStatus || "").toLowerCase() === "delivered").length})` },
              { id: "cancelled", label: `Cancelled (${orders.filter(o => (o.orderStatus || "").toLowerCase() === "cancelled").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--primary-color)] text-white shadow-md"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {ordersLoading ? (
            <div className="glass-card p-8 text-center text-muted-foreground">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">You have no orders yet.</div>
          ) : orders.filter((o) => {
            const rawPayment = (o.paymentStatus || "").toLowerCase();
            const rawOrder = (o.orderStatus || "").toLowerCase();
            if (activeTab === "paid") return rawPayment === "paid";
            if (activeTab === "pending") return rawPayment !== "paid" && rawOrder !== "cancelled";
            if (activeTab === "delivered") return rawOrder === "delivered";
            if (activeTab === "cancelled") return rawOrder === "cancelled";
            return true;
          }).length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">No orders match the selected filter.</div>
          ) : orders.filter((o) => {
            const rawPayment = (o.paymentStatus || "").toLowerCase();
            const rawOrder = (o.orderStatus || "").toLowerCase();
            if (activeTab === "paid") return rawPayment === "paid";
            if (activeTab === "pending") return rawPayment !== "paid" && rawOrder !== "cancelled";
            if (activeTab === "delivered") return rawOrder === "delivered";
            if (activeTab === "cancelled") return rawOrder === "cancelled";
            return true;
          }).map((order) => (
            <div
              key={order.id}
              className="glass-card p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-foreground">
                      Order {order.id}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getPaymentStatusBadge(order.paymentStatus, order.paymentMethod).class}
                    >
                      💳 {getPaymentStatusBadge(order.paymentStatus, order.paymentMethod).label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {order.date}
                    </span>
                    <span>•</span>
                    <span>{order.items.length} items</span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-[var(--primary-color)]">
                    ₹{order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items matching screenshot */}
              <div className="space-y-3 mb-6 mt-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-14 sm:size-16 rounded-xl bg-white dark:bg-gray-900 border border-border p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base text-foreground line-clamp-2">
                          {item.name} <span className="text-xs text-muted-foreground font-normal">x{item.quantity}</span>
                        </p>
                        {item.attributes && item.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.attributes.map((a: any) => (
                              <span key={a.name} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                                {a.name}: {a.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-medium text-muted-foreground shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(order)}
                  className="flex-1 min-w-[120px] h-10 border-border bg-card/50 hover:bg-muted font-medium text-xs sm:text-sm"
                >
                  <Eye className="size-4 mr-2" />
                  Details
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleDownloadInvoice(order)}
                  className="flex-1 min-w-[120px] h-10 border-border bg-card/50 hover:bg-muted font-medium text-xs sm:text-sm"
                >
                  <Download className="size-4 mr-2" />
                  Invoice
                </Button>

                {["pending", "processing", "placed", "confirmed"].includes((order.status || "").toLowerCase()) && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelOrder(order)}
                    className="flex-1 min-w-[120px] h-10 border-red-500/30 text-red-500 hover:bg-red-500/10 font-medium text-xs sm:text-sm"
                  >
                    <XCircle className="size-4 mr-2" />
                    Cancel Order
                  </Button>
                )}

                {order.trackingNumber && (
                  <Button
                    variant="outline"
                    onClick={() => handleTrackOrder(order.orderNumber)}
                    className="flex-1 min-w-[120px] h-10 border-border bg-card/50 hover:bg-muted font-medium text-xs sm:text-sm"
                  >
                    <Truck className="size-4 mr-2" />
                    Track
                  </Button>
                )}

                {order.status === "Delivered" && !order.returnStatus && (
                  <Button
                    variant="outline"
                    onClick={() => handleReturnRequest(order)}
                    className="flex-1 min-w-[120px] h-10 border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-medium text-xs sm:text-sm"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Return
                  </Button>
                )}

                {order.returnStatus && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/returns-refunds?track=${encodeURIComponent(order.orderNumber)}`)}
                    className="flex-1 min-w-[120px] h-10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium text-xs sm:text-sm"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Track Return
                  </Button>
                )}

                {order.paymentStatus !== "paid" && order.status !== "Cancelled" && (
                  <Button
                    onClick={() => handlePayNow(order.rawId)}
                    className="flex-1 min-w-[120px] h-10 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-xs sm:text-sm shadow-md"
                  >
                    <CreditCard className="size-4 mr-2" />
                    Pay Now
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => handleOrderPlaced(order)}
                  className="flex-1 min-w-[120px] h-10 border-border bg-card/50 hover:bg-muted font-medium text-xs sm:text-sm"
                >
                  <Box className="size-4 mr-2" />
                  Order Placed
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--primary-color)]/10 rounded-lg">
                  <Box className="size-6 text-[var(--primary-color)]" />
                </div>
                <DialogTitle className="text-2xl">Order Details</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    Order Number
                  </p>
                  <p className="font-bold text-foreground">
                    {selectedOrder.orderNumber}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedOrder.status)}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    Order Date
                  </p>
                  <p className="font-bold text-foreground">
                    {selectedOrder.date}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    Delivery Date
                  </p>
                  <p className="font-bold text-foreground">
                    {selectedOrder.deliveryDate}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-foreground mb-4">
                  Order Items ({selectedOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="size-20 bg-background rounded-lg flex items-center justify-center">
                          <Package className="size-7 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        {item.attributes && item.attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.attributes.map((a: any) => (
                              <span key={a.name} className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border">
                                {a.name}: {a.value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-foreground">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Shipping & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-xl">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="size-5 text-[var(--primary-color)]" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {selectedOrder.shippingAddress.name}
                    </p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zip}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-xl">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="size-5 text-[var(--primary-color)]" />
                    Payment Method
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : selectedOrder.paymentMethod}
                    {selectedOrder.paymentStatus === "paid" && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">Paid</Badge>
                    )}
                    {selectedOrder.paymentStatus !== "paid" && (
                      <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                  </p>
                  
                  {selectedOrder.paymentMethod === "cod" && selectedOrder.paymentStatus !== "paid" && selectedOrder.status !== "Cancelled" && (
                    <Button 
                      onClick={() => handlePayNow(selectedOrder.rawId)}
                      className="mt-3 w-full bg-[var(--primary-color)] text-white hover:bg-orange-600"
                    >
                      Pay Now Online
                    </Button>
                  )}

                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total {selectedOrder.paymentStatus === "paid" ? "Paid" : "Amount"}
                    </span>
                    <span className="text-xl font-bold text-[var(--primary-color)]">
                      ₹{selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.trackingNumber && (
                <>
                  <Separator />
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          Tracking Number
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                      <Button
                        onClick={() =>
                          handleTrackOrder(selectedOrder.orderNumber)
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Truck className="size-4 mr-2" />
                        Track Order
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Return & Refund Info if return exists */}
              {selectedOrder.returnStatus && (
                <>
                  <Separator />
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="size-5 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-semibold text-foreground">Return & Refund Status</h4>
                      </div>
                      <Badge variant="outline" className={getReturnBadge(selectedOrder.returnStatus).class}>
                        {getReturnBadge(selectedOrder.returnStatus).label}
                      </Badge>
                    </div>
                    {Number(selectedOrder.refundAmount) > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Refund Amount: <span className="font-semibold text-foreground">₹{Number(selectedOrder.refundAmount).toFixed(2)}</span>
                        {selectedOrder.refundMethod ? ` via ${selectedOrder.refundMethod.toUpperCase()}` : ""}
                      </p>
                    )}
                    {selectedOrder.returnDeliveryStatus && (
                      <p className="text-xs text-muted-foreground">
                        Pickup / Delivery: <span className="font-medium text-foreground">{selectedOrder.returnDeliveryStatus}</span>
                      </p>
                    )}
                    {selectedOrder.returnTracking && (
                      <p className="text-xs text-muted-foreground font-mono">
                        Tracking Number: {selectedOrder.returnTracking}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Return/Refund Modal */}
      {selectedOrder && (
        <ReturnRefundModal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          onSuccess={fetchOrders}
          orderData={{
            orderNumber: selectedOrder.orderNumber,
            rawId: selectedOrder.rawId || selectedOrder._id,
            _id: selectedOrder.rawId || selectedOrder._id,
            orderDate: selectedOrder.date,
            items: selectedOrder.items,
          }}
        />
      )}

      {/* Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent className="max-w-md p-6 rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground">Cancel Order</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Order {orderToCancel.id || orderToCancel.orderNumber}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm text-foreground">
                Are you sure you want to cancel this order? This action cannot be undone and any reserved stock will be released.
              </p>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full h-11 px-3 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price">Found a better price</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Incorrect shipping address entered">Incorrect shipping address entered</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={cancelling}
                  className="flex-1 h-11"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={confirmCancelOrder}
                  disabled={cancelling}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Order Placed Modal */}
      {demoOrderData && (
        <OrderPlacedModal
          isOpen={orderPlacedModalOpen}
          onClose={() => setOrderPlacedModalOpen(false)}
          orderData={demoOrderData}
        />
      )}

      <StripePaymentModal
        isOpen={stripeModalOpen}
        clientSecret={stripeClientSecret}
        orderId={stripeOrderId}
        onClose={() => setStripeModalOpen(false)}
        onSuccess={() => {
          setStripeModalOpen(false);
          setDetailsModalOpen(false);
          fetchOrders();
        }}
      />
    </div>
  );
}


