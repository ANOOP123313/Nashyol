import express from "express";
import {
  getPublicHomePage,
  getAdminSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  toggleSectionStatus,
  reorderSections,
  seedDefaultSections,
  subscribeNewsletter,
} from "../controllers/homePageController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/home-page", getPublicHomePage);
router.post("/newsletter/subscribe", subscribeNewsletter);

// Admin Routes (Protected)
router.get("/home-page/admin/sections", protect, authorize("admin"), getAdminSections);
router.post("/home-page/sections", protect, authorize("admin"), createSection);
router.patch("/home-page/sections/reorder", protect, authorize("admin"), reorderSections);
router.post("/home-page/seed", protect, authorize("admin"), seedDefaultSections);

router.get("/home-page/sections/:id", protect, authorize("admin"), getSectionById);
router.put("/home-page/sections/:id", protect, authorize("admin"), updateSection);
router.delete("/home-page/sections/:id", protect, authorize("admin"), deleteSection);
router.patch("/home-page/sections/:id/status", protect, authorize("admin"), toggleSectionStatus);

export default router;
