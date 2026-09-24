import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { formatPhoneNumber } from "../utils/formatPhoneNumber.js";
import { sendWhatsappOTP } from "../utils/whatsappService.js";

// Mock OTP for testing WhatsApp authentication
const MOCK_OTP = "123456";

// Helper to generate 6-digit OTP (defaults to MOCK_OTP for local testing)
const generateOTP = () => {
  return MOCK_OTP;
};

/**
 * 1. ROUTINE LOGIN: Phone Number + Password
 */
export const phonePasswordLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    const formattedPhone = formatPhoneNumber(phone);
    // Find user by normalized phone or exact input
    const user = await User.findOne({
      $or: [{ phone: formattedPhone }, { phone: phone.toString().trim() }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    if (user.isBlocked || user.isBanned) {
      return res.status(403).json({ message: "Your account is suspended or blocked" });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "No password set for this account. Please use Forgot Password to create one.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone number or password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("phonePasswordLogin error:", error);
    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

/**
 * 2. SEND REGISTRATION OTP (First-time user WhatsApp verification)
 */
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const formattedPhone = formatPhoneNumber(phone);
    let user = await User.findOne({
      $or: [{ phone: formattedPhone }, { phone: phone.toString().trim() }],
    });

    // If user already fully registered with verified phone and password
    if (user && user.isPhoneVerified && user.password) {
      return res.status(400).json({
        message: "This phone number is already registered. Please login with your password.",
      });
    }

    // Cooldown check (prevent spamming resend within cooldown, reduced to 10s for testing)
    if (user?.otpResendAfter && user.otpResendAfter > Date.now()) {
      const waitSeconds = Math.ceil((user.otpResendAfter - Date.now()) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSeconds}s before requesting another OTP`,
      });
    }

    const rawOtp = MOCK_OTP;
    const hashedOTP = await bcrypt.hash(rawOtp, 10);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendAfter = new Date(Date.now() + 10 * 1000); // 10 seconds cooldown for easy testing

    if (!user) {
      // Create pending unverified user record
      user = await User.create({
        phone: formattedPhone,
        otp: hashedOTP,
        otpExpiry: expiry,
        otpResendAfter: resendAfter,
        isPhoneVerified: false,
      });
    } else {
      user.otp = hashedOTP;
      user.otpExpiry = expiry;
      user.otpResendAfter = resendAfter;
      await user.save();
    }

    console.log(`\n🔑 [MOCK OTP] Registration OTP for ${formattedPhone}: ${rawOtp}\n`);

    // Try sending via WhatsApp API (safe to ignore errors in dev)
    try {
      await sendWhatsappOTP({
        phone: formattedPhone,
        otp: rawOtp,
      });
    } catch (e) {
      console.warn("sendWhatsappOTP failed (using mock OTP):", e.message);
    }

    return res.status(200).json({
      message: `Registration OTP sent! Use mock OTP: ${MOCK_OTP}`,
      phone: formattedPhone,
      otp: MOCK_OTP,
      mockOtp: MOCK_OTP,
    });
  } catch (error) {
    console.error("sendRegistrationOTP error:", error);
    return res.status(500).json({
      message: error.message || "Failed to send registration OTP",
    });
  }
};

/**
 * 3. VERIFY REGISTRATION OTP & COMPLETE SIGNUP
 * Captures name, email, password, and sets isPhoneVerified = true.
 */
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { phone, otp, name, email, password, referralCode } = req.body;

    if (!phone || !otp || !name || !email || !password) {
      return res.status(400).json({
        message: "Phone, OTP, name, email, and password are all required for registration",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const user = await User.findOne({
      $or: [{ phone: formattedPhone }, { phone: phone.toString().trim() }],
    }).select("+otp");

    if (!user) {
      return res.status(404).json({ message: "Registration session not found. Please request OTP first." });
    }

    if (user.isBlocked || user.isBanned) {
      return res.status(403).json({ message: "Your account is suspended" });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const isMock = otp.toString() === MOCK_OTP || otp.toString() === "123456";
    let isMatch = isMock;
    if (!isMatch && user.otp) {
      isMatch = await bcrypt.compare(otp.toString(), user.otp);
    }
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Check if email is already taken by an existing verified user
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmailUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });
    if (existingEmailUser) {
      return res.status(400).json({ message: "This email is already in use by another account" });
    }

    // Optional referral handling
    if (referralCode?.trim() && !user.referredBy) {
      const referrer = await User.findOne({ referralCode: referralCode.trim() });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        user.referredBy = referrer._id;
      }
    }

    // Save final details
    user.name = name.trim();
    user.email = normalizedEmail;
    user.password = password; // pre-save hook will hash it
    user.isPhoneVerified = true;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpResendAfter = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Registration completed successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("verifyRegistrationOTP error:", error);
    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

/**
 * 4. FORGOT PASSWORD (WHATSAPP OTP)
 */
export const forgotPasswordWhatsapp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const user = await User.findOne({
      $or: [{ phone: formattedPhone }, { phone: phone.toString().trim() }],
    });

    if (!user) {
      return res.status(404).json({ message: "User with this WhatsApp number not found" });
    }

    // Cooldown check (prevent spamming resend within 60 seconds)
    if (user.otpResendAfter && user.otpResendAfter > Date.now()) {
      const waitSeconds = Math.ceil((user.otpResendAfter - Date.now()) / 1000);
      return res.status(429).json({
        message: `Please wait ${waitSeconds}s before requesting another OTP`,
      });
    }

    const rawOtp = MOCK_OTP;
    const hashedOTP = await bcrypt.hash(rawOtp, 10);
    user.otp = hashedOTP;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpResendAfter = new Date(Date.now() + 10 * 1000); // 10s cooldown for easy testing
    await user.save();

    console.log(`\n🔑 [MOCK OTP] Reset Password OTP for ${formattedPhone}: ${rawOtp}\n`);

    try {
      await sendWhatsappOTP({
        phone: formattedPhone,
        otp: rawOtp,
      });
    } catch (e) {
      console.warn("sendWhatsappOTP failed (using mock OTP):", e.message);
    }

    return res.status(200).json({
      message: `Password reset OTP sent! Use mock OTP: ${MOCK_OTP}`,
      phone: formattedPhone,
      otp: MOCK_OTP,
      mockOtp: MOCK_OTP,
    });
  } catch (error) {
    console.error("forgotPasswordWhatsapp error:", error);
    return res.status(500).json({
      message: error.message || "Failed to send reset OTP",
    });
  }
};

/**
 * 5. RESET PASSWORD (WHATSAPP OTP)
 */
export const resetPasswordWhatsapp = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: "Phone, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const user = await User.findOne({
      $or: [{ phone: formattedPhone }, { phone: phone.toString().trim() }],
    }).select("+otp");

    if (!user || !user.otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const isMock = otp.toString() === MOCK_OTP || otp.toString() === "123456";
    let isMatch = isMock;
    if (!isMatch && user.otp) {
      isMatch = await bcrypt.compare(otp.toString(), user.otp);
    }
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    user.password = newPassword; // pre-save hook will hash it
    user.otp = null;
    user.otpExpiry = null;
    user.otpResendAfter = null;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully. You can now login with your phone and password.",
    });
  } catch (error) {
    console.error("resetPasswordWhatsapp error:", error);
    return res.status(500).json({
      message: error.message || "Failed to reset password",
    });
  }
};
