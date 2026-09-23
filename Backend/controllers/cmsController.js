import asyncHandler from "express-async-handler";
import Page from "../models/Page.js";
import Faq from "../models/Faq.js";
import Blog from "../models/Blog.js";

// --- PAGES ---
export const getPages = asyncHandler(async (req, res) => {
  const pages = await Page.find().sort({ createdAt: -1 });
  res.json(pages);
});

export const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }
  res.json(page);
});

export const createPage = asyncHandler(async (req, res) => {
  const { title, slug, content, status, metaTitle, metaDescription } = req.body;
  const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const existing = await Page.findOne({ slug: pageSlug });
  if (existing) {
    res.status(400);
    throw new Error("Page with this slug already exists");
  }

  const page = await Page.create({
    title,
    slug: pageSlug,
    content,
    status: status || "Published",
    metaTitle,
    metaDescription,
  });
  res.status(201).json(page);
});

export const updatePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }

  Object.assign(page, req.body);
  await page.save();
  res.json(page);
});

export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error("Page not found");
  }
  await page.deleteOne();
  res.json({ message: "Page removed" });
});

// --- FAQS ---
export const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find().sort({ createdAt: -1 });
  res.json(faqs);
});

export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, status } = req.body;
  const faq = await Faq.create({ question, answer, category, status });
  res.status(201).json(faq);
});

export const updateFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }
  Object.assign(faq, req.body);
  await faq.save();
  res.json(faq);
});

export const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }
  await faq.deleteOne();
  res.json({ message: "FAQ removed" });
});

// --- BLOGS ---
export const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  res.json(blog);
});

export const createBlog = asyncHandler(async (req, res) => {
  const { title, slug, content, author, image, category, status } = req.body;
  const blogSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const blog = await Blog.create({
    title,
    slug: blogSlug,
    content,
    author: author || "Admin",
    image,
    category,
    status: status || "Published",
  });
  res.status(201).json(blog);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  Object.assign(blog, req.body);
  await blog.save();
  res.json(blog);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog post not found");
  }
  await blog.deleteOne();
  res.json({ message: "Blog post removed" });
});
