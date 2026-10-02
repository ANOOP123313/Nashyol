import asyncHandler from "express-async-handler";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Helper to determine status from stock
export const calculateStatus = (stock, reorderPoint = 10) => {
  if (stock <= 0) return "out_of_stock";
  if (stock <= reorderPoint) return "low_stock";
  return "in_stock";
};

// Helper to auto-heal inventory items whose linked product no longer exists in Product collection
export const syncOrphanedInventoryItems = async () => {
  try {
    const markedItems = await Inventory.find({ isAddedToProducts: true });
    if (!markedItems.length) return;

    const allProducts = await Product.find().select("_id variants inventory title");
    const existingProductIds = new Set(allProducts.map((p) => p._id.toString()));
    const linkedInventoryIds = new Set(allProducts.map((p) => p.inventory?.toString()).filter(Boolean));
    const existingSkus = new Set(
      allProducts.flatMap((p) => (p.variants || []).map((v) => v.sku).filter(Boolean))
    );
    const existingTitles = new Set(
      allProducts.map((p) => (p.title || "").trim().toLowerCase()).filter(Boolean)
    );

    const itemsToReset = markedItems.filter((item) => {
      const hasValidProduct = item.product && existingProductIds.has(item.product.toString());
      const isLinkedByProduct = linkedInventoryIds.has(item._id.toString());
      const hasValidSku = item.sku && existingSkus.has(item.sku);
      return !hasValidProduct && !isLinkedByProduct && !hasValidSku;
    });

    if (itemsToReset.length > 0) {
      await Inventory.updateMany(
        { _id: { $in: itemsToReset.map((i) => i._id) } },
        { isAddedToProducts: false, product: null }
      );
    }
  } catch (err) {
    console.error("Error auto-syncing orphaned inventory items:", err);
  }
};

