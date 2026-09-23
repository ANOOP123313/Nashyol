import express from "express";
import {
  createReturn,
  getMyReturns,
  getAllReturns,
  updateReturnStatus,
  trackReturn,
} from "../controllers/returnController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public return tracking route
router.get("/track/:query", trackReturn);

// Protected routes
router.use(protect);

router.post("/", createReturn);
router.get("/my", getMyReturns);
router.get("/admin", authorize("admin"), getAllReturns);
router.put("/:id/status", authorize("admin"), updateReturnStatus);

export default router;
