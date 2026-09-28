"use client";

import { useEffect, useState } from "react";
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
import { ordersApi } from "../../services/api";

export function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [orderPlacedModalOpen, setOrderPlacedModalOpen] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState<any>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed my mind");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/orders");
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    ordersApi.myOrders()
      .then((data) => setOrders(data.map((order: any) => {
        const shortSuffix = (order._id || "").toString().slice(-6).toUpperCase();
        const ordNumber = order.orderNumber || `ORD-${shortSuffix}`;
        const invNumber = order.invoiceNumber || `INV-${shortSuffix}`;
        return {
          id: `#${shortSuffix}`,
          orderNumber: ordNumber,
          invoiceNumber: invNumber,
          rawId: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          dateTime: order.createdAt,
          status: formatStatus(order.orderStatus),
          deliveryDate: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "Pending",
          total: order.totalAmount || 0,
          productAmount: (order.items || []).reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
          codCharge: order.paymentMethod === "cod" ? Number(order.deliveryCharge) || 0 : 0,
          items: (order.items || []).map((item: any) => ({
            id: item.productId,
            name: item.title?.replace(/ \([^)]*\)$/, "") || "Product",
            quantity: item.quantity,
            price: item.price,
            image: item.image || null,
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
  }, [authLoading, user, router]);

  const formatStatus = (status: string) => {
    if (!status) return "Processing";
    return status.replace(/(^|_)(\w)/g, (_, separator, character) => `${separator ? " " : ""}${character.toUpperCase()}`);
  };

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
      default:
        return "bg-muted text-muted-foreground dark:text-muted-foreground border-gray-200 dark:border-gray-700";
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleTrackOrder = (orderNumber: string) => {
    router.push(`/track-order?order=${orderNumber}`);
  };

  const handleReturnRequest = (order: any) => {
    if (order.status !== "Delivered") {
      toast.error("Returns can only be initiated for delivered orders");
      return;
    }
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
    pdf.setFontSize(14);
    pdf.setFontSize(10);
    pdf.text(`Products: Rs. ${Number(order.productAmount ?? order.total).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    if (order.codCharge) {
      y += 7;
      pdf.text(`COD charge: Rs. ${Number(order.codCharge).toFixed(2)}`, pageWidth - 24, y, { align: "right" });
    }
    y += 9;
    pdf.setFontSize(14);
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
      await ordersApi.cancel(targetId);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:bg-transparent dark:from-transparent dark:via-transparent dark:to-transparent pb-24 md:pb-0">
      {/* Hero Header */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {ordersLoading ? <div className="glass-card p-8 text-center text-muted-foreground">Loading your orders...</div> : orders.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">You have no orders yet.</div>
          ) : orders.map((order) => (
            <div
              key={order.id}
              className="glass-card p-6 hover:shadow-xl transition-all duration-300"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-foreground">
                      Order {order.id}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getStatusColor(order.status)}
                    >
                      {order.status}
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

                {order.status === "Delivered" && (
                  <Button
                    variant="outline"
                    onClick={() => handleReturnRequest(order)}
                    className="flex-1 min-w-[120px] h-10 border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-medium text-xs sm:text-sm"
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Return
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
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.paymentMethod}
                  </p>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Paid
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
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Return/Refund Modal */}
      {selectedOrder && (
        <ReturnRefundModal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
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
    </div>
  );
}


