"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

interface WhatsAppLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoginSuccess?: (user: any, token: string) => void;
}

export default function WhatsAppLoginModal({
  isOpen = true,
  onClose,
  onLoginSuccess,
}: WhatsAppLoginModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Enter Phone, 2: Enter OTP
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Countdown timer for Resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  // Step 1: Send WhatsApp OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return setError("Please enter a valid 10-digit WhatsApp number");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/api/auth/phone/send-registration-otp`, {
        phone: cleanPhone,
      });
      setSuccess(res.data.message || "OTP sent to your WhatsApp!");
      if (res.data.otp || res.data.mockOtp) {
        setOtp(res.data.otp || res.data.mockOtp);
      }
      setStep(2);
      setCountdown(60); // 60-second cooldown
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send WhatsApp OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify WhatsApp OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      return setError("Please enter the complete 6-digit OTP");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${apiUrl}/api/auth/phone/verify-registration-otp`, {
        phone: phone.replace(/\D/g, ""),
        otp,
        name: name || undefined,
      });
      setSuccess("Verification successful!");
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (onLoginSuccess) {
        onLoginSuccess(res.data.user, res.data.token);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
        <h2 style={styles.title}>
          {step === 1 ? "WhatsApp Verification" : "Verify WhatsApp OTP"}
        </h2>
        <p style={styles.subtitle}>
          {step === 1
            ? "We'll send a 6-digit verification code to your WhatsApp."
            : `Code sent to +91 ${phone}`}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>WhatsApp Number</label>
              <div style={styles.phoneWrapper}>
                <span style={styles.prefix}>+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  style={{ ...styles.input, paddingLeft: "52px" }}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Sending OTP..." : "Get OTP via WhatsApp"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  ...styles.input,
                  textAlign: "center",
                  letterSpacing: "6px",
                  fontSize: "1.25rem",
                }}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <div style={styles.resendWrapper}>
              {countdown > 0 ? (
                <span style={styles.timerText}>Resend code in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  style={styles.resendBtn}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
              <button
                type="button"
                onClick={() => setStep(1)}
                style={styles.changePhoneBtn}
              >
                Change number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    padding: "32px",
    background: "#1f2937",
    color: "#f3f4f6",
    borderRadius: "16px",
    boxShadow: "0 20px 30px rgba(0,0,0,0.4)",
    fontFamily: "sans-serif",
  },
  closeBtn: {
    position: "absolute",
    right: "16px",
    top: "16px",
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px",
  },
  title: { fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" },
  subtitle: { fontSize: "0.85rem", color: "#9ca3af", marginBottom: "18px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", color: "#d1d5db" },
  phoneWrapper: { position: "relative", display: "flex", alignItems: "center" },
  prefix: {
    position: "absolute",
    left: "12px",
    color: "#9ca3af",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #374151",
    background: "#111827",
    color: "#fff",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    background: "#25D366", // WhatsApp Green
    color: "#ffffff",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "8px",
    transition: "background 0.2s",
  },
  error: {
    background: "#ef444422",
    color: "#f87171",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    marginBottom: "12px",
  },
  success: {
    background: "#10b98122",
    color: "#34d399",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "0.85rem",
    marginBottom: "12px",
  },
  resendWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
  },
  timerText: { fontSize: "0.8rem", color: "#9ca3af" },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#25D366",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  changePhoneBtn: {
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
};
