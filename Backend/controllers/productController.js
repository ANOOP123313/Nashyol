

import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Inventory from "../models/Inventory.js";
import { calculateStatus } from "./inventoryController.js";

const escapeRegex = (s) => (s ? String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "");

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

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const cleanCat = category.trim();
      const firstWord = cleanCat.split(/[\s&]+/)[0];
      const foundCats = await Category.find({
        $or: [
          { name: { $regex: new RegExp(`^${escapeRegex(cleanCat)}$`, "i") } },
          { slug: { $regex: new RegExp(`^${escapeRegex(cleanCat)}$`, "i") } },
          { name: { $regex: new RegExp(escapeRegex(firstWord), "i") } },
          { slug: { $regex: new RegExp(escapeRegex(firstWord), "i") } },
        ]
      });

      if (foundCats.length > 0) {
        const catIds = foundCats.map(c => c._id);
        const childCats = await Category.find({ parentCategory: { $in: catIds } });
        const allCatIds = [...catIds, ...childCats.map(c => c._id)];
        filter.category = { $in: allCatIds };
      } else {
        filter.$or = [
          { title: { $regex: new RegExp(escapeRegex(cleanCat), "i") } },
          { description: { $regex: new RegExp(escapeRegex(cleanCat), "i") } }
        ];
      }
    }
  }
  if (brand) filter.brand = brand;

  const subcategory = req.query.subcategory || req.query.subCategory;
  if (subcategory) {
    const cleanSub = String(subcategory).trim();
    if (cleanSub) {
      // Find subcategory names if slug or partial name was passed
      const matchingCats = await Category.find({
        $or: [
          { "subCategories.slug": cleanSub.toLowerCase() },
          { "subCategories.name": new RegExp(escapeRegex(cleanSub), "i") },
        ],
      });

      const matchedSubNames = new Set([cleanSub]);
      matchingCats.forEach((c) => {
        c.subCategories?.forEach((sc) => {
          if (
            sc.slug.toLowerCase() === cleanSub.toLowerCase() ||
            sc.name.toLowerCase().includes(cleanSub.toLowerCase()) ||
            cleanSub.toLowerCase().includes(sc.slug.toLowerCase())
          ) {
            matchedSubNames.add(sc.name);
          }
        });
      });

      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          ...Array.from(matchedSubNames).map((sn) => ({
            subCategory: { $regex: new RegExp(escapeRegex(sn), "i") },
          })),
          { title: { $regex: new RegExp(escapeRegex(cleanSub), "i") } },
        ],
      });
    }
  }

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




