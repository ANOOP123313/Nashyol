"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "@/services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { Phone, Lock, ShieldCheck, UserPlus, MessageCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const initialTab = searchParams.get("tab") === "register" || searchParams.get("register") === "true" ? "register" : "login";

  const { loginWithPhone, registerWithPhoneOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);

  // Login form state (Phone only)
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Register form state
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regPhone, setRegPhone] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle referral code from query params or localStorage
  useEffect(() => {
    const refCode = searchParams.get("ref") || searchParams.get("referral");
    if (refCode) {
      setReferralCode(refCode.toUpperCase().trim());
      try {
        localStorage.setItem("nashyol_ref_code", refCode.toUpperCase().trim());
      } catch {}
    } else {
      try {
        const saved = localStorage.getItem("nashyol_ref_code");
        if (saved) setReferralCode(saved);
      } catch {}
    }
  }, [searchParams]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Phone-only Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const cleanPhone = loginPhone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        throw new Error("Please enter a valid 10-digit phone number");
      }
      await loginWithPhone(cleanPhone, loginPassword);
      toast.success("Welcome back! Logged in successfully.");
      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your phone number and password.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Register Step 1: Send WhatsApp OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = regPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp phone number");
      return;
    }

    try {
      setRegLoading(true);
      const res: any = await authApi.sendRegistrationOTP({ phone: cleanPhone });
      toast.success(res.message || "OTP sent to your WhatsApp!");
      if (res.otp || res.mockOtp) {
        setRegOtp(res.otp || res.mockOtp);
      }
      setRegStep(2);
      setCountdown(60);
    } catch (err: any) {
      const msg = err.message || "Failed to send registration OTP";
      toast.error(msg);
      if (msg.toLowerCase().includes("already registered")) {
        setActiveTab("login");
        setLoginPhone(cleanPhone);
      }
    } finally {
      setRegLoading(false);
    }
  };

  // Register Step 2: Complete Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regOtp || regOtp.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    if (!regName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setRegLoading(true);
      await registerWithPhoneOtp({
        phone: regPhone.replace(/\D/g, ""),
        otp: regOtp,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        referralCode: referralCode.trim() || undefined,
      });

      toast.success("Account created successfully!");
      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please check your OTP and details.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border transition-all">
        {/* Top Tab Switcher: Login vs Create Account */}
        <div className="flex w-full p-1 bg-muted/80 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "login"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "register"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            <span>Create Account</span>
          </button>
        </div>

        {/* ===================== LOGIN TAB ===================== */}
        {activeTab === "login" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Login</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Enter your registered phone number and password to login
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative mt-1 flex items-center">
                  <span className="absolute left-3 text-sm font-semibold text-muted-foreground">
                    +91
                  </span>
                  <Input
                    id="login-phone"
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ""))}
                    className="pl-12 h-11"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="mt-1 h-11"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-sm transition-all"
                disabled={loginLoading || loginPhone.length < 10}
              >
                {loginLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Secure Phone & Password Authentication</span>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className="text-primary font-semibold hover:underline"
              >
                Create Account now
              </button>
            </p>
          </div>
        )}

        {/* ===================== REGISTER TAB ===================== */}
        {activeTab === "register" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Section */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                New Customer Registration
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {regStep === 1 ? "Create Your Account" : "Complete Registration"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {regStep === 1
                  ? "Verify your WhatsApp number to begin account setup"
                  : `Enter the 6-digit code sent to +91 ${regPhone} and set your password`}
              </p>
            </div>

            {/* Step Progress Bar */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-[11px]">
                  {regStep === 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
                </span>
                <span>WhatsApp OTP</span>
              </div>
              <div className={`h-0.5 w-8 rounded ${regStep === 2 ? "bg-primary" : "bg-border"}`} />
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${regStep === 2 ? "text-primary" : "text-muted-foreground"}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${regStep === 2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  2
                </span>
                <span>Profile & Password</span>
              </div>
            </div>

            {regStep === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="reg-phone" className="text-sm font-medium">
                    WhatsApp Phone Number
                  </Label>
                  <div className="relative mt-1 flex items-center">
                    <span className="absolute left-3 text-sm font-semibold text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="reg-phone"
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                      className="pl-12 h-11"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    We will send a 6-digit verification code to your WhatsApp to verify your identity.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                  disabled={regLoading || regPhone.length < 10}
                >
                  <MessageCircle className="h-4 w-4" />
                  {regLoading ? "Sending WhatsApp OTP..." : "Get OTP via WhatsApp"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="reg-otp" className="text-sm font-medium">
                      6-Digit WhatsApp OTP
                    </Label>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Mock OTP: 123456
                    </span>
                  </div>
                  <Input
                    id="reg-otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 text-center text-lg tracking-widest font-mono h-11"
                    required
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground text-center">
                    Testing enabled: use code <strong className="text-emerald-500">123456</strong> to verify.
                  </p>
                </div>

                <div>
                  <Label htmlFor="reg-name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Your Full Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="mt-1 h-11"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reg-email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="mt-1 h-11"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reg-password" className="text-sm font-medium">
                    Create Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-refcode" className="text-sm font-medium text-muted-foreground">
                    Referral Code <span className="text-xs font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="reg-refcode"
                    type="text"
                    placeholder="e.g. AB12CD34"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="mt-1 font-mono tracking-wider uppercase h-11"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRegStep(1)}
                    className="h-11 px-3"
                    title="Change phone number"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-sm transition-all"
                    disabled={regLoading}
                  >
                    {regLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-primary font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
