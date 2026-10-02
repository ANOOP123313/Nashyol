"use client";

import { useEffect, useState, useRef } from "react";
import { User, Package, Heart, Gift, Settings, LogOut, Mail, Phone, MapPin, Award, RotateCcw, AlertCircle, CheckCircle2, Clock, XCircle, Ticket, Star, TrendingUp, Zap, Copy, Check, Share2, Users, Camera, Upload, Trash2, Loader2, Search, FileText, Eye, Truck, Printer, CreditCard } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { addressesApi, ordersApi, returnsApi, reviewsApi, referralsApi, couponsApi, uploadApi, paymentsApi } from "../../services/api";
import { toast } from "sonner";
import { OrdersPage } from "./OrdersPage";

export function AccountPage() {
  const navigate = useRouter();
  const { user, loading: authLoading, updateUser, updateAvatar, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", pincode: "" });
  const [addressId, setAddressId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [orders, setOrders] = useState<Array<{ _id: string; orderNumber?: string; returnStatus?: string; items: Array<{ title?: string; quantity: number; price: number; attributes?: Array<{ name: string; value: string }> }>; totalAmount: number; orderStatus: string; createdAt: string }>>([]);
  const [returns, setReturns] = useState<Array<{ id: string; orderNumber: string; productName: string; status: string; requestDate: string; refundAmount: number; reason: string }>>([]);
  const [reviews, setReviews] = useState<Array<{ _id: string; rating: number; comment: string; isApproved: boolean; createdAt: string; product?: { title?: string } }>>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate.replace("/login?redirect=/account");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");

    addressesApi.list()
      .then((items) => {
        const saved = items[0] as { _id?: string; phone?: string; street?: string; city?: string; state?: string; pincode?: string } | undefined;
        if (!saved) return;
        setAddressId(saved._id || null);
        if (!user.phone && saved.phone) {
          setPhone(saved.phone);
        }
        setAddress({ street: saved.street || "", city: saved.city || "", state: saved.state || "", pincode: saved.pincode || "" });
      })
      .catch(() => undefined);

    referralsApi.stats()
      .then((data) => setReferralStats(data))
      .catch(() => undefined);

    couponsApi.list()
      .then((data) => setUserCoupons(Array.isArray(data) ? data : []))
      .catch(() => undefined);

    setActivityLoading(true);
    Promise.all([ordersApi.myOrders(), returnsApi.myReturns(), reviewsApi.myReviews()])
      .then(([ordersData, returnsData, reviewsData]) => {
        setOrders(ordersData);
        setReturns(returnsData.map((item) => ({
          id: item._id,
          orderNumber: (item.orderId as any)?.orderNumber || (item.orderId?._id ? `ORD-${item.orderId._id.slice(-6).toUpperCase()}` : (item.orderId ? `ORD-${String(item.orderId).slice(-6).toUpperCase()}` : "Order")),
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
      await updateUser(name, email, phone);
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

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          // Attempt to upload to upload endpoint
          const uploadRes = await uploadApi.uploadBase64({ image: base64, folder: "avatars" });
          const avatarUrl = uploadRes.url || base64;
          await updateAvatar(avatarUrl);
          toast.success("Profile picture updated successfully!");
        } catch {
          // Fallback to storing base64 image data directly
          try {
            await updateAvatar(base64);
            toast.success("Profile picture updated!");
          } catch (innerErr: any) {
            toast.error(innerErr.message || "Failed to update profile picture");
          }
        } finally {
          setUploadingAvatar(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingAvatar(false);
      toast.error(err.message || "Error reading image file");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingAvatar(true);
      await updateAvatar("");
      toast.success("Profile picture removed");
    } catch {
      toast.error("Failed to remove profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const getStatusIcon = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "refunded":
        return <CheckCircle2 className="size-5 text-emerald-500" />;
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
    const s = (status || "").toLowerCase();
    const variants: Record<string, { className: string; label: string }> = {
      refunded: {
        className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
        label: "Refunded",
      },
      approved: {
        className: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
        label: "Approved",
      },
      pending: {
        className: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
        label: "Pending Review",
      },
      processing: {
        className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
        label: "Processing",
      },
      rejected: {
        className: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
        label: "Rejected",
      },
    };

    const variant = variants[s] || variants.pending;
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-transparent dark:via-transparent dark:to-transparent dark:bg-transparent pb-20 md:pb-0">
      {/* Enhanced Hero Header with Glassmorphic Effect */}
      <div className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 dark:from-orange-600 dark:to-orange-800"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02gNi02eiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Avatar with Camera Upload & First Letter Fallback */}
              <div className="relative group">
                <div className="absolute inset-0 bg-background/30 rounded-full blur-xl"></div>
                <div className="relative size-20 md:size-24 bg-gradient-to-br from-white to-orange-100 dark:from-orange-200 dark:to-orange-300 rounded-full flex items-center justify-center text-[var(--primary-color)] font-bold text-2xl md:text-3xl flex-shrink-0 shadow-2xl ring-4 ring-white/50 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(user.name?.trim()?.charAt(0) || "U").toUpperCase()}</span>
                  )}

                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="size-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Camera upload action button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 size-7 md:size-8 bg-[var(--primary-color)] hover:bg-orange-600 text-white rounded-full border-2 border-white dark:border-gray-900 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Upload profile picture"
                >
                  <Camera className="size-3.5 md:size-4" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>
              
              {/* User Info */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-4xl font-bold text-inverse truncate mb-1 drop-shadow-lg">{user.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  {user.email && (
                    <div className="flex items-center gap-2 text-inverse/90 text-sm md:text-base">
                      <Mail className="size-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  )}
                  {(user.phone || phone) && (
                    <div className="flex items-center gap-2 text-inverse/90 text-sm md:text-base">
                      <Phone className="size-4" />
                      <span>{user.phone || phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logout button in Hero Header */}
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={async () => {
                  await logout();
                  toast.success("Logged out successfully");
                  navigate.push("/login");
                }}
                className="bg-white/10 hover:bg-white/20 text-inverse border-white/30 backdrop-blur-md shadow-md gap-2 font-medium"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </Button>
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
            {/* Personal Information Display Card (Read-Only) */}
            <div className="glass-panel p-6 md:p-8 max-w-2xl hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-2xl shadow-lg">
                    <User className="size-5 md:size-6 text-inverse" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      Profile Information
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Account details are fixed after registration
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Verified Account
                </Badge>
              </div>

              {/* Profile Photo Management Row */}
              <div className="mb-6 p-4 rounded-xl bg-background/80 dark:bg-card/80 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-orange-600 text-inverse font-bold text-xl flex items-center justify-center overflow-hidden border-2 border-[var(--primary-color)]/20 shadow-md shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user.name?.trim()?.charAt(0) || "U").toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Profile Picture</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user.avatar ? "Custom photo is set" : `Showing first letter "${(user.name?.trim()?.charAt(0) || "U").toUpperCase()}"`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="gap-1.5 text-xs font-medium"
                  >
                    {uploadingAvatar ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    <span>{user.avatar ? "Change Photo" : "Upload Photo"}</span>
                  </Button>
                  {user.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs gap-1"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name Display */}
                <div className="p-4 rounded-xl bg-background/70 dark:bg-card/70 border border-border shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <User className="size-4 text-[var(--primary-color)]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Full Name</span>
                  </div>
                  <p className="text-base font-bold text-foreground truncate">
                    {user.name || name || "—"}
                  </p>
                </div>

                {/* Phone Number Display */}
                <div className="p-4 rounded-xl bg-background/70 dark:bg-card/70 border border-border shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <Phone className="size-4 text-[var(--primary-color)]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Phone Number</span>
                  </div>
                  <p className="text-base font-bold text-foreground truncate">
                    {user.phone || phone || "Not provided"}
                  </p>
                </div>

                {/* Email Address Display */}
                <div className="p-4 rounded-xl bg-background/70 dark:bg-card/70 border border-border shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                    <Mail className="size-4 text-[var(--primary-color)]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Email Address</span>
                  </div>
                  <p className="text-base font-bold text-foreground truncate font-mono">
                    {user.email || email || "—"}
                  </p>
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

          <TabsContent value="orders">
            <OrdersPage hideHero={true} />
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
            {/* Unique Referral Code Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-amber-500 text-white p-6 md:p-8 rounded-3xl shadow-2xl">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
                    <Gift className="size-3.5" /> Refer & Earn Rewards
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Your Unique Referral Code
                  </h2>
                  <p className="text-white/90 text-sm md:text-base leading-relaxed">
                    Give this code to friends when they register an account. You earn <strong>100 referral points</strong> for each user who signs up with your code!
                  </p>
                </div>

                <div className="bg-white/15 backdrop-blur-lg border border-white/30 p-4 md:p-5 rounded-2xl flex flex-col items-center gap-3 shrink-0">
                  <span className="text-xs uppercase font-bold tracking-widest text-white/80">Referral Code</span>
                  <div className="font-mono text-3xl md:text-4xl font-black tracking-widest text-white px-4 py-1.5 bg-black/20 rounded-xl border border-white/20 select-all">
                    {user?.referralCode || referralStats?.referralCode || "NASHYOL"}
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      onClick={() => {
                        const code = user?.referralCode || referralStats?.referralCode || "";
                        if (code) {
                          navigator.clipboard.writeText(code);
                          setCopiedCode(true);
                          toast.success("Referral code copied to clipboard!");
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      className="flex-1 bg-white text-orange-600 hover:bg-white/90 font-bold rounded-xl shadow-md gap-1.5 h-10"
                    >
                      {copiedCode ? <Check className="size-4" /> : <Copy className="size-4" />}
                      <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                    </Button>
                    <Button
                      onClick={() => {
                        const code = user?.referralCode || referralStats?.referralCode || "";
                        const url = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : "";
                        if (url) {
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          toast.success("Referral link copied!");
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      variant="outline"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/40 rounded-xl font-bold h-10 px-3"
                      title="Copy registration link"
                    >
                      {copiedLink ? <Check className="size-4" /> : <Share2 className="size-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
                    <Zap className="size-5" />
                  </div>
                  <p className="text-muted-foreground text-sm font-semibold">Total Referral Points</p>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">
                  {referralStats?.points ?? user?.referralPoints ?? user?.walletBalance ?? 0}
                  <span className="text-base font-semibold text-muted-foreground ml-1.5">pts</span>
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Shown in rewards wallet</p>
              </div>

              <div className="glass-card p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users className="size-5" />
                  </div>
                  <p className="text-muted-foreground text-sm font-semibold">Friends Referred</p>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">
                  {referralStats?.referralCount ?? user?.referralCount ?? (referralStats?.referrals?.length || 0)}
                  <span className="text-base font-semibold text-muted-foreground ml-1.5">registered</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">+100 pts for each signup</p>
              </div>

              <div className="glass-card p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Award className="size-5" />
                  </div>
                  <p className="text-muted-foreground text-sm font-semibold">Referral Status</p>
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-foreground">Active Member</p>
                <p className="text-xs text-muted-foreground mt-1">Earn rewards on every friend</p>
              </div>
            </div>

            {/* Referral Points History */}
            <div className="glass-card p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 shadow-lg rounded-xl">
                    <Gift className="size-6 text-inverse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Referral Points & Activity
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Friends who registered using your referral code and points earned
                    </p>
                  </div>
                </div>
              </div>

              {referralStats?.referrals && referralStats.referrals.length > 0 ? (
                <div className="space-y-3">
                  {referralStats.referrals.map((ref: any, idx: number) => (
                    <div key={ref._id || idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-sm">
                          {(ref.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{ref.name || "Friend"}</p>
                          <p className="text-xs text-muted-foreground">Joined using your referral code · {ref.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                          +{ref.points || 100} pts
                        </span>
                        <div className="text-[11px]">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold">
                            {ref.status || "Rewarded"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 border border-dashed border-border rounded-2xl bg-muted/20">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 mx-auto flex items-center justify-center mb-3">
                    <Users className="size-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-1">No referrals yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                    Share your unique referral code with friends and family. As soon as they register, you will receive referral points right here!
                  </p>
                  <Button
                    onClick={() => {
                      const code = user?.referralCode || referralStats?.referralCode || "";
                      if (code) {
                        navigator.clipboard.writeText(code);
                        setCopiedCode(true);
                        toast.success("Referral code copied!");
                        setTimeout(() => setCopiedCode(false), 2000);
                      }
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
                  >
                    <Copy className="size-4 mr-2" /> Copy Your Referral Code
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


