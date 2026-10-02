"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { Package, Truck, CheckCircle2, Tag, Percent, Check, X } from "lucide-react";
import { toast } from "sonner";
import { PaymentGateway } from "../components/PaymentGateway";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { paymentsApi, ordersApi, addressesApi, settingsApi, couponsApi } from "@/services/api";
import { StripePaymentModal } from "../components/StripePaymentModal";

export function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [codEnabled, setCodEnabled] = useState(true);
  const [codCharge, setCodCharge] = useState(0);
  const [hasGlobalCodCharge, setHasGlobalCodCharge] = useState(false);

  // Stripe Modal state
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeOrderId, setStripeOrderId] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType?: string;
    discountValue?: number;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const shipping = subtotal > 100 ? 0 : 10;
  const codDeliveryCharge = paymentMethod === "cod"
    ? hasGlobalCodCharge ? codCharge : items.reduce((sum, item) => sum + (item.deliveryCharge || 0) * item.quantity, 0)
    : 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - couponDiscount + shipping + codDeliveryCharge);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setIsApplyingCoupon(true);
    try {
      const res = await couponsApi.validate(couponCode.trim(), subtotal);
      if (res && res.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountAmount: res.discountAmount || 0,
          discountType: (res as any).discountType,
          discountValue: (res as any).discountValue,
        });
        toast.success(`Coupon "${couponCode.trim().toUpperCase()}" applied! Saved ₹${(res.discountAmount || 0).toFixed(2)}`);
      } else {
        toast.error(res?.message || "Invalid or expired coupon");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to validate coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !user) {
      toast.error("Please log in to complete your purchase");
      router.push("/login?redirect=/checkout");
    }
  }, [user, router]);

  useEffect(() => {
    settingsApi.get()
      .then((settings) => {
        setCodEnabled(settings.codOn !== false);
        setHasGlobalCodCharge(settings.codCharge !== undefined);
        setCodCharge(Math.max(0, Number(settings.codCharge) || 0));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.name) {
        const parts = user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (user.email) {
        setEmail(user.email);
      }
      if (user.phone) {
        setPhone(user.phone);
      }

      // Fetch saved profile address
      addressesApi.list()
        .then((items: any) => {
          if (Array.isArray(items) && items.length > 0) {
            const saved = items.find((a: any) => a.isDefault) || items[0];
            if (saved && (saved.street || saved.city || saved.state || saved.pincode)) {
              if (saved.fullName) {
                const parts = saved.fullName.split(" ");
                setFirstName(parts[0] || "");
                setLastName(parts.slice(1).join(" ") || "");
              }
              if (saved.phone) setPhone(saved.phone);
              setAddress(saved.street || "");
              setCity(saved.city || "");
              setState(saved.state || "");
              setZip(saved.pincode || "");
              return;
            }
          }
          // If address details are not saved in profile, form remains empty
          setAddress("");
          setCity("");
          setState("");
          setZip("");
        })
        .catch(() => {
          setAddress("");
          setCity("");
          setState("");
          setZip("");
        });
    } else {
      setAddress("");
      setCity("");
      setState("");
      setZip("");
    }
  }, [user]);

  const validateShippingInfo = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      toast.error("Please complete your shipping address");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handlePaymentComplete = async (paymentData: any) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token && !user) {
      toast.error("Please log in to complete your purchase");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!validateShippingInfo()) return;

    setIsProcessing(true);
    try {
      const finalMethod = paymentData.method || paymentMethod || "card";

      if (finalMethod === "card") {
        try {
          const intentData = await paymentsApi.createIntentFromCart(appliedCoupon?.code);
          setStripeClientSecret(intentData.clientSecret);
          setStripeOrderId(null);
          setStripeModalOpen(true);
        } catch (err: any) {
          toast.error(err.message || "Failed to initialize secure checkout");
        }
        setIsProcessing(false);
        return;
      }

      // COD Flow
      const orderData = {
        couponCode: appliedCoupon?.code,
        address: {
          fullName: `${firstName} ${lastName}`,
          phone,
          street: address,
          city,
          state,
          pincode: zip,
        },
        paymentId: "manual-payment",
        paymentMethod: "cod",
      };

      const result: any = await ordersApi.create(orderData);
      toast.success("Order placed successfully!");

      const placedOrder = {
        ...result,
        items: items.map(i => ({
          id: i.id,
          sku: i.sku,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          variant: i.variant,
        })),
        shippingAddress: orderData.address,
        productAmount: subtotal,
        codCharge: codDeliveryCharge,
        shippingCharge: shipping,
        couponCode: appliedCoupon?.code || result?.couponCode || "",
        discountAmount: couponDiscount || result?.discountAmount || 0,
        amount: total,
        totalAmount: total,
        paymentMethod: "cod",
        paymentStatus: "pending",
      };

      localStorage.setItem("lastOrder", JSON.stringify(placedOrder));
      clearCart();
      router.push("/order-success");
    } catch (err: any) {
      if (err.message?.includes("token") || err.message?.includes("authorized") || err.message?.includes("401")) {
        toast.error("Session expired. Please log in to complete your purchase");
        router.push("/login?redirect=/checkout");
      } else {
        toast.error(err.message || "Failed to place order");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => router.push("/products")}>Go Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted dark:bg-transparent pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <CheckCircle2 className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Complete your order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-card">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="size-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Shipping Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your first name" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your last name" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your street address" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter your city" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Enter your state" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Enter your zip code" className="rounded-xl border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="rounded-xl border-border" />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-card">
              <PaymentGateway
                amount={total}
                onPaymentComplete={handlePaymentComplete}
                onBeforePayment={validateShippingInfo}
                onPaymentMethodChange={setPaymentMethod}
                codEnabled={codEnabled}
                codCharge={hasGlobalCodCharge ? codCharge : items.reduce((sum, item) => sum + (item.deliveryCharge || 0) * item.quantity, 0)}
                disabled={!termsAccepted}
              />

              <div className="mt-6 flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-card sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <Package className="size-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
              </div>

              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={`${item.id}-${item.sku}`} className="flex gap-4">
                    <div className="size-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                      {item.variant?.attributes && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.variant.attributes.map((a: any) => (
                            <span key={a.name} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">{a.name}: {a.value}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="my-5 p-3.5 bg-muted/60 dark:bg-card rounded-2xl border border-dashed border-border">
                <div className="flex items-center gap-2 mb-2.5">
                  <Tag className="size-4 text-[var(--primary-color)]" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Have a Coupon Code?</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500 text-white rounded-full">
                        <Check className="size-3" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono tracking-wide">{appliedCoupon.code}</p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Discount applied: -₹{appliedCoupon.discountAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveCoupon} className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-transparent">
                      <X className="size-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SAVE20"
                      className="h-10 text-xs sm:text-sm uppercase tracking-wider bg-background border-border"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="h-10 px-4 text-xs font-semibold bg-[var(--primary-color)] hover:bg-orange-600 text-white shrink-0"
                    >
                      {isApplyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-6 bg-muted" />

              <div className="space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1"><Tag className="size-3.5" /> Coupon Discount ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash on Delivery charge</span>
                    <span className="font-semibold text-foreground">₹{codDeliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-black text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                <p className="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed">
                  ✨ Secure checkout powered by industry-standard encryption. Your payment data is never stored on our servers.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <StripePaymentModal
        isOpen={stripeModalOpen}
        clientSecret={stripeClientSecret}
        orderId={stripeOrderId}
        onClose={() => setStripeModalOpen(false)}
        onSuccess={async (paymentIntentId) => {
          setStripeModalOpen(false);
          try {
            const orderData = {
              couponCode: appliedCoupon?.code,
              address: {
                fullName: `${firstName} ${lastName}`,
                phone,
                street: address,
                city,
                state,
                pincode: zip,
              },
              paymentId: paymentIntentId || "stripe-payment",
              paymentMethod: "card",
              paymentStatus: "paid"
            };
            const result: any = await ordersApi.create(orderData);
            
            const placedOrder = {
              ...result,
              items: items.map(i => ({
                id: i.id,
                sku: i.sku,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                image: i.image,
                variant: i.variant,
              })),
              shippingAddress: orderData.address,
              productAmount: subtotal,
              codCharge: 0,
              shippingCharge: shipping,
              couponCode: appliedCoupon?.code || result?.couponCode || "",
              discountAmount: couponDiscount || result?.discountAmount || 0,
              amount: total,
              totalAmount: total,
              paymentMethod: "card",
              paymentStatus: "paid",
            };

            localStorage.setItem("lastOrder", JSON.stringify(placedOrder));
            clearCart();
            router.push("/order-success");
          } catch (err: any) {
            toast.error(err.message || "Failed to finalize order after payment. Please contact support.");
          }
        }}
      />
    </div>
  );
}

