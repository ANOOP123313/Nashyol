import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { inventoryAPI, categoriesAPI, vendorsAPI, warehousesAPI, uploadAPI } from "../services/api";
import { downloadCSV } from "../utils/exportCSV";

import {
  Search, Download, Upload, Plus, Eye, SlidersHorizontal, Pencil,
  Package, AlertTriangle, TrendingDown, BarChart3, X,
  ChevronDown, Check, ArrowDownCircle, ArrowUpCircle, Calendar, RefreshCw, Trash2
} from "lucide-react";

const initialData = [];

const statusOptions = ["All Status", "In Stock", "Low Stock", "Out of Stock", "Overstocked"];
const warehouseOptions = ["All Warehouses", "Main Warehouse - NY", "West Warehouse - LA", "East Warehouse - Miami"];
const adjustReasonsIn = ["Supplier shipment", "Return from customer", "Transfer from another warehouse", "Manual correction"];
const adjustReasonsOut = ["Customer orders", "Damaged goods", "Transfer to another warehouse", "Manual correction"];

/* ─── STATUS BADGE ─── */
function StatusBadge({ status }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 12px", borderRadius: 999, fontSize: 13,
    fontWeight: 700, whiteSpace: "nowrap"
  };
  if (status === "in_stock") return (
    <span style={{ ...base, background: "#22c55e", color: "#fff" }}>
      <svg width="11" height="11" fill="none" viewBox="0 0 12 12">
        <path d="M2 7L5 10L10 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      In Stock
    </span>
  );
  if (status === "low_stock") return (
    <span style={{ ...base, background: "#f97316", color: "#fff" }}>
      <AlertTriangle size={11} color="#fff" />
      Low Stock
    </span>
  );
  return (
    <span style={{ ...base, background: "#ef4444", color: "#fff" }}>
      <TrendingDown size={12} color="#fff" />
      Out Of Stock
    </span>
  );
}



