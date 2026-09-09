import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

/* ================= CREATE CATEGORY ================= */

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, image, parentCategory } = req.body;

  const categorySlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const existingCategory = await Category.findOne({ slug: categorySlug });

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: "Category already exists",
    });
  }

  const category = await Category.create({
    name,
    slug: categorySlug,
    description,
    icon,
    image,
    parentCategory: parentCategory || null,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

/* ================= GET ALL CATEGORIES ================= */

export const getCategories = asyncHandler(async (req, res) => {
  const count = await Category.countDocuments();
  const categories = await Category.find()
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/* ================= GET CATEGORY BY ID ================= */

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate(
    "parentCategory",
    "name"
  );

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  res.json({
    success: true,
    data: category,
  });
});

/* ================= UPDATE CATEGORY ================= */

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, image, parentCategory } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  category.name = name || category.name;
  if (slug) category.slug = slug;
  category.description = description !== undefined ? description : category.description;
  category.icon = icon || category.icon;
  if (image !== undefined) category.image = image;
  category.parentCategory = parentCategory || null;

  const updatedCategory = await category.save();

  res.json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

/* ================= DELETE CATEGORY ================= */

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

/* ================= ACTIVATE / DEACTIVATE ================= */

export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  category.isActive = !category.isActive;

  await category.save();

  res.json({
    success: true,
    message: `Category ${
      category.isActive ? "activated" : "deactivated"
    } successfully`,
    data: category,
  });
});

/* ================= SEARCH CATEGORY ================= */

export const searchCategories = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  const categories = await Category.find({
    name: { $regex: keyword, $options: "i" },
  });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});