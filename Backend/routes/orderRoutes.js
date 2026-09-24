import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrdersAdmin,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/admin", authorize("admin", "superadmin"), getAllOrdersAdmin);
router.get("/user/:userId", authorize("admin", "superadmin"), getOrdersByUser);
router.get("/:id", getOrderById);
router.put("/:id/status", authorize("admin", "superadmin"), updateOrderStatus);
router.patch("/:id/cancel", cancelOrder);

export default router;