// @desc    Get all inventory items (with auto-sync from Product collection if empty)
// @route   GET /api/inventory
export const getInventory = asyncHandler(async (req, res) => {
  try {
    let count = await Inventory.countDocuments();

    // Auto-seed / sync from existing products if Inventory collection is brand new
    if (count === 0) {
      const existingProducts = await Product.find().populate("category", "name");
      if (existingProducts.length > 0) {
        const seedItems = existingProducts.map((p, i) => {
          const variant = p.variants?.[0] || {};
          const stock = variant.currentStock ?? 10;
          const reorder = 10;
          return {
            title: p.title || p.name || `Inventory Item ${i + 1}`,
            sku: variant.sku || `INV-${p._id.toString().slice(-6).toUpperCase()}-${i + 1}`,
            brand: p.brand || "Generic",
            category: p.category?._id || p.category || null,
            categoryName: p.category?.name || "General",
            subCategory: p.subCategory || "",
            warehouse: p.warehouse || "Central Hub - Mumbai",
            currentStock: stock,
            reorderPoint: reorder,
            maxCapacity: 100,
            price: variant.sellingPrice || p.price || 0,
            paidAmount: p.paidAmount || 0,
            deliveryCharge: p.deliveryCharge || 0,
            description: p.description || "",
            specifications: p.specifications || [],
            images: p.images || [],
            status: calculateStatus(stock, reorder),
            isAddedToProducts: true,
            product: p._id,
            movements: [
              {
                type: "in",
                units: stock,
                reason: "Initial catalog import",
                by: "System Admin",
                date: p.createdAt || new Date(),
              },
            ],
          };
        });

        try {
          await Inventory.insertMany(seedItems, { ordered: false });
        } catch (insertErr) {
          console.warn("Some duplicate SKUs skipped during inventory auto-seed:", insertErr.message);
        }
      }
    }

    const { search, warehouse, status, category, availableOnly } = req.query;
    const filter = {};

    // Auto-heal any orphaned inventory items if querying available items or all items
    await syncOrphanedInventoryItems();

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (warehouse && warehouse !== "All Warehouses") {
      filter.warehouse = warehouse;
    }

    if (status && status !== "All Status") {
      const mappedStatus =
        status === "In Stock" ? "in_stock" :
        status === "Low Stock" ? "low_stock" :
        status === "Out of Stock" ? "out_of_stock" : status.toLowerCase();
      filter.status = mappedStatus;
    }

    if (category && category !== "All Categories") {
      filter.categoryName = category;
    }

    if (availableOnly === "true") {
      filter.isAddedToProducts = { $ne: true };
    }

    const inventory = await Inventory.find(filter)
      .populate("category", "name")
      .populate("product", "title isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
      items: inventory,
      data: inventory,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get inventory items available to be added to Products catalog
// @route   GET /api/inventory/available
export const getAvailableInventory = asyncHandler(async (req, res) => {
  try {
    // Auto-heal any orphaned inventory items before retrieving available items
    await syncOrphanedInventoryItems();

    // Return items that have not yet been added to store products
    const available = await Inventory.find({ isAddedToProducts: { $ne: true } })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: available.length,
      available,
      inventory: available,
      items: available,
      data: available,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new item in inventory ("Add Product to Inventory" step)
// @route   POST /api/inventory
export const createInventoryItem = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      name,
      sku,
      brand,
      vendor,
      category,
      categoryName,
      subCategory,
      warehouse,
      currentStock,
      stock,
      reorderPoint,
      maxCapacity,
      maxStock,
      price,
      paidAmount,
      deliveryCharge,
      description,
      specifications,
      images,
    } = req.body;

    const itemTitle = (title || name || "").trim();
    if (!itemTitle) {
      return res.status(400).json({ success: false, message: "Product title is required in inventory" });
    }

    // Auto-generate unique SKU if none provided
    const itemSku = (sku || `SKU-INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`).trim();

    // Check SKU collision
    const existing = await Inventory.findOne({ sku: itemSku });
    if (existing) {
      return res.status(400).json({ success: false, message: `SKU "${itemSku}" already exists in inventory` });
    }

    const stockQty = Number(currentStock ?? stock ?? 0);
    const reorder = Number(reorderPoint ?? 10);
    const max = Number(maxCapacity ?? maxStock ?? 100);

    // Resolve Category Name if only ID was passed
    let resolvedCategoryName = categoryName || "General";
    if (category && (!categoryName || categoryName === "General")) {
      const catObj = await Category.findById(category);
      if (catObj) resolvedCategoryName = catObj.name;
    }

    const newItem = await Inventory.create({
      title: itemTitle,
      sku: itemSku,
      brand: brand || vendor || "Generic",
      category: category || null,
      categoryName: resolvedCategoryName,
      subCategory: subCategory || "",
      warehouse: warehouse || "Central Hub - Mumbai",
      currentStock: stockQty,
      reorderPoint: reorder,
      maxCapacity: max,
      price: Number(price) || 0,
      paidAmount: Number(paidAmount) || 0,
      deliveryCharge: Number(deliveryCharge) || 0,
      description: description || "",
      specifications: Array.isArray(specifications) ? specifications : [],
      images: Array.isArray(images) ? images : [],
      status: calculateStatus(stockQty, reorder),
      isAddedToProducts: false,
      product: null,
      movements: [
        {
          type: "in",
          units: stockQty,
          reason: "Initial warehouse intake",
          by: "Admin User",
          date: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Product added to inventory successfully!",
      item: newItem,
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Adjust inventory stock level (In / Out)
// @route   PUT /api/inventory/:id/adjust
export const adjustStock = asyncHandler(async (req, res) => {
  try {
    const { type, units, reason, by } = req.body;
    const qty = Number(units) || 0;

    if (qty <= 0) {
      return res.status(400).json({ success: false, message: "Units must be greater than zero" });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    const newStock = type === "in" ? item.currentStock + qty : Math.max(0, item.currentStock - qty);
    item.currentStock = newStock;
    item.status = calculateStatus(newStock, item.reorderPoint);

    item.movements.unshift({
      type,
      units: qty,
      reason: reason || "Manual stock adjustment",
      by: by || "Admin User",
      date: new Date(),
    });

    await item.save();

    // If this inventory item is linked to a live store Product, sync the product variant stock as well
    const productFilter = item.product
      ? { $or: [{ _id: item.product }, { inventory: item._id }, { "variants.sku": item.sku }] }
      : { $or: [{ inventory: item._id }, { "variants.sku": item.sku }] };

    await Product.updateMany(
      productFilter,
      { $set: { "variants.0.currentStock": newStock } }
    );

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
export const getInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate("category", "name")
      .populate("product", "title isActive");
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update inventory item details
// @route   PUT /api/inventory/:id
export const updateInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    const allowed = [
      "title", "brand", "warehouse", "category", "categoryName", "subCategory",
      "price", "paidAmount", "deliveryCharge", "description", "specifications",
      "images", "reorderPoint", "maxCapacity"
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.body.isAddedToProducts !== undefined) {
      item.isAddedToProducts = Boolean(req.body.isAddedToProducts);
      if (!item.isAddedToProducts) {
        item.product = null;
      }
    }

    if (req.body.currentStock !== undefined) {
      item.currentStock = Number(req.body.currentStock);
      item.status = calculateStatus(item.currentStock, item.reorderPoint);
    }

    await item.save();

    // Also sync linked product if exists
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.brand) updates.brand = req.body.brand;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.price !== undefined) updates["variants.0.sellingPrice"] = Number(req.body.price);
    if (req.body.currentStock !== undefined) updates["variants.0.currentStock"] = Number(req.body.currentStock);

    if (Object.keys(updates).length > 0) {
      const productFilter = item.product
        ? { $or: [{ _id: item.product }, { inventory: item._id }, { "variants.sku": item.sku }] }
        : { $or: [{ inventory: item._id }, { "variants.sku": item.sku }] };
      await Product.updateMany(productFilter, { $set: updates });
    }

    res.status(200).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Reset/unlink product status for an inventory item
// @route   POST /api/inventory/:id/reset-status
export const resetInventoryProductStatus = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    // Delete the associated product from the catalog
    if (item.product) {
      await Product.findByIdAndDelete(item.product);
    } else {
      // Fallback: delete product linked to this inventory item
      await Product.deleteMany({ inventory: item._id });
    }

    item.isAddedToProducts = false;
    item.product = null;
    await item.save();

    res.status(200).json({
      success: true,
      message: "Inventory item product status reset successfully. It can now be added to catalog.",
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
export const deleteInventoryItem = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    res.status(200).json({ success: true, message: "Inventory item removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
