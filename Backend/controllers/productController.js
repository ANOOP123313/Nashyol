

import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";


// ── Get All Products ──
export const getProducts = asyncHandler(async (req, res) => {

  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort = "-createdAt",
    page = 1,
    limit = 20
  } = req.query;

  const filter = {};
  if (req.query.includeInactive !== "true") {
    filter.isActive = true;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) filter.category = category;
  if (brand) filter.brand = brand;

  if (minPrice) filter["variants.sellingPrice"] = { $gte: Number(minPrice) };
  if (maxPrice) filter["variants.sellingPrice"] = { ...filter["variants.sellingPrice"], $lte: Number(maxPrice) };

  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("variants.currentVendor", "storeName")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  res.json({
    products,
    total,
    page: Number(page),
    limit: Number(limit),
  });

});


import mongoose from "mongoose";

// ── Get Single Product ──
export const getProductById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = await Product.findById(req.params.id)
    .populate("category", "name parentCategory")
    .populate("variants.currentVendor", "storeName");

  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});


// ── Featured Products ──
export const getFeaturedProducts = asyncHandler(async (req, res) => {

  const products = await Product.find({
    isActive: true,
    featured: true,
  })
    .populate("category", "name")
    .limit(12);

  res.json(products);

});


// ── Offer Products ──
export const getOffers = asyncHandler(async (req, res) => {

  const products = await Product.find({
    isActive: true,
    offerPrice: { $gt: 0 },
  })
    .populate("category", "name")
    .limit(12);

  res.json(products);

});


import Category from "../models/Category.js";

// ── Create Product (Admin) ──
export const createProduct = asyncHandler(async (req, res) => {
  let categoryId = req.body.category;

  if (categoryId && typeof categoryId === "string" && !mongoose.Types.ObjectId.isValid(categoryId)) {
    const foundCategory = await Category.findOne({ name: { $regex: new RegExp(`^${categoryId}$`, "i") } });
    if (foundCategory) {
      categoryId = foundCategory._id;
    } else {
      const firstCat = await Category.findOne({});
      if (firstCat) categoryId = firstCat._id;
    }
  }

  const title = req.body.title || req.body.name || "New Product";
  const brand = req.body.brand || req.body.vendor || "Generic";
  const description = req.body.description || "Product description";

  let variants = req.body.variants;
  if (!variants || variants.length === 0) {
    const price = Number(req.body.price) || 99;
    const stock = Number(req.body.stock) || 10;
    variants = [{
      sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sellingPrice: price,
      currentStock: stock,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    }];
  }

  const productData = {
    ...req.body,
    title,
    brand,
    description,
    category: categoryId,
    variants,
    createdBy: req.user?._id || new mongoose.Types.ObjectId(),
  };

  const product = new Product(productData);
  const createdProduct = await product.save();

  res.status(201).json(createdProduct);
});


// ── Update Product (Admin) ──
export const updateProduct = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (req.body.price !== undefined || req.body.stock !== undefined) {
    if (!product.variants || product.variants.length === 0) {
      product.variants = [{
        sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        sellingPrice: Number(req.body.price) || 0,
        currentStock: Number(req.body.stock) || 0,
        isActive: true,
      }];
    } else {
      if (req.body.price !== undefined) product.variants[0].sellingPrice = Number(req.body.price);
      if (req.body.stock !== undefined) product.variants[0].currentStock = Number(req.body.stock);
    }
  }

  Object.assign(product, req.body);

  const updatedProduct = await product.save();

  res.json(updatedProduct);

});


// ── Delete Product (Soft Delete) ──
export const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;

  await product.save();

  res.json({ message: "Product removed (soft delete)" });

});