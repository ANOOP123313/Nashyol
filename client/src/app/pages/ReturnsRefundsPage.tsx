import { useState, useEffect } from "react";
import { RotateCcw, Package, CheckCircle, XCircle, AlertCircle, Clock, Search, Truck, ArrowRight, DollarSign } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import Link from "next/link";
import { returnsApi } from "../../services/api";

export function ReturnsRefundsPage() {
  const [trackQuery, setTrackQuery] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedReturn, setTrackedReturn] = useState<any>(null);
  const [trackError, setTrackError] = useState("");
  const [myReturns, setMyReturns] = useState<any[]>([]);
  const [myReturnsLoading, setMyReturnsLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setMyReturnsLoading(true);
      returnsApi
        .myReturns()
        .then((data) => {
          if (Array.isArray(data)) {
            setMyReturns(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching user returns:", err);
        })
        .finally(() => {
          setMyReturnsLoading(false);
        });
    }
  }, []);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = trackQuery.trim();
    if (!query) return;

    setTrackingLoading(true);
    setTrackError("");
    setTrackedReturn(null);

    try {
      const res = await returnsApi.track(query);
      if (res && res._id) {
        setTrackedReturn(res);
      } else {
        setTrackError(`No return record found for "${query}". Please check your ID and try again.`);
      }
    } catch (err: any) {
      setTrackError(err.message || `No return found for "${query}"`);
    } finally {
      setTrackingLoading(false);
    }
  };

  const returnProcess = [
    {
      step: 1,
      title: "Initiate Return",
      description: "Log into your account and select the order you wish to return",
      icon: Package,
    },
    {
      step: 2,
      title: "Print Label",
      description: "Download and print your prepaid return shipping label",
      icon: Clock,
    },
    {
      step: 3,
      title: "Ship Package",
      description: "Pack items securely and drop off at any carrier location",
      icon: RotateCcw,
    },
    {
      step: 4,
      title: "Get Refund",
      description: "Receive your refund within 5-7 business days after we receive your return",
      icon: CheckCircle,
    },
  ];

  const eligibleItems = [
    "Unused items in original condition",
    "Items with all original tags attached",
    "Products in original packaging",
    "Items returned within 30 days of delivery",
    "Non-personalized or custom items",
  ];

  const nonEligibleItems = [
    "Personalized or customized products",
    "Intimate apparel and swimwear",
    "Beauty products and cosmetics (opened)",
    "Perishable goods and food items",
    "Digital downloads and gift cards",
    "Final sale items marked as non-returnable",
  ];

  const refundMethods = [
    {
      method: "Original Payment Method",
      time: "5-7 business days",
      description: "Refund issued to the original payment method used for purchase",
    },
    {
      method: "Store Credit",
      time: "Instant",
      description: "Get 110% back as store credit for faster refunds and bonus value",
    },
    {
      method: "Exchange",
      time: "Ships immediately",
      description: "Exchange for different size, color, or equal value item",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <Badge className="bg-blue-600 hover:bg-blue-600 text-white">Approved</Badge>;
      case "refunded":
        return <Badge className="bg-green-600 hover:bg-green-600 text-white">Refunded</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 hover:bg-red-600 text-white">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Pending Review</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted dark:bg-transparent">
      {/* Header */}
      <div className="bg-background dark:bg-card/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-lg flex items-center justify-center">
              <RotateCcw className="size-6 text-inverse" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Returns & Refunds
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            We want you to be completely satisfied with your purchase. If you're not
            happy, we're here to help with our hassle-free 30-day return policy.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Track Return Section (Live DB Query) */}
        <Card className="p-6 sm:p-8 mb-16 bg-gradient-to-r from-orange-50 via-white to-orange-50/30 border-orange-200 dark:bg-card dark:border-border shadow-sm">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-3 text-xs font-semibold px-3 py-1">
              Live Return & Refund Status
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Track Your Return & Refund
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Enter your Return ID (e.g. <span className="font-mono font-medium">RET-XXXXX</span>), Tracking Number, or Order ID to view real-time status directly from our system.
            </p>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Return ID, Tracking # or Order ID..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-muted border border-gray-200 dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-gray-900 dark:text-white shadow-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={trackingLoading || !trackQuery.trim()}
                className="bg-[var(--primary-color)] hover:bg-orange-600 text-white px-6 py-3 h-auto text-sm font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                {trackingLoading ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Status</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Error Message */}
            {trackError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center justify-center gap-2 max-w-xl mx-auto">
                <AlertCircle className="size-4 flex-shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {/* Track Result Card */}
            {trackedReturn && (
              <div className="mt-6 text-left bg-white dark:bg-card border border-orange-200 dark:border-border rounded-xl p-5 sm:p-6 shadow-md max-w-2xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-border pb-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono">
                      RETURN #{trackedReturn._id?.slice(-8)?.toUpperCase()}
                    </span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                      Order: ORD-{(trackedReturn.orderId?._id || trackedReturn.orderId || "")?.slice(-8)?.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(trackedReturn.status)}
                  </div>
                </div>

                {/* Returned Item */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="size-16 rounded-lg bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border overflow-hidden flex-shrink-0">
                    <img
                      src={
                        trackedReturn.items?.[0]?.productId?.images?.[0] ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                      }
                      alt="Returned product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                      {trackedReturn.items?.[0]?.productId?.title || "Returned Product"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      Reason: {trackedReturn.reason || trackedReturn.items?.[0]?.reason || "Not specified"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        Refund Amount: ₹{Number(trackedReturn.refundAmount || 0).toFixed(2)}
                      </span>
                      {trackedReturn.refundMethod && (
                        <span className="text-gray-500">via {trackedReturn.refundMethod}</span>
                      )}
                      {trackedReturn.tracking && (
                        <span className="font-mono bg-gray-100 dark:bg-muted px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          Tracking: {trackedReturn.tracking}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-gray-50 dark:bg-card/60 rounded-lg p-4 border border-transparent dark:border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="flex flex-col items-center">
                      <div className="size-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mb-1">
                        ✓
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">Requested</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(trackedReturn.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`size-7 rounded-full flex items-center justify-center font-bold mb-1 ${
                          trackedReturn.status === "approved" || trackedReturn.status === "refunded"
                            ? "bg-green-100 text-green-700"
                            : trackedReturn.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {trackedReturn.status === "approved" || trackedReturn.status === "refunded"
                          ? "✓"
                          : trackedReturn.status === "rejected"
                          ? "✕"
                          : "•"}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trackedReturn.status === "rejected"
                          ? "Rejected"
                          : trackedReturn.status === "approved" || trackedReturn.status === "refunded"
                          ? "Approved"
                          : "Reviewing"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`size-7 rounded-full flex items-center justify-center font-bold mb-1 ${
                          trackedReturn.deliveryStatus === "Delivered" ||
                          trackedReturn.deliveryStatus === "Delivered to Warehouse" ||
                          trackedReturn.status === "refunded"
                            ? "bg-green-100 text-green-700"
                            : trackedReturn.deliveryStatus === "In Transit"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Truck className="size-3.5" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trackedReturn.deliveryStatus || "In Transit"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        className={`size-7 rounded-full flex items-center justify-center font-bold mb-1 ${
                          trackedReturn.status === "refunded"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <DollarSign className="size-3.5" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trackedReturn.status === "refunded" ? "Refund Paid" : "Refund"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* User's Recent Returns (If logged in) */}
        {myReturns.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Your Return Requests</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Active and past returns associated with your account
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/account">View in Account</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myReturns.map((item) => (
                <Card key={item._id} className="p-5 border shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        RET-{item._id?.slice(-5)?.toUpperCase()}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <h4 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
                      {item.items?.[0]?.productId?.title || "Returned Product"}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      Reason: {item.reason || item.items?.[0]?.reason || "Return requested"}
                    </p>
                  </div>
                  <div className="border-t pt-3 mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-orange-600">
                      ₹{Number(item.refundAmount || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        setTrackQuery(item._id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs text-[var(--primary-color)] hover:underline font-medium"
                    >
                      Track this &rarr;
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-[var(--primary-color)] mb-2">30</div>
            <p className="text-muted-foreground">Day Return Window</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-[var(--primary-color)] mb-2">FREE</div>
            <p className="text-muted-foreground">Return Shipping Label</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-[var(--primary-color)] mb-2">5-7</div>
            <p className="text-muted-foreground">Days for Refund</p>
          </Card>
        </div>

        {/* Return Process */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            How to Return an Item
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {returnProcess.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="p-6 relative">
                  <div className="absolute -top-3 -left-3 size-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-inverse font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <Icon className="size-10 text-[var(--primary-color)] mb-4 mt-2" />
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </Card>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Button className="bg-[var(--primary-color)] hover:bg-orange-600" size="lg" asChild>
              <Link href="/orders">Start a Return</Link>
            </Button>
          </div>
        </div>

        {/* Eligible vs Non-Eligible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
              <h3 className="text-xl font-bold text-foreground">
                Eligible for Return
              </h3>
            </div>
            <ul className="space-y-3">
              {eligibleItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="size-8 text-red-600 dark:text-red-400" />
              <h3 className="text-xl font-bold text-foreground">
                Not Eligible for Return
              </h3>
            </div>
            <ul className="space-y-3">
              {nonEligibleItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Refund Methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Refund Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {refundMethods.map((method, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {method.method}
                  </h3>
                  {index === 1 && (
                    <Badge className="bg-green-600 hover:bg-green-600 text-inverse">
                      +10% Bonus
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-semibold text-[var(--primary-color)]">{method.time}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {method.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Return Shipping */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Return Shipping Information
          </h2>
          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-foreground mb-3">
                  Free Returns
                </h3>
                <p className="text-muted-foreground mb-4">
                  We provide a prepaid return shipping label for all eligible returns
                  within the United States. The return shipping cost will be deducted from
                  your refund.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>Standard Return:</strong> ₹7.99 deducted from refund
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-3">
                  Defective Items
                </h3>
                <p className="text-muted-foreground mb-4">
                  If you received a defective, damaged, or wrong item, we'll cover the
                  full return shipping cost. Contact us immediately with photos of the
                  issue.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-900 dark:text-green-300">
                    <strong>Defective Returns:</strong> 100% free return shipping
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Exchange Policy */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Exchange Policy
          </h2>
          <Card className="p-8">
            <p className="text-muted-foreground mb-6">
              Want a different size or color? We make exchanges easy! Simply initiate a
              return and place a new order for the item you want. This ensures you get
              your new item as quickly as possible.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <AlertCircle className="size-6 text-[var(--primary-color)] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    Size Exchanges
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    If you need a different size, we'll waive the return shipping fee and
                    ship your new size for free.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <AlertCircle className="size-6 text-[var(--primary-color)] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    Color/Style Exchanges
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Exchange for a different color or style of the same item at no
                    additional cost.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="p-8 bg-muted border-0">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-foreground mb-2">
                When will I receive my refund?
              </h4>
              <p className="text-muted-foreground">
                Refunds are processed within 2-3 business days after we receive your
                return. It may take an additional 5-7 business days for the refund to
                appear in your account, depending on your bank.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-bold text-foreground mb-2">
                Can I return sale items?
              </h4>
              <p className="text-muted-foreground">
                Yes, most sale items can be returned within 30 days. However, items marked
                as "Final Sale" cannot be returned or exchanged. Check the product page
                for specific details.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-bold text-foreground mb-2">
                What if my return is past 30 days?
              </h4>
              <p className="text-muted-foreground">
                Returns must be initiated within 30 days of delivery. Late returns may be
                accepted at our discretion for store credit only. Contact customer support
                for assistance.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-bold text-foreground mb-2">
                How do I return a gift?
              </h4>
              <p className="text-muted-foreground">
                Gift returns are accepted with proof of purchase. The refund will be
                issued to the original purchaser's payment method or as store credit to
                the gift recipient.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Need Help with Your Return?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our customer service team is here to assist you with any questions
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/help-center">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
