"use client";

import { useEffect, useState } from "react";
import { User, Package, Heart, Gift, Settings, LogOut, Mail, Phone, MapPin, Award, RotateCcw, AlertCircle, CheckCircle2, Clock, XCircle, Ticket, Star, TrendingUp, Zap } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { addressesApi, ordersApi, returnsApi, reviewsApi } from "../../services/api";
import { toast } from "sonner";

export function AccountPage() {
  const navigate = useRouter();
  const { user, loading: authLoading, updateUser, logout } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", pincode: "" });
  const [addressId, setAddressId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [orders, setOrders] = useState<Array<{ _id: string; items: Array<{ title?: string; quantity: number; price: number }>; totalAmount: number; orderStatus: string; createdAt: string }>>([]);
  const [returns, setReturns] = useState<Array<{ id: string; orderNumber: string; productName: string; status: string; requestDate: string; refundAmount: number; reason: string }>>([]);
  const [reviews, setReviews] = useState<Array<{ _id: string; rating: number; comment: string; isApproved: boolean; createdAt: string; product?: { title?: string } }>>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate.replace("/login?redirect=/account");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    addressesApi.list()
      .then((items) => {
        const saved = items[0] as { _id?: string; phone?: string; street?: string; city?: string; state?: string; pincode?: string } | undefined;
        if (!saved) return;
        setAddressId(saved._id || null);
        setPhone(saved.phone || "");
        setAddress({ street: saved.street || "", city: saved.city || "", state: saved.state || "", pincode: saved.pincode || "" });
      })
      .catch(() => undefined);

    setActivityLoading(true);
    Promise.all([ordersApi.myOrders(), returnsApi.myReturns(), reviewsApi.myReviews()])
      .then(([ordersData, returnsData, reviewsData]) => {
        setOrders(ordersData);
        setReturns(returnsData.map((item) => ({
          id: item._id,
          orderNumber: item.orderId?._id || "Order",
          productName: item.items?.map((entry) => entry.productId?.title || "Product").join(", ") || "Returned product",
          status: item.status,
          requestDate: item.createdAt,
          refundAmount: item.refundAmount || 0,
          reason: item.reason || "Return requested",
        })));
        setReviews(reviewsData);
      })
      .catch(() => toast.error("Unable to load your account activity"))
      .finally(() => setActivityLoading(false));
  }, [user]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUser(name, email);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveAddress = async () => {
    if (!user || !name || !phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error("Complete all address fields first");
      return;
    }
    setSavingAddress(true);
    try {
      const body = { fullName: name, phone, ...address, isDefault: true };
      const saved = addressId ? await addressesApi.update(addressId, body) : await addressesApi.add(body);
      setAddressId((saved as { _id?: string })._id || addressId);
      toast.success("Address saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="size-5 text-green-500" />;
      case "pending":
        return <Clock className="size-5 text-yellow-500" />;
      case "processing":
        return <AlertCircle className="size-5 text-blue-500" />;
      case "rejected":
        return <XCircle className="size-5 text-red-500" />;
      default:
        return <Clock className="size-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      approved: {
        className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        label: "Approved",
      },
      pending: {
        className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
        label: "Pending",
      },
      processing: {
        className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        label: "Processing",
      },
      rejected: {
        className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        label: "Rejected",
      },
    };

    const variant = variants[status] || variants.pending;
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-20 md:pb-0">
      {/* Enhanced Hero Header with Glassmorphic Effect */}
      <div className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 dark:from-orange-600 dark:to-orange-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02gNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Avatar with Ring */}
            <div className="relative">
              <div className="absolute inset-0 bg-background/30 rounded-full blur-xl"></div>
              <div className="relative size-20 md:size-24 bg-gradient-to-br from-white to-orange-100 dark:from-orange-200 dark:to-orange-300 rounded-full flex items-center justify-center text-[var(--primary-color)] font-bold text-2xl md:text-3xl flex-shrink-0 shadow-2xl ring-4 ring-white/50">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 size-6 md:size-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"></div>
            </div>
            
            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-inverse truncate mb-1 drop-shadow-lg">{user.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="flex items-center gap-2 text-inverse/90 text-sm md:text-base">
                  <Mail className="size-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-inverse/90 text-sm md:text-base">
                  <Award className="size-4" />
                  <span className="capitalize">{user.role} account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Tabs defaultValue="profile">
          {/* Glassmorphic Tabs */}
          <TabsList className="glass-card grid w-full grid-cols-3 md:grid-cols-6 mb-6 md:mb-8 h-auto p-1.5 border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-xl">
            <TabsTrigger value="profile" className="flex-col md:flex-row gap-1 md:gap-2 py-3 md:py-2.5 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-color)] data-[state=active]:to-orange-600 data-[state=active]:text-inverse data-[state=active]:shadow-lg transition-all rounded-lg min-h-[60px] md:min-h-[48px]">
              <User className="size-5 md:size-5" />
              <span className="text-[10px] md:text-sm">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-col md:flex-row gap-1 md:gap-2 py-3 md:py-2.5 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-color)] data-[state=active]:to-orange-600 data-[state=active]:text-inverse data-[state=active]:shadow-lg transition-all rounded-lg min-h-[60px] md:min-h-[48px]">
              <Package className="size-5" />
              <span className="text-[10px] md:text-sm">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex-col md:flex-row gap-1 md:gap-2 py-3 md:py-2.5 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-color)] data-[state=active]:to-orange-600 data-[state=active]:text-inverse data-[state=active]:shadow-lg transition-all rounded-lg min-h-[60px] md:min-h-[48px]">
              <RotateCcw className="size-5 md:size-5" />
              <span className="text-[10px] md:text-sm">Returns</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-col md:flex-row gap-1 md:gap-2 py-3 md:py-2.5 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-color)] data-[state=active]:to-orange-600 data-[state=active]:text-inverse data-[state=active]:shadow-lg transition-all rounded-lg min-h-[60px] md:min-h-[48px]">
              <Star className="size-5" />
              <span className="text-[10px] md:text-sm">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex-col md:flex-row gap-1 md:gap-2 py-3 md:py-2.5 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-color)] data-[state=active]:to-orange-600 data-[state=active]:text-inverse data-[state=active]:shadow-lg transition-all rounded-lg min-h-[60px] md:min-h-[48px]">
              <Heart className="size-5 md:size-5" />
              <span className="text-[10px] md:text-sm">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex-col md:flex-row gap-1 md:gap-2 py-3 md:py-2.5 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--primary-color)] data-[state=active]:to-orange-600 data-[state=active]:text-inverse data-[state=active]:shadow-lg transition-all rounded-lg min-h-[60px] md:min-h-[48px]">
              <Gift className="size-5 md:size-5" />
              <span className="text-[10px] md:text-sm">Rewards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 md:space-y-6">
            {/* Personal Information Card with Glassmorphic Effect */}
            <div className="glass-panel p-6 md:p-8 max-w-2xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-2xl shadow-lg">
                  <User className="size-5 md:size-6 text-inverse" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Profile Information
                </h2>
              </div>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm md:text-base font-semibold text-muted-foreground">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base font-semibold text-muted-foreground">Account Type</Label>
                    <Input value={user.role} readOnly className="glass-input border-gray-300 dark:border-gray-600 h-12 text-base capitalize" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                    <Phone className="size-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base"
                  />
                </div>

                <div className="pt-2">
                  <Button onClick={saveProfile} disabled={savingProfile} className="w-full md:w-auto bg-gradient-to-r from-[var(--primary-color)] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-inverse shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8 text-base font-semibold">
                    {savingProfile ? "Saving..." : "Save Profile Changes"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Address Card with Glassmorphic Effect */}
            <div className="glass-card p-5 md:p-7 max-w-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-5 md:mb-7">
                <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-xl shadow-lg">
                  <MapPin className="size-5 md:size-6 text-inverse" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Delivery Address
                </h2>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm md:text-base font-semibold text-muted-foreground">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    value={address.street}
                    onChange={(event) => setAddress({ ...address, street: event.target.value })}
                    className="glass-input w-full border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                    placeholder="Enter your street address" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  <div className="space-y-2 w-full">
                    <Label htmlFor="city" className="text-sm md:text-base font-semibold text-muted-foreground">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(event) => setAddress({ ...address, city: event.target.value })}
                      className="glass-input w-full border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                      placeholder="Enter city" 
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="state" className="text-sm md:text-base font-semibold text-muted-foreground">
                      State
                    </Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(event) => setAddress({ ...address, state: event.target.value })}
                      className="glass-input w-full border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                      placeholder="Enter state" 
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="zip" className="text-sm md:text-base font-semibold text-muted-foreground">
                      ZIP Code
                    </Label>
                    <Input
                      id="zip"
                      value={address.pincode}
                      onChange={(event) => setAddress({ ...address, pincode: event.target.value })}
                      className="glass-input w-full border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                      placeholder="Enter ZIP code" 
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button onClick={saveAddress} disabled={savingAddress} className="w-full md:w-auto bg-gradient-to-r from-[var(--primary-color)] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-inverse shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8 text-base font-semibold">
                    {savingAddress ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 md:space-y-6">
            {activityLoading ? <p className="text-muted-foreground">Loading your orders...</p> : orders.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">You have no orders yet.</div>
            ) : orders.map((order) => (
              <div key={order._id} className="glass-card p-5 md:p-7 max-w-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Order #{order._id.slice(-8)}</h2>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge className="capitalize">{order.orderStatus}</Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {order.items.map((item, index) => (
                    <div key={`${order._id}-${index}`} className="flex justify-between gap-4">
                      <span>{item.title || "Product"} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <p className="text-right font-bold text-foreground">Total: ₹{order.totalAmount.toFixed(2)}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="returns">
            <div className="space-y-4 md:space-y-6">
              {activityLoading ? <p className="text-muted-foreground">Loading your returns...</p> : returns.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">You have no returned products.</div>
              ) : returns.map((ret) => (
                <div key={ret.id} className="glass-card p-5 md:p-7 max-w-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-5 md:mb-7">
                    <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-xl shadow-lg">
                      <RotateCcw className="size-5 md:size-6 text-inverse" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      Return Request
                    </h2>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                          Order Number
                        </Label>
                        <Input 
                          defaultValue={ret.orderNumber} 
                          className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                          Product Name
                        </Label>
                        <Input 
                          defaultValue={ret.productName} 
                          className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                        <Mail className="size-4" />
                        Request Date
                      </Label>
                      <Input 
                        defaultValue={ret.requestDate} 
                        className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                        <Phone className="size-4" />
                        Refund Amount
                      </Label>
                      <Input 
                        defaultValue={`₹${ret.refundAmount.toFixed(2)}`} 
                        className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                        readOnly
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base font-semibold text-muted-foreground flex items-center gap-2">
                        <MapPin className="size-4" />
                        Reason
                      </Label>
                      <Input 
                        defaultValue={ret.reason} 
                        className="glass-input border-gray-300 dark:border-gray-600 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 h-12 text-base" 
                        readOnly
                      />
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(ret.status)}
                        {getStatusBadge(ret.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 md:space-y-6">
            {activityLoading ? <p className="text-muted-foreground">Loading your reviews...</p> : reviews.length === 0 ? (
              <div className="glass-card p-8 text-center text-muted-foreground">You have not written any reviews.</div>
            ) : reviews.map((review) => (
              <div key={review._id} className="glass-card p-5 md:p-7 max-w-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-foreground">{review.product?.title || "Product review"}</h2>
                  <Badge className={review.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {review.isApproved ? "Published" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 mb-3" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-4 ${index < review.rating ? "fill-current" : "text-muted-foreground"}`} />)}
                </div>
                <p className="text-foreground">{review.comment}</p>
                <p className="text-sm text-muted-foreground mt-3">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="glass-card p-8 md:p-12 text-center border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 rounded-full">
                  <Heart className="size-12 text-pink-400 dark:text-pink-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-6">Save items you love for later</p>
                  <Button 
                    onClick={() => navigate.push("/products")}
                    className="bg-gradient-to-r from-[var(--primary-color)] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-inverse shadow-lg active:scale-95 touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                      touchAction: 'manipulation',
                    }}
                  >
                    Browse Products
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            {/* Rewards Points Summary */}
            <div className="glass-card p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 shadow-lg rounded-xl">
                    <TrendingUp className="size-6 text-inverse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Reward Points
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Earn points with every purchase
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[var(--primary-color)] to-orange-600 p-6 shadow-lg rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="size-6 text-inverse" />
                    <p className="text-inverse/90 text-sm font-medium">Total Points</p>
                  </div>
                  <p className="text-4xl font-bold text-inverse">2,450</p>
                </div>
                
                <div className="bg-background dark:bg-card text-card-foreground p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="size-6 text-yellow-500" />
                    <p className="text-muted-foreground text-sm font-medium">Points This Month</p>
                  </div>
                  <p className="text-4xl font-bold text-foreground">350</p>
                </div>
                
                <div className="bg-background dark:bg-card text-card-foreground p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="size-6 text-purple-500" />
                    <p className="text-muted-foreground text-sm font-medium">Level</p>
                  </div>
                  <p className="text-4xl font-bold text-foreground">Gold</p>
                </div>
              </div>
            </div>

            {/* Available Coupons */}
            <div className="glass-card p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 shadow-lg rounded-xl">
                  <Ticket className="size-6 text-inverse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Available Coupons
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Save on your next purchase
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon 1 */}
                <div className="relative bg-gradient-to-r from-[var(--primary-color)] to-orange-600 p-6 shadow-xl overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 -mr-16 -mt-16 rotate-45"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-inverse/90 text-sm font-medium mb-1">Welcome Offer</p>
                        <p className="text-4xl font-bold text-inverse mb-1">20% OFF</p>
                        <p className="text-inverse/90 text-xs">On orders above ₹50</p>
                      </div>
                      <Ticket className="size-8 text-inverse/50" />
                    </div>
                    <Separator className="my-4 bg-background/30" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-inverse/90 text-xs mb-1">Code</p>
                        <p className="text-inverse font-bold tracking-wider">WELCOME20</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-background text-[var(--primary-color)] hover:bg-background/90 font-semibold rounded-lg"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-inverse/80 text-xs mt-3">Valid until: Mar 31, 2026</p>
                  </div>
                </div>

                {/* Coupon 2 */}
                <div className="relative bg-gradient-to-r from-purple-600 to-purple-700 p-6 shadow-xl overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 -mr-16 -mt-16 rotate-45"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-inverse/90 text-sm font-medium mb-1">Free Shipping</p>
                        <p className="text-4xl font-bold text-inverse mb-1">₹0</p>
                        <p className="text-inverse/90 text-xs">On all orders</p>
                      </div>
                      <Ticket className="size-8 text-inverse/50" />
                    </div>
                    <Separator className="my-4 bg-background/30" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-inverse/90 text-xs mb-1">Code</p>
                        <p className="text-inverse font-bold tracking-wider">FREESHIP</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-background text-purple-600 hover:bg-background/90 font-semibold rounded-lg"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-inverse/80 text-xs mt-3">Valid until: Apr 15, 2026</p>
                  </div>
                </div>

                {/* Coupon 3 */}
                <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-6 shadow-xl overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 -mr-16 -mt-16 rotate-45"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-inverse/90 text-sm font-medium mb-1">Spring Sale</p>
                        <p className="text-4xl font-bold text-inverse mb-1">₹15 OFF</p>
                        <p className="text-inverse/90 text-xs">On orders above ₹100</p>
                      </div>
                      <Ticket className="size-8 text-inverse/50" />
                    </div>
                    <Separator className="my-4 bg-background/30" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-inverse/90 text-xs mb-1">Code</p>
                        <p className="text-inverse font-bold tracking-wider">SPRING15</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-background text-green-600 hover:bg-background/90 font-semibold rounded-lg"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-inverse/80 text-xs mt-3">Valid until: May 1, 2026</p>
                  </div>
                </div>

                {/* Coupon 4 */}
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 shadow-xl overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 -mr-16 -mt-16 rotate-45"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-inverse/90 text-sm font-medium mb-1">Member Special</p>
                        <p className="text-4xl font-bold text-inverse mb-1">30% OFF</p>
                        <p className="text-inverse/90 text-xs">On electronics</p>
                      </div>
                      <Ticket className="size-8 text-inverse/50" />
                    </div>
                    <Separator className="my-4 bg-background/30" />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-inverse/90 text-xs mb-1">Code</p>
                        <p className="text-inverse font-bold tracking-wider">TECH30</p>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-background text-blue-600 hover:bg-background/90 font-semibold rounded-lg"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-inverse/80 text-xs mt-3">Valid until: Mar 25, 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards History */}
            <div className="glass-card p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 shadow-lg rounded-xl">
                  <Gift className="size-6 text-inverse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Rewards History
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your recent rewards activity
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background dark:bg-card text-card-foreground border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Purchase Reward</p>
                      <p className="text-sm text-muted-foreground">Order #ORD-2024-156</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">+150 pts</p>
                    <p className="text-xs text-muted-foreground">Feb 22, 2026</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background dark:bg-card text-card-foreground border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Purchase Reward</p>
                      <p className="text-sm text-muted-foreground">Order #ORD-2024-143</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">+200 pts</p>
                    <p className="text-xs text-muted-foreground">Feb 18, 2026</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background dark:bg-card text-card-foreground border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Star className="size-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Referral Bonus</p>
                      <p className="text-sm text-muted-foreground">Friend joined</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 dark:text-blue-400">+500 pts</p>
                    <p className="text-xs text-muted-foreground">Feb 15, 2026</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background dark:bg-card text-card-foreground border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Ticket className="size-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Coupon Redeemed</p>
                      <p className="text-sm text-muted-foreground">WELCOME20</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 dark:text-red-400">-300 pts</p>
                    <p className="text-xs text-muted-foreground">Feb 10, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


