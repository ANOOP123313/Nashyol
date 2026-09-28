import express from "express";
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/validate", validateCoupon);
router.get("/", protect, getCoupons);
router.post("/", protect, authorize("admin", "superadmin"), createCoupon);
router.delete("/:id", protect, authorize("admin", "superadmin"), deleteCoupon);

export default router;
