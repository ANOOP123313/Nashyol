import express from "express";
import { getAdminPayments, updatePaymentStatus } from "../controllers/paymentController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin", protect, authorize("admin"), getAdminPayments);
router.put("/admin/:id/status", protect, authorize("admin"), updatePaymentStatus);

export default router;
