import express from "express";
import {
  createReview,
  getMyReviews,
  getProductReviews,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
  canReviewProduct,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route: get approved reviews for product
router.get("/product/:productId", getProductReviews);

// Protected user routes
router.get("/can-review/:productId", protect, canReviewProduct);
router.post("/", protect, createReview);
router.get("/my", protect, getMyReviews);

// Admin moderation routes
router.get("/admin", protect, authorize("admin"), getAllReviewsAdmin);
router.get("/moderate", protect, authorize("admin"), getAllReviewsAdmin);
router.put("/:id/status", protect, authorize("admin"), updateReviewStatus);
router.put("/:id/approve", protect, authorize("admin"), updateReviewStatus);
router.delete("/:id", protect, authorize("admin"), deleteReview);

export default router;
