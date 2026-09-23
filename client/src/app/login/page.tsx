"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { Phone, Mail, Lock, ShieldCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const { login, loginWithPhone } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMethod === "phone") {
        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
          throw new Error("Please enter a valid 10-digit phone number");
        }
        await loginWithPhone(cleanPhone, password);
      } else {
        await login(email, password);
      }
      toast.success("Welcome back!");
      router.push(redirectTarget);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-border">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${redirectTarget !== "/" ? `?redirect=${encodeURIComponent(redirectTarget)}` : ""}`}
              className="text-primary font-medium hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>

        {/* Toggle Login Method */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLoginMethod("phone")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              loginMethod === "phone"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Phone className="h-3.5 w-3.5" /> Phone & Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("email")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              loginMethod === "email"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Email & Password
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === "phone" ? (
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative mt-1 flex items-center">
                <span className="absolute left-3 text-sm font-semibold text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="pl-12"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="password" className="text-sm font-medium">
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
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl shadow-sm transition-all"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Secure WhatsApp & Password Authentication</span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
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
      <LoginForm />
    </Suspense>
  );
}
