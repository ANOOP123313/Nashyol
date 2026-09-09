import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { productsAPI } from "../services/api";

import {
  Search, Download, Upload, Plus, Eye, SlidersHorizontal,
  Package, AlertTriangle, TrendingDown, BarChart3, X,
  ChevronDown, Check, ArrowDownCircle, ArrowUpCircle, Calendar, RefreshCw
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
  const [focused, setFocused] = useState(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "", vendor: "", warehouse: "", price: "", currentStock: "", reorderPoint: "", maxStock: "" });
  const fields = [
    { key: "name", label: "Product Name", placeholder: "Enter product name" },
    { key: "sku", label: "SKU", placeholder: "Enter SKU" },
    { key: "category", label: "Category", placeholder: "Enter category" },
    { key: "vendor", label: "Vendor", placeholder: "Enter vendor" },
    { key: "warehouse", label: "Warehouse", placeholder: "Enter warehouse" },
    { key: "price", label: "Price", placeholder: "Enter price" },
    { key: "currentStock", label: "Current Stock", placeholder: "Enter current stock" },
    { key: "reorderPoint", label: "Reorder Point", placeholder: "Enter reorder point" },
    { key: "maxStock", label: "Max Stock", placeholder: "Enter max stock" },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px", width: 600, maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: 0 }}>Add New Product</h2>
            <p style={{ fontSize: 15, color: "#6b7280", margin: "4px 0 0" }}>Enter product details to add to inventory</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}><X size={22} color="#6b7280" /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6, display: "block" }}>{label} <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                style={{ width: "100%", border: focused === key ? "2px solid #f97316" : "1.5px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#111827", outline: "none", background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s" }}
                placeholder={placeholder} value={form[key]}
                onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: "10px 26px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { onAdd(form); onClose(); }} style={{ padding: "10px 26px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#fff", background: "#f97316", cursor: "pointer" }}>Add Product</button>
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
              { label: "Unit Price:", value: `$${item.price.toFixed(2)}` },
              { label: "Total Value:", value: `$${(item.price * item.currentStock).toFixed(2)}` },
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

  useEffect(() => {
    productsAPI.getAll()
      .then((res) => {
        const prods = Array.isArray(res) ? res : res.products || [];
        if (Array.isArray(prods)) {
          const mapped = prods.map((p, i) => {
            const variant = p.variants?.[0] || {};
            const stock = variant.currentStock ?? 15;
            const status = stock === 0 ? "out_of_stock" : stock <= 10 ? "low_stock" : "in_stock";
            return {
              id: p._id || i,
              name: p.title || "Product Item",
              status,
              sku: variant.sku || `SKU-${i}`,
              category: p.category?.name || "Electronics",
              vendor: variant.currentVendor?.storeName || "TechSource Logistics",
              location: "NY",
              warehouse: "Main Warehouse - NY",
              price: variant.sellingPrice || 99,
              currentStock: stock,
              reorderPoint: 10,
              maxCapacity: 100,
              lastRestocked: new Date().toISOString().split("T")[0],
              movements: [],
            };
          });
          setData(mapped);
        }
      })
      .catch((err) => console.error("Inventory fetch error:", err));
  }, []);
  const [showAdd, setShowAdd] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);

  const filtered = data.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" ||
      (statusFilter === "In Stock" && item.status === "in_stock") ||
      (statusFilter === "Low Stock" && item.status === "low_stock") ||
      (statusFilter === "Out of Stock" && item.status === "out_of_stock") ||
      (statusFilter === "Overstocked" && item.currentStock > item.maxCapacity * 0.9);
    const matchWH = warehouseFilter === "All Warehouses" || item.warehouse === warehouseFilter;
    return matchSearch && matchStatus && matchWH;
  });

  const handleAdd = (form) => {
    const stock = parseInt(form.currentStock) || 0;
    const reorder = parseInt(form.reorderPoint) || 0;
    const max = parseInt(form.maxStock) || 100;
    const status = stock === 0 ? "out_of_stock" : stock <= reorder ? "low_stock" : "in_stock";
    const newItem = {
      id: data.length + 1, name: form.name, sku: form.sku, category: form.category,
      vendor: form.vendor, warehouse: form.warehouse,
      location: form.warehouse.includes("NY") ? "NY" : form.warehouse.includes("LA") ? "LA" : "Miami",
      price: parseFloat(form.price) || 0, currentStock: stock,
      reorderPoint: reorder, maxCapacity: max,
      status, lastRestocked: new Date().toISOString().split("T")[0], movements: []
    };
    setData(p => [...p, newItem]);
  };

  const handleConfirmAdjust = async (id, type, qty, reason) => {
    const item = data.find(i => i.id === id);
    if (!item) return;
    const newStock = type === "in" ? item.currentStock + qty : Math.max(0, item.currentStock - qty);
    try {
      await productsAPI.update(id, { stock: newStock });
      setData(prev => prev.map(item => {
        if (item.id !== id) return item;
        const status = newStock === 0 ? "out_of_stock" : newStock <= item.reorderPoint ? "low_stock" : "in_stock";
        const movement = { type, units: qty, reason, date: new Date().toISOString().split("T")[0], by: "Admin User" };
        return { ...item, currentStock: newStock, status, movements: [movement, ...item.movements] };
      }));
      toast.success("Stock adjusted successfully");
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
  const btnRowAdjust = {
    display: "flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: 8, padding: "7px 16px",
    fontSize: 13, color: "#fff", background: "#f97316", cursor: "pointer",
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
              <CustomDropdown options={warehouseOptions} value={warehouseFilter} onChange={setWarehouseFilter} />
              <button style={btnOutline}><Download size={15} />Export</button>
              <button style={btnOrange}><Upload size={15} />Import</button>
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
                    </div>
                    <div className="inv-row-buttons" style={{ display: "flex", gap: 8 }}>
                      <button style={btnRowDetails} onClick={() => setDetailItem(item)}>
                        <Eye size={14} color="#111827" />Details
                      </button>
                      <button style={btnRowAdjust} onClick={() => setAdjustItem(item)}>
                        <SlidersHorizontal size={14} />Adjust
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
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>${item.price.toFixed(2)}</p>
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
        {detailItem && <DetailsModal item={detailItem} onClose={() => setDetailItem(null)} onAdjust={(i) => { setDetailItem(null); setAdjustItem(i); }} />}
        {adjustItem && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} onConfirm={handleConfirmAdjust} />}
      </div>
    </>
  );
}