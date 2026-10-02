import express from "express";
import {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  clickBanner,
} from "../controllers/bannerController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getBanners);
router.get("/admin", protect, authorize("admin"), getAllBanners);
router.post("/", protect, authorize("admin"), createBanner);
router.post("/:id/click", clickBanner);
router.put("/:id", protect, authorize("admin"), updateBanner);
router.delete("/:id", protect, authorize("admin"), deleteBanner);

export default router;
