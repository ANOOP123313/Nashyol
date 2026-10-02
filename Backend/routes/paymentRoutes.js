import express from "express";
import { getAdminPayments, updatePaymentStatus, createPaymentIntent, createPaymentIntentFromCart, verifyPayment, stripeWebhook, payNowOrder } from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin", protect, authorize("admin"), getAdminPayments);
router.put("/admin/:id/status", protect, authorize("admin"), updatePaymentStatus);

// Client Stripe & Pay Now routes
router.post("/create-intent", protect, createPaymentIntent);
router.post("/create-intent-cart", protect, createPaymentIntentFromCart);
router.post("/verify", protect, verifyPayment);
router.post("/pay-now/:id", protect, payNowOrder);
router.post("/webhook", stripeWebhook);

export default router;
