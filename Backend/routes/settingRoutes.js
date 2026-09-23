import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", protect, authorize("admin"), updateSettings);

export default router;
