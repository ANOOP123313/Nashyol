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
import { MessageCircle, ShieldCheck, ArrowLeft, User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const { registerWithPhoneOtp } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Request WhatsApp OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp phone number");
      return;
    }

    try {
      setLoading(true);
      const res: any = await authApi.sendRegistrationOTP({ phone: cleanPhone });
      toast.success(res.message || "OTP sent to your WhatsApp!");
      if (res.otp || res.mockOtp) {
        setOtp(res.otp || res.mockOtp);
      }
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      const msg = err.message || "Failed to send registration OTP";
      toast.error(msg);
      if (msg.toLowerCase().includes("already registered")) {
        toast.info("Click 'Sign In' above if you already have an account.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete Registration with OTP, Name, Email, Password
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await registerWithPhoneOtp({
        phone: phone.replace(/\D/g, ""),
        otp,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        referralCode: referralCode.trim() || undefined,
      });

      toast.success("Account created successfully!");
      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please check your OTP and details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border">
        {/* Top Switcher Tabs: Sign In vs Create Account */}
        <div className="flex w-full p-1 bg-muted/80 rounded-xl mb-6">
          <Link
            href={`/login${redirectTarget !== "/" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
            className="flex-1 py-2 text-center font-medium text-xs sm:text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
          <div className="flex-1 py-2 text-center font-bold text-xs sm:text-sm rounded-lg bg-card text-foreground shadow-sm transition-all flex items-center justify-center gap-1.5">
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            <span>Create Account</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            New Customer Registration
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {step === 1 ? "Create Your Account" : "Complete Registration"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {step === 1
              ? "Verify your WhatsApp number to begin account setup"
              : `Enter the 6-digit code sent to +91 ${phone} and set your password`}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-[11px]">
              {step === 2 ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
            </span>
            <span>WhatsApp OTP</span>
          </div>
          <div className={`h-0.5 w-8 rounded ${step === 2 ? "bg-primary" : "bg-border"}`} />
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
            <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${step === 2 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              2
            </span>
            <span>Profile & Password</span>
          </div>
        </div>

        {step === 1 ? (
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
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
              disabled={loading || phone.length < 10}
            >
              <MessageCircle className="h-4 w-4" />
              {loading ? "Sending WhatsApp OTP..." : "Get OTP via WhatsApp"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="otp" className="text-sm font-medium">
                  6-Digit WhatsApp OTP
                </Label>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Mock OTP: 123456
                </span>
              </div>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 text-center text-lg tracking-widest font-mono h-11"
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground text-center">
                Testing enabled: use code <strong className="text-emerald-500">123456</strong> to verify.
              </p>
            </div>

            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11"
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Used for order receipts and shipping updates.
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password (min 6 characters)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                You will sign in using your WhatsApp number (+91 {phone}) and this password.
              </p>
            </div>

            <div>
              <Label htmlFor="referral" className="text-sm font-medium">
                Referral Code (Optional)
              </Label>
              <Input
                id="referral"
                type="text"
                placeholder="e.g. 9F3B21"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="mt-1 uppercase h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-xl shadow-sm transition-all"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Change Number
              </button>

              {countdown > 0 ? (
                <span className="text-muted-foreground">Resend code in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="font-medium text-emerald-600 hover:underline"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Clear Notice For Existing Users */}
        <div className="mt-6 pt-5 border-t border-border/60">
          <div className="bg-muted/40 rounded-xl p-3.5 border border-border/50 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Already have a registered account?
            </p>
            <Link
              href={`/login${redirectTarget !== "/" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-card hover:bg-muted text-foreground border border-border/60 shadow-sm transition-all"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>Sign In to Existing Account</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="pt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Verified with WhatsApp Cloud OTP</span>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-1">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
