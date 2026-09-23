import express from "express";
import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/cmsController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- Pages ---
router.get("/pages", getPages);
router.get("/pages/:slug", getPageBySlug);
router.post("/pages", protect, authorize("admin"), createPage);
router.put("/pages/:id", protect, authorize("admin"), updatePage);
router.delete("/pages/:id", protect, authorize("admin"), deletePage);

// --- FAQs ---
router.get("/faqs", getFaqs);
router.post("/faqs", protect, authorize("admin"), createFaq);
router.put("/faqs/:id", protect, authorize("admin"), updateFaq);
router.delete("/faqs/:id", protect, authorize("admin"), deleteFaq);

// --- Blogs ---
router.get("/blogs", getBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.post("/blogs", protect, authorize("admin"), createBlog);
router.put("/blogs/:id", protect, authorize("admin"), updateBlog);
router.delete("/blogs/:id", protect, authorize("admin"), deleteBlog);

export default router;
