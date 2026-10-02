import asyncHandler from "express-async-handler";
import Page from "../models/Page.js";
import Faq from "../models/Faq.js";
import Blog from "../models/Blog.js";
import BlogCategory from "../models/BlogCategory.js";

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
  let faqs = await Faq.find().sort({ createdAt: -1 });
  if (faqs.length === 0) {
    const defaultFaqs = [
      {
        question: "How do I track my order?",
        answer: "You can track your order by logging into your account and visiting the 'My Orders' section. Click on any order to view detailed tracking information.",
        category: "Orders",
        status: "Active",
      },
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached.",
        category: "Returns",
        status: "Active",
      },
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 5-7 business days. Free shipping is available on orders over ₹500.",
        category: "Shipping",
        status: "Active",
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept UPI, Net Banking, Credit/Debit cards, and Cash on Delivery (COD) on eligible orders.",
        category: "Payments",
        status: "Active",
      },
      {
        question: "How do I apply a coupon code?",
        answer: "Enter your coupon code at checkout in the 'Have a coupon?' field and click 'Apply' to see instant savings.",
        category: "Payments",
        status: "Active",
      },
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page, enter your registered phone number, and follow the OTP instructions.",
        category: "Account",
        status: "Active",
      },
    ];
    await Faq.insertMany(defaultFaqs);
    faqs = await Faq.find().sort({ createdAt: -1 });
  }

  const isAdmin = req.query.admin === "true" || (req.user && (req.user.role === "admin" || req.user.role === "superadmin"));
  if (!isAdmin) {
    const activeFaqs = faqs.filter(f => f.status === "Active");
    return res.json(activeFaqs.length > 0 ? activeFaqs : faqs);
  }
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

// --- BLOG CATEGORIES ---
export const getBlogCategories = asyncHandler(async (req, res) => {
  let categories = await BlogCategory.find().sort({ name: 1 });
  if (categories.length === 0) {
    const defaults = ["Technology", "Fashion", "Lifestyle", "Health", "E-commerce", "Guides"];
    for (const name of defaults) {
      await BlogCategory.findOneAndUpdate(
        { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        { upsert: true, new: true }
      );
    }
    categories = await BlogCategory.find().sort({ name: 1 });
  }
  res.json(categories);
});

export const createBlogCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const existing = await BlogCategory.findOne({
    $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } }, { slug }],
  });
  if (existing) {
    return res.status(400).json({ message: "Blog category already exists" });
  }
  const category = await BlogCategory.create({ name: name.trim(), slug });
  res.status(201).json(category);
});

export const deleteBlogCategory = asyncHandler(async (req, res) => {
  const category = await BlogCategory.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  res.json({ message: "Category deleted" });
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
