import express from "express";
import {
  phonePasswordLogin,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  forgotPasswordWhatsapp,
  resetPasswordWhatsapp,
} from "../controllers/whatsappAuthController.js";

const router = express.Router();

// Routine login with phone + password
router.post("/phone/login", phonePasswordLogin);

// WhatsApp OTP registration flow
router.post("/phone/send-registration-otp", sendRegistrationOTP);
router.post("/phone/verify-registration-otp", verifyRegistrationOTP);

// WhatsApp OTP password reset flow
router.post("/phone/forgot-password", forgotPasswordWhatsapp);
router.post("/phone/reset-password", resetPasswordWhatsapp);

export default router;