/* ─── CUSTOM DROPDOWN ─── */
function CustomDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8,
        border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 14px",
        fontSize: 14, color: "#374151", background: "#fff", cursor: "pointer",
        whiteSpace: "nowrap", minWidth: 150
      }}>
        <span style={{ flex: 1, textAlign: "left" }}>{value}</span>
        <ChevronDown size={13} color="#6b7280" />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", left: 0,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 1000, minWidth: 220, overflow: "hidden"
        }}>
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 16px", fontSize: 14,
                color: opt === value ? "#f97316" : "#374151",
                background: opt === value ? "#fff7ed" : "#fff",
                cursor: "pointer", fontWeight: opt === value ? 600 : 400
              }}
              onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = "#fff"; }}>
              {opt}
              {opt === value && <Check size={13} color="#f97316" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ADD PRODUCT MODAL ─── */
function AddProductModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "",
    subCategory: "",
    warehouse: "",
    price: "",
    stock: "0",
    status: "Out of Stock",
    paidAmount: "0.00",
    deliveryCharge: "0.00",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);

  const [categoriesData, setCategoriesData] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [warehouseOptionsList, setWarehouseOptionsList] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. Fetch Categories
    setCategoriesLoading(true);
    categoriesAPI.getAll()
      .then((res) => {
        const cats = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setCategoriesData(cats);
      })
      .catch((err) => console.error("Categories fetch error:", err))
      .finally(() => setCategoriesLoading(false));

    // 2. Fetch Vendors
    setVendorLoading(true);
    vendorsAPI.getAll()
      .then((res) => {
        const vendors = Array.isArray(res) ? res : (Array.isArray(res?.vendors) ? res.vendors : []);
        const mapped = vendors
          .map((v) => ({
            id: v._id || v.id,
            name: v.storeName || v.name || "Vendor",
          }))
          .filter((v) => v.name && v.name.trim());
        setVendorOptions(mapped);
      })
      .catch((err) => console.error("Vendors fetch error:", err))
      .finally(() => setVendorLoading(false));

    // 3. Fetch Warehouses
    setWarehouseLoading(true);
    warehousesAPI.getAll()
      .then((res) => {
        const whs = Array.isArray(res) ? res : (Array.isArray(res?.warehouses) ? res.warehouses : []);
        setWarehouseOptionsList(whs);
        if (whs.length > 0) {
          setForm(p => ({ ...p, warehouse: p.warehouse || whs[0].name }));
        }
      })
      .catch((err) => console.error("Warehouses fetch error:", err))
      .finally(() => setWarehouseLoading(false));
  }, []);

  // Find category object matching current form.category
  const selectedCatObj = categoriesData.find(
    c => c.name?.toLowerCase() === form.category?.toLowerCase() || c._id === form.category
  );
  const availableSubcategories = selectedCatObj?.subCategories || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === "stock") {
        const num = Number(value);
        if (num > 0 && p.status === "Out of Stock") {
          updated.status = "In Stock";
        } else if (num === 0 && p.status === "In Stock") {
          updated.status = "Out of Stock";
        }
      }
      return updated;
    });
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const catObj = categoriesData.find(
      c => c.name?.toLowerCase() === newCat?.toLowerCase() || c._id === newCat
    );
    const hasCurrentSub = catObj?.subCategories?.some(
      sc => sc.name?.toLowerCase() === form.subCategory?.toLowerCase()
    );
    setForm(p => ({
      ...p,
      category: newCat,
      subCategory: hasCurrentSub ? p.subCategory : "",
    }));
  };

  const handleSpecChange = (index, field, val) => {
    setSpecifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { key: "", value: "" }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [{ key: "", value: "" }];
    });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const f of files) {
        const res = await uploadAPI.uploadImage(f);
        if (res?.url) uploadedUrls.push(res.url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      toast.success("Images uploaded successfully");
    } catch (err) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.category.trim()) {
      toast.error("Please select a parent category");
      return;
    }

    const cleanSpecs = specifications
      .map(s => ({ key: (s.key || "").trim(), value: (s.value || "").trim() }))
      .filter(s => s.key || s.value);

    const payload = {
      title: form.title,
      name: form.title,
      brand: form.brand || "Generic",
      vendor: form.brand || "Generic",
      category: selectedCatObj?._id || form.category,
      categoryName: selectedCatObj?.name || form.category,
      subCategory: form.subCategory || "",
      warehouse: form.warehouse || (warehouseOptionsList[0]?.name || "Central Hub - Mumbai"),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      currentStock: Number(form.stock) || 0,
      paidAmount: Number(form.paidAmount) || 0,
      deliveryCharge: Number(form.deliveryCharge) || 0,
      description: form.description,
      status: form.status,
      isActive: form.status !== "Out of Stock",
      images: images.length > 0 ? images : ["https://placehold.co/300x300?text=No+Image"],
      specifications: cleanSpecs,
    };

    setSubmitting(true);
    try {
      await onAdd(payload);
      onClose();
    } catch (err) {
      // error handled by caller
    } finally {
      setSubmitting(false);
    }
  };

  const iS = {
    width: "100%",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    color: "#374151",
    boxSizing: "border-box"
  };
  const lS = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 680, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #e5e7eb" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Add New Product</h2>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, color: "#9ca3af" }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          
          {/* Row 1: Product Name & Brand/Vendor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter product name"
                style={iS}
              />
            </div>
            <div>
              <label style={lS}>Brand / Vendor <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                list="inventory-vendor-list"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder={vendorLoading ? "Loading vendors..." : "Type vendor name"}
                style={iS}
              />
              <datalist id="inventory-vendor-list">
                {vendorOptions.map((v) => (
                  <option key={v.id || v.name} value={v.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Parent Category & Subcategory */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Parent Category <span style={{ color: "#ef4444" }}>*</span></label>
              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                style={{ ...iS, cursor: "pointer" }}
              >
                <option value="">{categoriesLoading ? "Loading categories..." : "-- Select Category --"}</option>
                {categoriesData.map(cat => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lS}>Subcategory</label>
              <select
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                disabled={!form.category || availableSubcategories.length === 0}
                style={{
                  ...iS,
                  cursor: (!form.category || availableSubcategories.length === 0) ? "not-allowed" : "pointer",
                  background: (!form.category || availableSubcategories.length === 0) ? "#f9fafb" : "#fff",
                  color: (!form.category || availableSubcategories.length === 0) ? "#9ca3af" : "#374151",
                }}
              >
                {!form.category ? (
                  <option value="">Select parent category first</option>
                ) : availableSubcategories.length === 0 ? (
                  <option value="">No subcategories available</option>
                ) : (
                  <>
                    <option value="">-- Select Subcategory --</option>
                    {availableSubcategories.map(sc => (
                      <option key={sc._id || sc.name} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Row 3: Warehouse & Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Warehouse <span style={{ color: "#ef4444" }}>*</span></label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                style={{ ...iS, cursor: "pointer" }}
              >
                <option value="">{warehouseLoading ? "Loading warehouses..." : "-- Select Warehouse --"}</option>
                {warehouseOptionsList.map(w => (
                  <option key={w._id || w.code} value={w.name}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lS}>Price (AED) <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                style={iS}
              />
            </div>
          </div>

          {/* Row 4: Stock Quantity & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Stock Quantity</label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                placeholder="0"
                style={iS}
              />
            </div>
            <div>
              <label style={lS}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ ...iS, cursor: "pointer" }}
              >
                <option value="Out of Stock">Out of Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Row 5: Paid Amount & Cash on Delivery Charge */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Paid Amount (AED)</label>
              <input
                name="paidAmount"
                value={form.paidAmount}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                style={iS}
              />
            </div>
            <div>
              <label style={lS}>Cash on Delivery Charge (AED)</label>
              <input
                name="deliveryCharge"
                value={form.deliveryCharge}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                style={iS}
              />
            </div>
          </div>
          <p style={{ margin: "-10px 0 16px", fontSize: 11, color: "#6b7280" }}>
            Applied per unit only when the customer selects Cash on Delivery.
          </p>

          {/* Row 6: Description */}
          <div style={{ marginBottom: 18 }}>
            <label style={lS}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ ...iS, resize: "none" }}
            />
          </div>

          {/* Row 7: Product Specifications */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ ...lS, margin: 0, fontWeight: 600 }}>Product Specifications</label>
              <button
                type="button"
                onClick={addSpecification}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#f97316",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                <Plus size={13} /> Add Specification
              </button>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 11, color: "#6b7280" }}>
              Add technical specs or features displayed on the product page (e.g. "Color": "Black", "Material": "Leather").
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {specifications.map((spec, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Name / Key (e.g. Storage)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    style={iS}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 256GB SSD)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    style={iS}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(idx)}
                    title="Remove specification"
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Row 8: Product Images */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ ...lS, fontWeight: 600, marginBottom: 8 }}>Product Images</p>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: uploadingImage ? "not-allowed" : "pointer", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#374151" }}>
                <Upload size={14} /> {uploadingImage ? "Uploading..." : "Upload Images"}
              </div>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>
                {images.length > 0 ? `${images.length} image(s) uploaded` : "No images uploaded"}
              </span>
              <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFiles} disabled={uploadingImage} />
            </label>
            {images.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {images.map((url, idx) => (
                  <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <img src={url} alt={`img-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 28px", borderTop: "1px solid #e5e7eb", background: "#fafafa" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "10px 24px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploadingImage}
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: (submitting || uploadingImage) ? "#fdba74" : "#f97316",
              cursor: (submitting || uploadingImage) ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── EDIT PRODUCT MODAL ─── */
function EditProductModal({ item, onClose, onUpdate }) {
  const [form, setForm] = useState({
    title: item.name || item.title || "",
    brand: item.vendor || item.brand || "",
    category: item.category || "",
    subCategory: item.subCategory || "",
    warehouse: item.warehouse || "",
    price: item.price ?? "",
    stock: item.currentStock ?? item.stock ?? "0",
    status: item.status === "in_stock" ? "In Stock" : item.status === "low_stock" ? "Low Stock" : item.status === "out_of_stock" ? "Out of Stock" : (item.status || "In Stock"),
    paidAmount: item.paidAmount ?? "0.00",
    deliveryCharge: item.deliveryCharge ?? "0.00",
    description: item.description || "",
    reorderPoint: item.reorderPoint ?? 10,
    maxCapacity: item.maxCapacity ?? 100,
  });

  const [images, setImages] = useState(item.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [specifications, setSpecifications] = useState(
    Array.isArray(item.specifications) && item.specifications.length > 0
      ? item.specifications
      : [{ key: "", value: "" }]
  );

  const [categoriesData, setCategoriesData] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [warehouseOptionsList, setWarehouseOptionsList] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCategoriesLoading(true);
    categoriesAPI.getAll()
      .then((res) => {
        const cats = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setCategoriesData(cats);
      })
      .catch((err) => console.error("Categories fetch error:", err))
      .finally(() => setCategoriesLoading(false));

    setVendorLoading(true);
    vendorsAPI.getAll()
      .then((res) => {
        const vendors = Array.isArray(res) ? res : (Array.isArray(res?.vendors) ? res.vendors : []);
        const mapped = vendors
          .map((v) => ({
            id: v._id || v.id,
            name: v.storeName || v.name || "Vendor",
          }))
          .filter((v) => v.name && v.name.trim());
        setVendorOptions(mapped);
      })
      .catch((err) => console.error("Vendors fetch error:", err))
      .finally(() => setVendorLoading(false));

    setWarehouseLoading(true);
    warehousesAPI.getAll()
      .then((res) => {
        const whs = Array.isArray(res) ? res : (Array.isArray(res?.warehouses) ? res.warehouses : []);
        setWarehouseOptionsList(whs);
      })
      .catch((err) => console.error("Warehouses fetch error:", err))
      .finally(() => setWarehouseLoading(false));
  }, []);

  const selectedCatObj = categoriesData.find(
    c => c.name?.toLowerCase() === form.category?.toLowerCase() || c._id === form.category
  );
  const availableSubcategories = selectedCatObj?.subCategories || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === "stock") {
        const num = Number(value);
        if (num > 0 && p.status === "Out of Stock") {
          updated.status = "In Stock";
        } else if (num === 0 && p.status === "In Stock") {
          updated.status = "Out of Stock";
        }
      }
      return updated;
    });
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const catObj = categoriesData.find(
      c => c.name?.toLowerCase() === newCat?.toLowerCase() || c._id === newCat
    );
    const hasCurrentSub = catObj?.subCategories?.some(
      sc => sc.name?.toLowerCase() === form.subCategory?.toLowerCase()
    );
    setForm(p => ({
      ...p,
      category: newCat,
      subCategory: hasCurrentSub ? p.subCategory : "",
    }));
  };

  const handleSpecChange = (index, field, val) => {
    setSpecifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { key: "", value: "" }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [{ key: "", value: "" }];
    });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const f of files) {
        const res = await uploadAPI.uploadImage(f);
        if (res?.url) uploadedUrls.push(res.url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
      toast.success("Images uploaded successfully");
    } catch (err) {
      toast.error("Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Product name is required");
      return;
    }

    const cleanSpecs = specifications
      .map(s => ({ key: (s.key || "").trim(), value: (s.value || "").trim() }))
      .filter(s => s.key || s.value);

    const payload = {
      title: form.title,
      name: form.title,
      brand: form.brand || "Generic",
      vendor: form.brand || "Generic",
      category: selectedCatObj?._id || form.category,
      categoryName: selectedCatObj?.name || form.category,
      subCategory: form.subCategory || "",
      warehouse: form.warehouse || (warehouseOptionsList[0]?.name || "Central Hub - Mumbai"),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      currentStock: Number(form.stock) || 0,
      reorderPoint: Number(form.reorderPoint) || 10,
      maxCapacity: Number(form.maxCapacity) || 100,
      paidAmount: Number(form.paidAmount) || 0,
      deliveryCharge: Number(form.deliveryCharge) || 0,
      description: form.description,
      status: form.status,
      specifications: cleanSpecs,
      images,
    };

    setSubmitting(true);
    try {
      await onUpdate(item.id, payload);
      onClose();
    } catch (err) {
      // error handled by caller
    } finally {
      setSubmitting(false);
    }
  };

  const iS = {
    width: "100%",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    color: "#374151",
    boxSizing: "border-box"
  };
  const lS = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 680, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid #e5e7eb" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Edit Inventory Product</h2>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>SKU: {item.sku}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4, color: "#9ca3af" }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
          
          {/* Row 1: Product Name & Brand/Vendor */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Product Name <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter product name"
                style={iS}
              />
            </div>
            <div>
              <label style={lS}>Brand / Vendor <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                list="edit-inventory-vendor-list"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder={vendorLoading ? "Loading vendors..." : "Type vendor name"}
                style={iS}
              />
              <datalist id="edit-inventory-vendor-list">
                {vendorOptions.map((v) => (
                  <option key={v.id || v.name} value={v.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Parent Category & Subcategory */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Parent Category <span style={{ color: "#ef4444" }}>*</span></label>
              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                style={{ ...iS, cursor: "pointer" }}
              >
                <option value="">{categoriesLoading ? "Loading categories..." : "-- Select Category --"}</option>
                {categoriesData.map(cat => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lS}>Subcategory</label>
              <select
                name="subCategory"
                value={form.subCategory}
                onChange={handleChange}
                disabled={!form.category || availableSubcategories.length === 0}
                style={{
                  ...iS,
                  cursor: (!form.category || availableSubcategories.length === 0) ? "not-allowed" : "pointer",
                  background: (!form.category || availableSubcategories.length === 0) ? "#f9fafb" : "#fff",
                  color: (!form.category || availableSubcategories.length === 0) ? "#9ca3af" : "#374151",
                }}
              >
                {!form.category ? (
                  <option value="">Select parent category first</option>
                ) : availableSubcategories.length === 0 ? (
                  <option value="">No subcategories available</option>
                ) : (
                  <>
                    <option value="">-- Select Subcategory --</option>
                    {availableSubcategories.map(sc => (
                      <option key={sc._id || sc.name} value={sc.name}>
                        {sc.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Row 3: Warehouse & Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Warehouse <span style={{ color: "#ef4444" }}>*</span></label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={handleChange}
                style={{ ...iS, cursor: "pointer" }}
              >
                <option value="">{warehouseLoading ? "Loading warehouses..." : "-- Select Warehouse --"}</option>
                {warehouseOptionsList.map(w => (
                  <option key={w._id || w.code} value={w.name}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lS}>Price (AED) <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                style={iS}
              />
            </div>
          </div>

          {/* Row 4: Stock Quantity & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Stock Quantity</label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                placeholder="0"
                style={iS}
              />
            </div>
            <div>
              <label style={lS}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ ...iS, cursor: "pointer" }}
              >
                <option value="Out of Stock">Out of Stock</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Row 5: Paid Amount & Cash on Delivery Charge */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={lS}>Paid Amount (AED)</label>
              <input
                name="paidAmount"
                value={form.paidAmount}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                style={iS}
              />
            </div>
            <div>
              <label style={lS}>Cash on Delivery Charge (AED)</label>
              <input
                name="deliveryCharge"
                value={form.deliveryCharge}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                style={iS}
              />
            </div>
          </div>

          {/* Row 6: Description */}
          <div style={{ marginBottom: 18 }}>
            <label style={lS}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              style={{ ...iS, resize: "none" }}
            />
          </div>

          {/* Row 7: Product Specifications */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ ...lS, margin: 0, fontWeight: 600 }}>Product Specifications</label>
              <button
                type="button"
                onClick={addSpecification}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#f97316",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: 6,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                <Plus size={13} /> Add Specification
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {specifications.map((spec, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Name / Key (e.g. Storage)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    style={iS}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 256GB SSD)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    style={iS}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(idx)}
                    title="Remove specification"
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #fecaca",
                      background: "#fef2f2",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Row 8: Product Images */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ ...lS, fontWeight: 600, marginBottom: 8 }}>Product Images</p>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: uploadingImage ? "not-allowed" : "pointer", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#374151" }}>
                <Upload size={14} /> {uploadingImage ? "Uploading..." : "Upload Images"}
              </div>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>
                {images.length > 0 ? `${images.length} image(s) uploaded` : "No images uploaded"}
              </span>
              <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleFiles} disabled={uploadingImage} />
            </label>
            {images.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {images.map((url, idx) => (
                  <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <img src={url} alt={`img-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "16px 28px", borderTop: "1px solid #e5e7eb", background: "#fafafa" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "10px 24px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploadingImage}
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: (submitting || uploadingImage) ? "#fdba74" : "#f97316",
              cursor: (submitting || uploadingImage) ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DELETE CONFIRM MODAL ─── */
function DeleteConfirmModal({ item, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(item.id);
      onClose();
    } catch (err) {
      // error handled by parent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", width: 440, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 10, borderRadius: "50%", background: "#fef2f2", color: "#ef4444" }}>
            <Trash2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Delete Inventory Product</h3>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>SKU: {item.sku}</p>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.5, marginBottom: 24 }}>
          Are you sure you want to delete <strong>"{item.name}"</strong> from inventory? This action will remove it permanently.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{ padding: "9px 20px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{ padding: "9px 20px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", background: "#ef4444", cursor: deleting ? "not-allowed" : "pointer" }}
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── DETAILS MODAL ─── */
function DetailsModal({ item, onClose, onAdjust }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 560, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        {/* Header — scrolls with content */}
        <div style={{ background: "#fff", padding: "24px 24px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Inventory Details</h2>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>View detailed stock information and movement history</p>
            </div>
            <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}><X size={22} color="#6b7280" /></button>
          </div>
        </div>

        {/* White content card */}
        <div style={{ background: "#fff", margin: "0 16px", borderRadius: 14, padding: "20px 20px 8px" }}>
          {/* Product name + status */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{item.name}</span>
            <StatusBadge status={item.status} />
          </div>

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px", marginBottom: 20 }}>
            {[
              { label: "SKU:", value: item.sku },
              { label: "Category:", value: item.category },
              { label: "Vendor:", value: item.vendor },
              { label: "Warehouse:", value: item.warehouse },
              { label: "Unit Price:", value: `AED ${item.price.toFixed(2)}` },
              { label: "Total Value:", value: `AED ${(item.price * item.currentStock).toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 3px" }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Stock level cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Current Stock", val: item.currentStock, color: "#111827" },
              { label: "Reorder Point", val: item.reorderPoint, color: "#f97316" },
              { label: "Max Stock", val: item.maxCapacity, color: "#111827" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 8px" }}>{label}</p>
                <p style={{ fontSize: 34, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Movement History */}
        <div style={{ margin: "16px 16px 0" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Stock Movement History</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {item.movements.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}>
                <div style={{ flexShrink: 0 }}>
                  {m.type === "out"
                    ? <ArrowDownCircle size={28} color="#ef4444" strokeWidth={1.8} />
                    : <ArrowUpCircle size={28} color="#22c55e" strokeWidth={1.8} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{m.type === "out" ? `Stock Out: ${m.units} units` : `Stock In: ${m.units} units`}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0 0" }}>{m.reason}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{m.date}</p>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0 0" }}>{m.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "20px 16px 24px" }}>
          <button onClick={onClose} style={{ padding: "10px 28px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>Close</button>
          <button onClick={() => { onClose(); onAdjust(item); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 24px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", background: "#f97316", cursor: "pointer" }}>
            <SlidersHorizontal size={14} /> Adjust Stock
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─── ADJUST MODAL ─── */
function AdjustModal({ item, onClose, onConfirm }) {
  const [adjustType, setAdjustType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [hoveredReason, setHoveredReason] = useState(null);
  const reasonRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (reasonRef.current && !reasonRef.current.contains(e.target)) setReasonOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const qty = parseInt(quantity) || 0;
  const newStock = adjustType === "in" ? item.currentStock + qty : Math.max(0, item.currentStock - qty);
  const canSubmit = adjustType && quantity && reason && qty > 0;
  const currentReasons = adjustType === "in" ? adjustReasonsIn : adjustReasonsOut;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px", width: 520, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Adjust Stock Level</h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "5px 0 0" }}>Add or remove stock for {item.name}</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}><X size={22} color="#6b7280" /></button>
        </div>

        <div style={{ margin: "20px 0 22px" }}>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>Current Stock</p>
          <p style={{ fontSize: 34, fontWeight: 700, color: "#111827", margin: 0 }}>{item.currentStock} units</p>
        </div>

        {/* Adjustment Type */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 10px" }}>Adjustment Type <span style={{ color: "#ef4444" }}>*</span></p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button onClick={() => { setAdjustType("in"); setReason(""); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 14px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
                border: adjustType === "in" ? "none" : "1.5px solid #e5e7eb",
                background: adjustType === "in" ? "#22c55e" : "#fff",
                color: adjustType === "in" ? "#fff" : "#374151",
                transition: "all 0.15s"
              }}>
              <Plus size={15} /> Stock In
            </button>
            <button onClick={() => { setAdjustType("out"); setReason(""); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "12px 14px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
                border: adjustType === "out" ? "none" : "1.5px solid #e5e7eb",
                background: adjustType === "out" ? "#ef4444" : "#fff",
                color: adjustType === "out" ? "#fff" : "#374151",
                transition: "all 0.15s"
              }}>
              <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>−</span> Stock Out
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Quantity <span style={{ color: "#ef4444" }}>*</span></p>
          <input
            type="number" placeholder="Enter quantity" value={quantity}
            onChange={e => setQuantity(e.target.value)}
            style={{
              width: "100%", border: quantity ? "1.5px solid #f97316" : "1.5px solid #e5e7eb",
              borderRadius: 8, padding: "11px 12px", fontSize: 15, outline: "none",
              boxSizing: "border-box", color: "#111827", transition: "border-color 0.15s"
            }}
          />
        </div>

        {/* Reason */}
        <div style={{ marginBottom: qty > 0 ? 16 : 26 }} ref={reasonRef}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 8px" }}>Reason <span style={{ color: "#ef4444" }}>*</span></p>
          <div style={{ position: "relative" }}>
            <button onClick={() => setReasonOpen(!reasonOpen)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "11px 12px",
                fontSize: 15, color: reason ? "#111827" : "#9ca3af", background: "#fff",
                cursor: "pointer", textAlign: "left"
              }}>
              {reason || "Select reason"}
              <ChevronDown size={14} color="#6b7280" />
            </button>
            {reasonOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden"
              }}>
                {currentReasons.map(r => (
                  <div key={r} onClick={() => { setReason(r); setReasonOpen(false); }}
                    style={{
                      padding: "11px 16px", fontSize: 14,
                      color: r === reason ? "#f97316" : hoveredReason === r ? "#111827" : "#374151",
                      background: r === reason ? "#fff7ed" : hoveredReason === r ? "#f9fafb" : "#fff",
                      cursor: "pointer", fontWeight: r === reason ? 600 : 400,
                      transition: "background 0.1s"
                    }}
                    onMouseEnter={() => setHoveredReason(r)}
                    onMouseLeave={() => setHoveredReason(null)}>
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Stock Level Preview */}
        {qty > 0 && (
          <div style={{ marginBottom: 24, background: "#fff7ed", borderRadius: 10, padding: "14px 18px" }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>New Stock Level</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>{newStock} units</p>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "10px 24px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>Cancel</button>
          <button
            onClick={() => { if (canSubmit) { onConfirm(item.id, adjustType, qty, reason); onClose(); } }}
            style={{
              padding: "10px 24px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: "#fff", background: "#f97316", cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.5
            }}
            disabled={!canSubmit}>
            Confirm Adjustment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function InventoryManagement() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
  const [warehouseListOptions, setWarehouseListOptions] = useState(warehouseOptions);
  const importInputRef = useRef(null);

  const fetchInventory = () => {
    inventoryAPI.getAll()
      .then((res) => {
        const items = Array.isArray(res) ? res : (res.inventory || res.items || res.data || res.available || []);
        if (Array.isArray(items)) {
          const mapped = items.map((item, i) => {
            const stock = item.currentStock ?? item.stock ?? 0;
            const reorder = item.reorderPoint ?? 10;
            const status = stock === 0 ? "out_of_stock" : stock <= reorder ? "low_stock" : "in_stock";
            return {
              id: item._id || i,
              name: item.title || item.name || "Product Item",
              status,
              sku: item.sku || `SKU-${i}`,
              category: typeof item.category === "object" ? (item.category?.name || "General") : (item.categoryName || item.category || "General"),
              vendor: item.brand || item.vendor || "",
              location: item.warehouse ? item.warehouse.slice(0, 15) : "Hub 1",
              warehouse: item.warehouse || "Central Hub - Mumbai",
              price: Number(item.price) || 0,
              currentStock: stock,
              reorderPoint: reorder,
              maxCapacity: item.maxCapacity || 100,
              lastRestocked: item.updatedAt ? new Date(item.updatedAt).toISOString().split("T")[0] : "",
              movements: (item.movements || []).map(m => ({
                type: m.type || "in",
                units: m.units || 0,
                reason: m.reason || "",
                date: m.date ? new Date(m.date).toISOString().split("T")[0] : "",
                by: m.by || "Admin User",
              })),
              isAddedToProducts: !!item.isAddedToProducts,
              product: item.product,
            };
          });
          setData(mapped);

          // Dynamically ensure warehouse filter options contain all warehouses present in inventory items
          const itemWHs = mapped.map(it => it.warehouse).filter(Boolean);
          if (itemWHs.length > 0) {
            setWarehouseListOptions(prev => Array.from(new Set(["All Warehouses", ...prev.filter(w => w !== "All Warehouses"), ...itemWHs])));
          }
        }
      })
      .catch((err) => console.error("Inventory fetch error:", err));
  };

  const handleResetStatus = async (item) => {
    try {
      await inventoryAPI.resetStatus(item.id);
      toast.success(`Reset status for "${item.name}". It is now ready for product catalog.`);
      fetchInventory();
    } catch (err) {
      toast.error("Failed to reset status: " + (err.message || "Error"));
    }
  };

  useEffect(() => {
    fetchInventory();
    warehousesAPI.getAll()
      .then((res) => {
        const whs = Array.isArray(res) ? res : res.warehouses || [];
        if (Array.isArray(whs) && whs.length > 0) {
          setWarehouseListOptions(prev => Array.from(new Set(["All Warehouses", ...whs.map(w => w.name), ...prev.filter(w => w !== "All Warehouses")])));
        }
      })
      .catch(() => {});
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const handleUpdate = async (id, payload) => {
    try {
      await inventoryAPI.update(id, payload);
      toast.success("Inventory product updated successfully");
      fetchInventory();
    } catch (err) {
      toast.error("Failed to update inventory product: " + (err.message || "Unknown error"));
      throw err;
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      await inventoryAPI.delete(id);
      toast.success("Inventory product deleted successfully");
      fetchInventory();
    } catch (err) {
      toast.error("Failed to delete inventory product: " + (err.message || "Unknown error"));
      throw err;
    }
  };

  const filtered = data.filter(item => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.vendor.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.warehouse.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "All Status" ||
      (statusFilter === "In Stock" && item.status === "in_stock") ||
      (statusFilter === "Low Stock" && item.status === "low_stock") ||
      (statusFilter === "Out of Stock" && item.status === "out_of_stock") ||
      (statusFilter === "Overstocked" && item.currentStock > item.maxCapacity * 0.9);

    const matchWH = warehouseFilter === "All Warehouses" || item.warehouse === warehouseFilter;
    return matchSearch && matchStatus && matchWH;
  });

  const exportInventory = () => {
    downloadCSV(
      `inventory-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Product ID", "Product", "SKU", "Category", "Vendor", "Warehouse", "Price", "Current Stock", "Reorder Point", "Status"],
      filtered.map((item) => [item.id, item.name, item.sku, item.category, item.vendor, item.warehouse, item.price, item.currentStock, item.reorderPoint, item.status])
    );
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) throw new Error("The CSV has no inventory rows");
      const parseRow = (line) => line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
      const headers = parseRow(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, ""));
      const skuIndex = headers.indexOf("sku");
      const stockIndex = headers.findIndex((header) => ["stock", "currentstock", "quantity"].includes(header));
      if (skuIndex < 0 || stockIndex < 0) throw new Error("CSV must include SKU and Stock columns");

      const updates = lines.slice(1).map(parseRow).map((row) => ({ sku: row[skuIndex], stock: Number(row[stockIndex]) })).filter((row) => row.sku && Number.isFinite(row.stock) && row.stock >= 0);
      const matched = updates.map((update) => ({ update, item: data.find((item) => item.sku === update.sku) })).filter(({ item }) => item);
      await Promise.all(matched.map(({ update, item }) => inventoryAPI.update(item.id, { currentStock: update.stock })));
      fetchInventory();
      toast.success(`Imported ${matched.length} inventory row${matched.length === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err.message || "Failed to import inventory");
    }
  };

  const handleAdd = async (payload) => {
    try {
      await inventoryAPI.create(payload);
      toast.success("Product added to inventory successfully! You can now select it in the Products section.");
      fetchInventory();
    } catch (err) {
      toast.error("Failed to add product to inventory: " + (err.message || "Unknown error"));
      throw err;
    }
  };

  const handleConfirmAdjust = async (id, type, qty, reason) => {
    const item = data.find(i => i.id === id);
    if (!item) return;
    try {
      await inventoryAPI.adjustStock(id, { type, units: qty, reason, by: "Admin User" });
      const newStock = type === "in" ? item.currentStock + qty : Math.max(0, item.currentStock - qty);
      const status = newStock === 0 ? "out_of_stock" : newStock <= item.reorderPoint ? "low_stock" : "in_stock";
      const movement = { type, units: qty, reason, date: new Date().toISOString().split("T")[0], by: "Admin User" };
      setData(prev => prev.map(it => {
        if (it.id !== id) return it;
        return { ...it, currentStock: newStock, status, movements: [movement, ...it.movements] };
      }));
      toast.success("Stock adjusted successfully");
      fetchInventory();
    } catch (err) {
      toast.error("Failed to adjust stock: " + err.message);
    }
  };

  const btnOutline = {
    display: "flex", alignItems: "center", gap: 6,
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 16px",
    fontSize: 14, color: "#374151", background: "#fff", cursor: "pointer",
    fontWeight: 500, whiteSpace: "nowrap"
  };
  const btnOrange = {
    display: "flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: 8, padding: "9px 16px",
    fontSize: 14, color: "#fff", background: "#f97316", cursor: "pointer",
    fontWeight: 600, whiteSpace: "nowrap"
  };

  const btnRowDetails = {
    display: "flex", alignItems: "center", gap: 6,
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 16px",
    fontSize: 13, color: "#111827", background: "#fff", cursor: "pointer",
    fontWeight: 600, whiteSpace: "nowrap"
  };
  const btnRowEdit = {
    display: "flex", alignItems: "center", gap: 6,
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 16px",
    fontSize: 13, color: "#111827", background: "#fff", cursor: "pointer",
    fontWeight: 600, whiteSpace: "nowrap"
  };
  const btnRowAdjust = {
    display: "flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: 8, padding: "7px 16px",
    fontSize: 13, color: "#fff", background: "#f97316", cursor: "pointer",
    fontWeight: 600, whiteSpace: "nowrap"
  };
  const btnRowDelete = {
    display: "flex", alignItems: "center", gap: 6,
    border: "1px solid #fecaca", borderRadius: 8, padding: "7px 16px",
    fontSize: 13, color: "#ef4444", background: "#fef2f2", cursor: "pointer",
    fontWeight: 600, whiteSpace: "nowrap"
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @media (max-width: 768px) {
          .inv-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .inv-row-meta { grid-template-columns: 1fr 1fr !important; }
          .inv-row-stock { grid-template-columns: 1fr 1fr 1fr !important; }
          .inv-toolbar { flex-wrap: wrap !important; }
          .inv-toolbar-search { min-width: 100% !important; }
          .inv-row-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .inv-row-buttons { width: 100%; justify-content: flex-end; }
          .modal-grid { grid-template-columns: 1fr !important; }
          .modal-details-grid { grid-template-columns: 1fr 1fr !important; }
          .adj-type-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .inv-stat-grid { grid-template-columns: 1fr !important; }
          .inv-row-stock { grid-template-columns: 1fr 1fr !important; }
          .modal-details-grid { grid-template-columns: 1fr !important; }
          .modal-stock-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: 15, background: "#f3f4f6", minHeight: "100vh", padding: "16px 28px 32px" }}>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, lineHeight: "36px" }}>Inventory</h1>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "5px 0 20px" }}>Manage stock levels and warehouse inventory</p>

        {/* STAT CARDS */}
        <div className="inv-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { title: "Total Products", value: data.length, icon: <Package size={22} />, iconColor: "#3b82f6" },
            { title: "Low Stock Alerts", value: data.filter(i => i.status === "low_stock").length, icon: <AlertTriangle size={22} />, iconColor: "#eab308", badge: "Needs Attention" },
            { title: "Out of Stock", value: data.filter(i => i.status === "out_of_stock").length, icon: <TrendingDown size={22} />, iconColor: "#ef4444" },
            { title: "Total Value", value: `$${Math.round(data.reduce((s, i) => s + i.price * i.currentStock, 0) / 1000)}k`, icon: <BarChart3 size={22} />, iconColor: "#f97316" },
          ].map(card => (
            <div key={card.title} style={{ position: "relative", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "22px 26px" }}>
              <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, margin: 0 }}>{card.title}</p>
              <p style={{ fontSize: 30, fontWeight: 700, color: "#111827", margin: "8px 0 0", lineHeight: 1 }}>{card.value}</p>
              {card.badge && <span style={{ display: "inline-block", marginTop: 10, padding: "3px 12px", background: "#f97316", color: "#fff", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{card.badge}</span>}
              <div style={{ position: "absolute", top: 18, right: 20, color: card.iconColor }}>{card.icon}</div>
            </div>
          ))}
        </div>

        {/* STOCK MANAGEMENT */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "visible" }}>
          <div style={{ padding: "22px 26px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Stock Management</p>
            <div className="inv-toolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div className="inv-toolbar-search" style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 13px", flex: 1, minWidth: 200, background: "#fff" }}>
                <Search size={15} color="#9ca3af" />
                <input style={{ border: "none", outline: "none", fontSize: 14, color: "#374151", background: "transparent", width: "100%" }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <CustomDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
              <CustomDropdown options={warehouseListOptions} value={warehouseFilter} onChange={setWarehouseFilter} />
              <button style={btnOutline} onClick={exportInventory}><Download size={15} />Export</button>
              <input ref={importInputRef} type="file" accept=".csv,text/csv" onChange={handleImportFile} style={{ display: "none" }} />
              <button style={btnOrange} onClick={() => importInputRef.current?.click()}><Upload size={15} />Import</button>
              <button style={btnOrange} onClick={() => setShowAdd(true)}><Plus size={15} />Add Product</button>
            </div>
          </div>

          <div style={{ borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
            {filtered.map((item, idx) => {
              const pct = item.maxCapacity > 0 ? Math.round((item.currentStock / item.maxCapacity) * 100) : 0;
              const barColor = item.status === "out_of_stock" ? "#ef4444" : item.status === "low_stock" ? "#f97316" : "#22c55e";
              return (
                <div key={item.id} style={{ padding: "22px 26px", borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>

                  <div className="inv-row-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{item.name}</span>
                      <StatusBadge status={item.status} />
                      {item.isAddedToProducts ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                            ✓ In Product Catalog
                          </span>
                          <button
                            type="button"
                            style={{ background: "#f9fafb", border: "1px solid #d1d5db", borderRadius: 999, padding: "2px 8px", fontSize: 11, color: "#4b5563", cursor: "pointer", fontWeight: 500 }}
                            title="Reset link so this product can be re-added to catalog"
                            onClick={() => handleResetStatus(item)}
                          >
                            Reset Link
                          </button>
                        </div>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                          Ready for Product Catalog
                        </span>
                      )}
                    </div>
                    <div className="inv-row-buttons" style={{ display: "flex", gap: 8 }}>
                      <button style={btnRowDetails} onClick={() => setDetailItem(item)}>
                        <Eye size={14} color="#111827" />Details
                      </button>
                      <button style={btnRowEdit} onClick={() => setEditItem(item)}>
                        <Pencil size={14} color="#111827" />Edit
                      </button>
                      <button style={btnRowAdjust} onClick={() => setAdjustItem(item)}>
                        <SlidersHorizontal size={14} />Adjust
                      </button>
                      <button style={btnRowDelete} onClick={() => setDeleteItem(item)}>
                        <Trash2 size={14} color="#ef4444" />Delete
                      </button>
                    </div>
                  </div>

                  <div className="inv-row-meta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "8px 20px", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 2px" }}>SKU:</p>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{item.sku}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 2px" }}>Category:</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>{item.category}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 2px" }}>Vendor:</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>{item.vendor}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 2px" }}>Location:</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>📍 {item.location}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 2px" }}>Price:</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>AED {item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="inv-row-stock" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 3px" }}>Current Stock:</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>{item.currentStock}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 3px" }}>Reorder Point:</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: "#f97316", margin: 0, lineHeight: 1 }}>{item.reorderPoint}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 3px" }}>Max Capacity:</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1 }}>{item.maxCapacity}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>Stock Level</span>
                      <span style={{ fontSize: 13, color: "#9ca3af" }}>{pct}%</span>
                    </div>
                    <div style={{ width: "100%", height: 7, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 999 }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af" }}>
                      <Calendar size={12} /> Last Restocked: {item.lastRestocked}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9ca3af" }}>
                      <RefreshCw size={12} /> {item.movements.length} movements
                    </span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 56, textAlign: "center", color: "#9ca3af", fontSize: 15 }}>No products found.</div>
            )}
          </div>
        </div>

        {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
        {editItem && <EditProductModal item={editItem} onClose={() => setEditItem(null)} onUpdate={handleUpdate} />}
        {deleteItem && <DeleteConfirmModal item={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleteInventory} />}
        {detailItem && <DetailsModal item={detailItem} onClose={() => setDetailItem(null)} onAdjust={(i) => { setDetailItem(null); setAdjustItem(i); }} />}
        {adjustItem && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} onConfirm={handleConfirmAdjust} />}
      </div>
    </>
  );
}