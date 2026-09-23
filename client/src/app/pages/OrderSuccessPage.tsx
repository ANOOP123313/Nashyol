"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrderSuccessCard } from "../components/OrderSuccessCard";
import { Button } from "../components/ui/button";
import { ArrowLeft, ArrowRight, Package, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

import { useAuth } from "../contexts/AuthContext";
import { ordersApi } from "../../services/api";

function formatOrder(raw: any, currentUser?: any) {
  if (!raw) return null;

  const rawId = raw._id || raw.id || raw.orderNumber || "";
  const orderNumber = raw.orderNumber || (rawId ? `ORD-${rawId.slice(-8).toUpperCase()}` : `ORD-${Date.now().toString(36).toUpperCase()}`);

  const addr = raw.shippingAddress || raw.address || {};
  const name = addr.fullName || addr.name || currentUser?.name || "Valued Customer";
  const street = addr.street || addr.address || "";
  const city = addr.city || "";
  const state = addr.state || "";
  const zip = addr.pincode || addr.zip || "";

  const rawItems = raw.items || raw.orderItems || [];
  const items = rawItems.map((it: any) => ({
    id: it.productId || it.id || it.sku || Math.random().toString(),
    name: it.title || it.name || "Product Item",
    price: Number(it.price) || 0,
    quantity: Number(it.quantity || it.qty) || 1,
    image: it.image || it.img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    variant: it.variant,
  }));

  const paymentMethod = raw.paymentMethod || (raw.paymentStatus === "pending" ? "Cash on Delivery" : "Credit Card / Online Payment");
  const productAmount = Number(raw.productAmount) || items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const codCharge = paymentMethod.toLowerCase().includes("cod") || paymentMethod.toLowerCase().includes("cash")
    ? Number(raw.codCharge ?? raw.deliveryCharge) || items.reduce((sum: number, item: any) => sum + (Number(item.deliveryCharge) || 0), 0)
    : 0;
  const shippingCharge = Number(raw.shippingCharge) || 0;
  const amount = Number(raw.amount) || productAmount + shippingCharge + codCharge;

  const createdDate = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const deliveryDate = new Date(createdDate);
  deliveryDate.setDate(deliveryDate.getDate() + 4);
  const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    orderNumber,
    amount,
    productAmount,
    codCharge,
    shippingCharge,
    paymentMethod,
    estimatedDelivery,
    shippingAddress: {
      name,
      address: street,
      city,
      state,
      zip,
    },
    itemCount: items.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0),
    items,
  };
}

export function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      const lastOrderStr = localStorage.getItem("lastOrder");
      
      let parsedRaw: any = null;
      if (lastOrderStr) {
        try {
          parsedRaw = JSON.parse(lastOrderStr);
        } catch (e) {
          console.error("Failed to parse lastOrder", e);
        }
      }

      if (parsedRaw && (parsedRaw.items?.length || parsedRaw.orderItems?.length)) {
        setOrderData(formatOrder(parsedRaw, user));
        setLoading(false);
        return;
      }

      // Fallback to latest API order
      try {
        const myOrders: any = await ordersApi.myOrders();
        const ordersList = Array.isArray(myOrders) ? myOrders : myOrders?.orders || [];
        if (ordersList.length > 0) {
          setOrderData(formatOrder(ordersList[0], user));
        } else if (parsedRaw) {
          setOrderData(formatOrder(parsedRaw, user));
        } else {
          setOrderData(null);
        }
      } catch (err) {
        console.error("Failed to fetch recent order", err);
        if (parsedRaw) {
          setOrderData(formatOrder(parsedRaw, user));
        }
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [user]);


  const handleClose = () => {
    router.push("/");
  };

  const handleCelebrate = () => {
    // Trigger confetti explosion
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['var(--primary-color)', '#22c55e', '#3b82f6', '#f59e0b', '#10b981', '#ec4899'],
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50 dark:from-gray-950 dark:via-orange-950/10 dark:to-gray-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Continue Shopping
            <ArrowRight className="size-4 ml-2" />
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCelebrate}
              className="gap-2 bg-gradient-to-r from-[var(--primary-color)]/10 to-orange-500/10 hover:from-[var(--primary-color)]/20 hover:to-orange-500/20 border-[var(--primary-color)]/30"
            >
              <PartyPopper className="size-4 text-[var(--primary-color)]" />
              Celebrate!
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/orders")}
              className="gap-2"
            >
              <Package className="size-4" />
              View All Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Order Success Card */}
      <div className="container mx-auto">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading order confirmation...</div>
        ) : orderData ? (
          <OrderSuccessCard orderData={orderData} onClose={handleClose} />
        ) : (
          <div className="max-w-xl mx-auto my-8 p-12 bg-card rounded-3xl shadow-xl text-center border border-border">
            <Package className="size-16 mx-auto text-[var(--primary-color)] mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Recent Order Found</h2>
            <p className="text-muted-foreground mb-6">Browse our store and place an order to see order details here.</p>
            <Button onClick={() => router.push("/products")} className="bg-[var(--primary-color)] text-white hover:bg-orange-600">
              Explore Products
            </Button>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-[20px] backdrop-blur-sm">
            <p className="text-center text-blue-900 dark:text-blue-300">
              📧 A confirmation email has been sent to your registered email
              address with order details and tracking information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