// ── Create Product (Admin) ──
export const createProduct = asyncHandler(async (req, res) => {
  let categoryId = req.body.category;

  if (categoryId && typeof categoryId === "string" && !mongoose.Types.ObjectId.isValid(categoryId)) {
    const cleanCat = categoryId.trim();
    const firstWord = cleanCat.split(/[\s&]+/)[0];
    const foundCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${escapeRegex(cleanCat)}$`, "i") } },
        { slug: { $regex: new RegExp(`^${escapeRegex(cleanCat)}$`, "i") } },
        { name: { $regex: new RegExp(escapeRegex(firstWord), "i") } },
        { slug: { $regex: new RegExp(escapeRegex(firstWord), "i") } },
      ]
    });
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

  let specifications = req.body.specifications;
  if (typeof specifications === "string") {
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      specifications = [];
    }
  }
  if (Array.isArray(specifications)) {
    specifications = specifications
      .map(s => ({
        key: typeof s?.key === "string" ? s.key.trim() : String(s?.key || "").trim(),
        value: typeof s?.value === "string" ? s.value.trim() : String(s?.value || "").trim(),
      }))
      .filter(s => s.key || s.value);
  } else {
    specifications = [];
  }

  let inventoryDoc = null;
  const inventoryId = req.body.inventoryId || req.body.inventory || null;
  if (inventoryId) {
    inventoryDoc = await Inventory.findById(inventoryId);
  }
  if (!inventoryDoc && req.body.sku) {
    inventoryDoc = await Inventory.findOne({ sku: req.body.sku });
  }
  if (!inventoryDoc && title) {
    inventoryDoc = await Inventory.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(title)}$`, "i") },
      isAddedToProducts: { $ne: true },
    });
  }

  const finalInventoryId = inventoryDoc?._id || inventoryId || null;
  const finalSku = req.body.sku || inventoryDoc?.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let variants = req.body.variants;
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    const price = Number(req.body.price) || inventoryDoc?.price || 99;
    const stock = req.body.stock !== undefined ? Number(req.body.stock) : (inventoryDoc?.currentStock ?? 10);
    variants = [{
      sku: finalSku,
      sellingPrice: price,
      currentStock: stock,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    }];
  } else {
    variants = variants.map((v, idx) => ({
      ...v,
      sku: v.sku || `${finalSku}-VAR-${idx + 1}`
    }));
  }

  const rawSubCategory = req.body.subCategory || req.body.subcategory || "";
  const subCategory = typeof rawSubCategory === "string" ? rawSubCategory.trim() : "";

  const productData = {
    ...req.body,
    title,
    brand: brand || inventoryDoc?.brand || "Generic",
    description: description || inventoryDoc?.description || "",
    category: categoryId,
    subCategory,
    variants,
    specifications,
    inventory: finalInventoryId,
    createdBy: req.user?._id || new mongoose.Types.ObjectId(),
  };

  console.log("productData.variants BEFORE SAVE:", JSON.stringify(productData.variants, null, 2));

  const product = new Product(productData);
  const createdProduct = await product.save();

  if (inventoryDoc) {
    try {
      inventoryDoc.isAddedToProducts = true;
      inventoryDoc.product = createdProduct._id;
      if (createdProduct.variants?.[0]?.currentStock !== undefined) {
        inventoryDoc.currentStock = createdProduct.variants[0].currentStock;
        inventoryDoc.status = calculateStatus(inventoryDoc.currentStock, inventoryDoc.reorderPoint);
      }
      await inventoryDoc.save();
    } catch (invErr) {
      console.error("Error linking inventory item:", invErr);
    }
  } else if (finalInventoryId) {
    try {
      await Inventory.findByIdAndUpdate(finalInventoryId, {
        isAddedToProducts: true,
        product: createdProduct._id,
      });
    } catch (invErr) {
      console.error("Error linking inventory item:", invErr);
    }
  }

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
    } else if (!req.body.variants || req.body.variants.length === 0) {
      if (req.body.price !== undefined) product.variants[0].sellingPrice = Number(req.body.price);
      if (req.body.stock !== undefined) product.variants[0].currentStock = Number(req.body.stock);
    }
    product.markModified("variants");
  }

  const updateData = { ...req.body };

  if (updateData.variants && Array.isArray(updateData.variants)) {
    const baseSku = product.variants?.[0]?.sku ? product.variants[0].sku.split('-VAR-')[0] : `SKU-${Date.now()}`;
    updateData.variants = updateData.variants.map((v, idx) => {
      // Re-use existing SKU if matching attributes
      const existing = product.variants.find(oldV => 
        oldV.attributes?.[0]?.name === v.attributes?.[0]?.name && 
        oldV.attributes?.[0]?.value === v.attributes?.[0]?.value
      );
      return {
        ...v,
        sku: v.sku || existing?.sku || `${baseSku}-VAR-${idx + 1}`
      };
    });
  }

  if (req.body.subCategory !== undefined || req.body.subcategory !== undefined) {
    const rawSubCat = req.body.subCategory !== undefined ? req.body.subCategory : req.body.subcategory;
    updateData.subCategory = typeof rawSubCat === "string" ? rawSubCat.trim() : "";
  }

  // Resolve category if provided (string name or ObjectId)
  if (req.body.category) {
    let categoryId = req.body.category;
    if (typeof categoryId === "string" && !mongoose.Types.ObjectId.isValid(categoryId)) {
      const cleanCat = categoryId.trim();
      const firstWord = cleanCat.split(/[\s&]+/)[0];
      const foundCategory = await Category.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${escapeRegex(cleanCat)}$`, "i") } },
          { slug: { $regex: new RegExp(`^${escapeRegex(cleanCat)}$`, "i") } },
          { name: { $regex: new RegExp(escapeRegex(firstWord), "i") } },
          { slug: { $regex: new RegExp(escapeRegex(firstWord), "i") } },
        ]
      });
      if (foundCategory) {
        updateData.category = foundCategory._id;
      } else {
        delete updateData.category;
      }
    } else if (mongoose.Types.ObjectId.isValid(categoryId)) {
      updateData.category = categoryId;
    } else {
      delete updateData.category;
    }
  }

  if (req.body.specifications !== undefined) {
    let specifications = req.body.specifications;
    if (typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        specifications = [];
      }
    }
    if (Array.isArray(specifications)) {
      updateData.specifications = specifications
        .map(s => ({
          key: typeof s?.key === "string" ? s.key.trim() : String(s?.key || "").trim(),
          value: typeof s?.value === "string" ? s.value.trim() : String(s?.value || "").trim(),
        }))
        .filter(s => s.key || s.value);
    } else {
      updateData.specifications = [];
    }
  }

  delete updateData.price;
  delete updateData.stock;

  Object.assign(product, updateData);

  const updatedProduct = await product.save();

  // Sync changes (stock, price, title) to linked inventory item
  try {
    const newStock = req.body.stock !== undefined ? Number(req.body.stock) : product.variants?.[0]?.currentStock;
    const newPrice = req.body.price !== undefined ? Number(req.body.price) : product.variants?.[0]?.sellingPrice;
    const newTitle = req.body.title || product.title;

    const invOrConditions = [
      ...(product.inventory ? [{ _id: product.inventory }] : []),
      { product: product._id },
      ...((product.variants || []).map((v) => v.sku).filter(Boolean).map((sku) => ({ sku }))),
      ...(product.title ? [{ title: product.title }] : []),
    ];

    if (invOrConditions.length > 0) {
      const invItems = await Inventory.find({ $or: invOrConditions });
      for (const inv of invItems) {
        let changed = false;
        if (newStock !== undefined && !isNaN(newStock) && inv.currentStock !== newStock) {
          const diff = newStock - inv.currentStock;
          inv.currentStock = newStock;
          inv.status = calculateStatus(newStock, inv.reorderPoint);
          inv.movements.unshift({
            type: diff >= 0 ? "in" : "out",
            units: Math.abs(diff),
            reason: "Product page stock update sync",
            by: req.user?.name || "Admin User",
            date: new Date(),
          });
          changed = true;
        }
        if (newPrice !== undefined && !isNaN(newPrice) && inv.price !== newPrice) {
          inv.price = newPrice;
          changed = true;
        }
        if (newTitle && inv.title !== newTitle) {
          inv.title = newTitle;
          changed = true;
        }
        if (changed) {
          await inv.save();
        }
      }
    }
  } catch (syncErr) {
    console.error("Error syncing product update to inventory:", syncErr);
  }

  res.json(updatedProduct);

});


// ── Delete Product ──
export const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id);

  if (!product) {
    // If not found, still ensure any inventory linked to this ID is freed
    await Inventory.updateMany(
      { $or: [{ product: req.params.id }, { _id: req.params.id }] },
      { $set: { isAddedToProducts: false, product: null } }
    );
    res.status(404);
    throw new Error("Product not found");
  }

  const skus = (product.variants || []).map((v) => v.sku).filter(Boolean);

  // Unlink and reset all inventory items linked to this product:
  // 1. By product.inventory (if specified)
  // 2. By Inventory.product === product._id
  // 3. By Inventory.sku matching any of product's variant SKUs
  // 4. By product title matching inventory title
  const orConditions = [
    { product: product._id },
    ...(product.inventory ? [{ _id: product.inventory }] : []),
    ...(skus.length > 0 ? [{ sku: { $in: skus } }] : []),
    ...(product.title ? [{ title: product.title }] : []),
  ];

  await Inventory.updateMany(
    { $or: orConditions },
    { $set: { isAddedToProducts: false, product: null } }
  );

  await Product.findByIdAndDelete(req.params.id);

  res.json({ message: "Product deleted successfully" });

});