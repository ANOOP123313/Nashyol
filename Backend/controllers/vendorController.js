import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Helper to compute live sales from orders and product count
const enrichVendorsWithSalesAndProducts = async (vendors) => {
  const orders = await Order.find({ orderStatus: { $ne: "cancelled" } }).select("items").lean();
  const salesMap = {};
  for (const order of orders) {
    for (const item of (order.items || [])) {
      if (item.vendorId) {
        const vId = item.vendorId.toString();
        if (!salesMap[vId]) salesMap[vId] = { sales: 0, count: 0 };
        salesMap[vId].sales += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        salesMap[vId].count += (Number(item.quantity) || 1);
      }
    }
  }

  // Create lookup maps for vendor ID, storeName, ownerName
  const vendorNameMap = {};
  for (const v of vendors) {
    const vObj = v.toObject ? v.toObject() : { ...v };
    const idStr = vObj._id ? vObj._id.toString() : "";
    if (idStr) {
      if (vObj.storeName) vendorNameMap[vObj.storeName.toLowerCase()] = idStr;
      if (vObj.name) vendorNameMap[vObj.name.toLowerCase()] = idStr;
      if (vObj.owner?.name) vendorNameMap[vObj.owner.name.toLowerCase()] = idStr;
      if (vObj.ownerName) vendorNameMap[vObj.ownerName.toLowerCase()] = idStr;
    }
  }

  const products = await Product.find().select("variants vendor brand").lean();
  const productCountMap = {};
  for (const p of products) {
    const vIds = new Set();
    if (p.vendor) {
      const pVendStr = p.vendor.toString().toLowerCase();
      if (vendorNameMap[pVendStr]) vIds.add(vendorNameMap[pVendStr]);
      else vIds.add(p.vendor.toString());
    }
    if (p.brand) {
      const pBrandStr = p.brand.toString().toLowerCase();
      if (vendorNameMap[pBrandStr]) vIds.add(vendorNameMap[pBrandStr]);
    }
    for (const v of (p.variants || [])) {
      if (v.currentVendor) vIds.add(v.currentVendor.toString());
    }
    for (const vId of vIds) {
      productCountMap[vId] = (productCountMap[vId] || 0) + 1;
    }
  }

  return vendors.map((v) => {
    const vObj = v.toObject ? v.toObject() : { ...v };
    const vId = vObj._id.toString();
    const computedSales = salesMap[vId]?.sales || vObj.totalSales || vObj.totalRevenue || 0;
    const computedProducts = productCountMap[vId] || vObj.productsCount || vObj.productCount || 0;
    return {
      ...vObj,
      totalSales: computedSales,
      totalRevenue: computedSales,
      productCount: computedProducts,
      productsCount: computedProducts,
      salesCount: salesMap[vId]?.count || 0,
    };
  });
};

// ─────────────────────────────────────────
//  VENDOR SELF-SERVICE
// ─────────────────────────────────────────

/**
 * POST /api/vendors/register
 * Create a vendor profile for the logged-in user.
 */
export const registerVendor = async (req, res) => {
  try {
    const existing = await Vendor.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "Vendor profile already exists." });
    }

    const { storeName, description, phone, email, address } = req.body;

    const vendor = await Vendor.create({
      owner: req.user._id,
      storeName,
      description,
      phone,
      email,
      address,
    });

    res.status(201).json({ message: "Vendor registered successfully.", vendor });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * GET /api/vendors/my-profile
 * Get the logged-in vendor's own profile.
 */
export const getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id }).populate(
      "owner",
      "name email"
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found." });
    }

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * PUT /api/vendors/my-profile
 * Update the logged-in vendor's own profile.
 */
export const updateMyVendorProfile = async (req, res) => {
  try {
    const allowedFields = ["storeName", "description", "phone", "email", "address"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const vendor = await Vendor.findOneAndUpdate(
      { owner: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found." });
    }

    res.status(200).json({ message: "Profile updated.", vendor });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ─────────────────────────────────────────
//  PUBLIC
// ─────────────────────────────────────────

/**
 * GET /api/vendors
 * List all vendors. If admin query or general list, return vendors.
 */
export const getAllApprovedVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { approvalStatus: status } : {};
    const vendors = await Vendor.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const enriched = await enrichVendorsWithSalesAndProducts(vendors);
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * GET /api/vendors/dropdown
 * Return a lightweight vendor list for admin dropdown UIs.
 * Example response: [{ _id, storeName, email, phone, approvalStatus }]
 */
export const getVendorDropdown = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { approvalStatus: status } : { approvalStatus: "approved" };

    const vendors = await Vendor.find(filter)
      .select("_id storeName email phone approvalStatus")
      .sort({ storeName: 1 });

    res.status(200).json({
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * POST /api/vendor
 * Admin create vendor directly.
 */
export const adminCreateVendor = async (req, res) => {
  try {
    const { storeName, description, phone, email, address, ownerName } = req.body;

    let owner = null;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (normalizedEmail) {
      let existingUser = await User.findOne({ email: normalizedEmail });

      if (!existingUser) {
        existingUser = await User.create({
          name: ownerName || storeName || "Vendor Manager",
          email: normalizedEmail,
          role: "vendor",
          password: "Vendor@123",
          isVerified: true,
        });
      }

      owner = existingUser._id;
    }

    const vendor = await Vendor.create({
      owner,
      storeName: storeName || "New Vendor",
      description: description || "",
      phone: phone || "",
      email: normalizedEmail,
      address: address || "",
      approvalStatus: "approved",
    });

    res.status(201).json({ message: "Vendor created successfully.", vendor });
  } catch (error) {
    console.error("Admin create vendor error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * GET /api/vendors/:id
 * Get a single approved vendor by ID (public).
 */
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("owner", "name email");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const [enriched] = await enrichVendorsWithSalesAndProducts([vendor]);
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ─────────────────────────────────────────
//  ADMIN ONLY
// ─────────────────────────────────────────

/**
 * GET /api/vendors/admin/all
 * Get all vendors with any approval status (admin only).
 */
export const adminGetAllVendors = async (req, res) => {
  try {
    const { status } = req.query; // optional filter: ?status=pending
    const filter = status ? { approvalStatus: status } : {};

    const vendors = await Vendor.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const enriched = await enrichVendorsWithSalesAndProducts(vendors);
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * PATCH /api/vendors/admin/:id/approval
 * Approve or reject a vendor (admin only).
 * Body: { status: "approved" | "rejected" } or { approvalStatus: "approved" | ... }
 */
export const adminUpdateApprovalStatus = async (req, res) => {
  try {
    const rawStatus = req.body.status || req.body.approvalStatus;
    let status = (rawStatus || "").toLowerCase();

    // Map common aliases
    if (status === "verified" || status === "active") status = "approved";
    if (status === "unverified") status = "pending";
    if (status === "suspended") status = "rejected";

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value: " + rawStatus });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    res.status(200).json({ message: `Vendor ${status}.`, vendor });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * DELETE /api/vendors/admin/:id
 * Delete a vendor profile (admin only).
 */
export const adminDeleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    res.status(200).json({ message: "Vendor deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/**
 * PATCH /api/vendors/admin/:id/revenue
 * Manually update totalRevenue for a vendor (admin only).
 * Body: { amount: Number }
 */
export const adminUpdateRevenue = async (req, res) => {
  try {
    const { amount } = req.body;

    if (typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number." });
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalRevenue: amount } },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    res.status(200).json({ message: "Revenue updated.", vendor });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};



