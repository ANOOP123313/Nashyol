import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

/* ================= CREATE CATEGORY / SUBCATEGORY ================= */

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, image, parentCategory, isActive } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Category name is required",
    });
  }

  const categorySlug =
    slug?.trim() ||
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // If a parentCategory ID is provided, add as a subcategory to that parent
  if (parentCategory && parentCategory !== "" && parentCategory !== "null") {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Selected parent category not found",
      });
    }

    const slugExists = parent.subCategories.some(
      (sc) => sc.slug.toLowerCase() === categorySlug.toLowerCase()
    );
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: `Subcategory with slug "${categorySlug}" already exists in ${parent.name}`,
      });
    }

    const newSubCategory = {
      name: name.trim(),
      slug: categorySlug,
      description: description || "",
      icon: icon || "📁",
      image: image || "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    parent.subCategories.push(newSubCategory);
    await parent.save();

    const createdSub = parent.subCategories[parent.subCategories.length - 1];

    return res.status(201).json({
      success: true,
      message: "Subcategory added successfully",
      data: createdSub,
      parentCategory: parent._id,
    });
  }

  // Otherwise, create as a top-level parent category
  const existingCategory = await Category.findOne({
    slug: categorySlug,
    parentCategory: null,
  });

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: `Category with slug "${categorySlug}" already exists`,
    });
  }

  const category = await Category.create({
    name: name.trim(),
    slug: categorySlug,
    description: description || "",
    icon: icon || "📦",
    image: image || "",
    parentCategory: null,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    subCategories: [],
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

/* ================= GET ALL CATEGORIES ================= */

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 }).lean();

  // Compute product counts for each category
  const productCounts = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  productCounts.forEach((item) => {
    if (item._id) countMap[item._id.toString()] = item.count;
  });

  const enrichedCategories = categories.map((cat) => {
    const pCount = countMap[cat._id.toString()] || 0;
    const subCategories = (cat.subCategories || []).map((sc) => ({
      ...sc,
      isActive: sc.isActive !== false,
      icon: sc.icon || "📁",
      productCount: 0,
    }));

    return {
      ...cat,
      isActive: cat.isActive !== false,
      icon: cat.icon || "📦",
      productCount: pCount,
      subCategories,
    };
  });

  res.json({
    success: true,
    count: enrichedCategories.length,
    data: enrichedCategories,
  });
});

/* ================= GET CATEGORY BY ID ================= */

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).populate(
    "parentCategory",
    "name"
  );

  if (category) {
    return res.json({
      success: true,
      data: category,
    });
  }

  // Check if it's a subcategory
  const parent = await Category.findOne({ "subCategories._id": req.params.id });
  if (parent) {
    const sub = parent.subCategories.id(req.params.id);
    return res.json({
      success: true,
      data: {
        ...sub.toObject(),
        parentCategory: parent._id,
        parentName: parent.name,
      },
    });
  }

  res.status(404).json({
    success: false,
    message: "Category not found",
  });
});

/* ================= UPDATE CATEGORY / SUBCATEGORY ================= */

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, icon, image, parentCategory, isActive } = req.body;
  const { id } = req.params;

  // 1. Try finding as top-level category
  let category = await Category.findById(id);

  if (category) {
    if (name) category.name = name.trim();
    if (slug) category.slug = slug.trim();
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    const updatedCategory = await category.save();

    return res.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  }

  // 2. Try finding as subcategory inside a parent category
  const parent = await Category.findOne({ "subCategories._id": id });
  if (parent) {
    const sub = parent.subCategories.id(id);
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    if (name) sub.name = name.trim();
    if (slug) sub.slug = slug.trim();
    if (description !== undefined) sub.description = description;
    if (icon) sub.icon = icon;
    if (image !== undefined) sub.image = image;
    if (isActive !== undefined) sub.isActive = Boolean(isActive);

    // If changing parent category
    if (parentCategory && parentCategory.toString() !== parent._id.toString()) {
      const newParent = await Category.findById(parentCategory);
      if (newParent) {
        parent.subCategories.pull({ _id: id });
        await parent.save();

        newParent.subCategories.push(sub);
        await newParent.save();

        return res.json({
          success: true,
          message: "Subcategory moved and updated successfully",
          data: sub,
        });
      }
    }

    await parent.save();

    return res.json({
      success: true,
      message: "Subcategory updated successfully",
      data: sub,
    });
  }

  res.status(404).json({
    success: false,
    message: "Category or subcategory not found",
  });
});

/* ================= DELETE CATEGORY / SUBCATEGORY ================= */

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Check if top-level category
  const category = await Category.findById(id);
  if (category) {
    await category.deleteOne();
    return res.json({
      success: true,
      message: "Category deleted successfully",
    });
  }

  // 2. Check if subcategory
  const parent = await Category.findOne({ "subCategories._id": id });
  if (parent) {
    parent.subCategories.pull({ _id: id });
    await parent.save();
    return res.json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  }

  res.status(404).json({
    success: false,
    message: "Category or subcategory not found",
  });
});

/* ================= ACTIVATE / DEACTIVATE ================= */

export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Check if top-level category
  const category = await Category.findById(id);
  if (category) {
    category.isActive = !category.isActive;
    await category.save();

    return res.json({
      success: true,
      message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
      data: category,
    });
  }

  // 2. Check if subcategory
  const parent = await Category.findOne({ "subCategories._id": id });
  if (parent) {
    const sub = parent.subCategories.id(id);
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    sub.isActive = !sub.isActive;
    await parent.save();

    return res.json({
      success: true,
      message: `Subcategory ${sub.isActive ? "activated" : "deactivated"} successfully`,
      data: sub,
    });
  }

  res.status(404).json({
    success: false,
    message: "Category or subcategory not found",
  });
});

/* ================= SEARCH CATEGORY ================= */

export const searchCategories = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  const categories = await Category.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { slug: { $regex: keyword, $options: "i" } },
      { "subCategories.name": { $regex: keyword, $options: "i" } },
    ],
  });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});