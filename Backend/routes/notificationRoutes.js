import express from "express";
import {
  getMyNotifications,
  markAsRead,
  getAdminNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/admin", getAdminNotifications);
router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);

export default router;
