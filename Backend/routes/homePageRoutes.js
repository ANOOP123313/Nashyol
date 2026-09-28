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
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  getTopBarOffers,
  updateTopBarOffers,
} from "../controllers/homePageController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/home-page", getPublicHomePage);
router.get("/home-page/top-bar-offers", getTopBarOffers);
router.post("/newsletter/subscribe", subscribeNewsletter);

// Top Bar Offers (Admin)
router.put("/home-page/top-bar-offers", protect, authorize("admin", "superadmin"), updateTopBarOffers);

// Newsletter Subscribers (Admin)
router.get("/newsletter/subscribers", protect, authorize("admin", "superadmin"), getNewsletterSubscribers);
router.delete("/newsletter/subscribers/:id", protect, authorize("admin", "superadmin"), deleteNewsletterSubscriber);

// Admin CMS Sections (Protected)
router.get("/home-page/admin/sections", protect, authorize("admin", "superadmin"), getAdminSections);
router.post("/home-page/sections", protect, authorize("admin", "superadmin"), createSection);
router.patch("/home-page/sections/reorder", protect, authorize("admin", "superadmin"), reorderSections);
router.post("/home-page/seed", protect, authorize("admin", "superadmin"), seedDefaultSections);

router.get("/home-page/sections/:id", protect, authorize("admin", "superadmin"), getSectionById);
router.put("/home-page/sections/:id", protect, authorize("admin", "superadmin"), updateSection);
router.delete("/home-page/sections/:id", protect, authorize("admin", "superadmin"), deleteSection);
router.patch("/home-page/sections/:id/status", protect, authorize("admin", "superadmin"), toggleSectionStatus);

export default router;
