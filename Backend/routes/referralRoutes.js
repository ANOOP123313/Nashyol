import express from "express";
import {
  applyReferralCode,
  getReferralStats,
  getAdminReferrers,
  getAdminReferrerDetail,
  generateAdminRewardCoupon,
} from "../controllers/referralController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyReferralCode);
router.get("/stats", protect, getReferralStats);

// Admin Routes
router.get("/admin/referrers", protect, admin, getAdminReferrers);
router.get("/admin/referrer/:id", protect, admin, getAdminReferrerDetail);
router.post("/admin/generate-coupon", protect, admin, generateAdminRewardCoupon);

export default router;

