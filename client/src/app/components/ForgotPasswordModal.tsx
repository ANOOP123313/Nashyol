"use client";

import { useState, useEffect } from "react";
import { authApi } from "@/services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { X, MessageCircle, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp phone number");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPasswordWhatsapp({ phone: cleanPhone });
      toast.success(res.message || "OTP sent to your WhatsApp!");
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.resetPasswordWhatsapp({
        phone: phone.replace(/\D/g, ""),
        otp,
        newPassword,
      });
      toast.success(res.message || "Password reset successful! You can now sign in.");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            {step === 1 ? (
              <MessageCircle className="h-5 w-5" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {step === 1 ? "Reset via WhatsApp" : "Set New Password"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {step === 1
                ? "Enter your registered WhatsApp number"
                : `Enter the code sent to +91 ${phone}`}
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <Label htmlFor="reset-phone" className="text-sm font-medium">
                WhatsApp Number
              </Label>
              <div className="relative mt-1 flex items-center">
                <span className="absolute left-3 text-sm font-semibold text-muted-foreground">
                  +91
                </span>
                <Input
                  id="reset-phone"
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

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-sm"
              disabled={loading || phone.length < 10}
            >
              {loading ? "Sending WhatsApp Code..." : "Send Verification Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-otp" className="text-sm font-medium">
                6-Digit WhatsApp OTP
              </Label>
              <Input
                id="reset-otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 text-center text-lg tracking-widest font-mono"
                required
              />
            </div>

            <div>
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password (min 6 characters)
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-sm"
              disabled={loading}
            >
              {loading ? "Updating Password..." : "Update Password"}
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
                <span className="text-muted-foreground">Resend in {countdown}s</span>
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
      </div>
    </div>
  );
}
