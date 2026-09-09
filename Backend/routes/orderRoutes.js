import express from "express";
import { createOrder, getMyOrders, getAllOrdersAdmin, getOrderById, cancelOrder } from "../controllers/orderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/admin", authorize("admin"), getAllOrdersAdmin);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

export default router;
