import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { vendorsAPI, productsAPI, ordersAPI } from "../services/api";
import { downloadCSV } from "../utils/exportCSV";
import {
  TrendingUp, Download, Pencil, Star, Package, DollarSign,
  Phone, Calendar, MapPin, Mail, CheckCircle, AlertCircle,
  Eye, Trash2, Plus, CreditCard, Upload, FileText, Menu, X
} from "lucide-react";

const initialProducts = [];
const paymentHistory = [];

const businessDocuments = [];

const categoryColors = {
  License: { bg: "#dbeafe", color: "#1d4ed8" },
  Tax:     { bg: "#fef9c3", color: "#a16207" },
  Banking: { bg: "#fce7f3", color: "#be185d" },
};
const statusStyle = {
  "Paid":           { bg: "#dcfce7", color: "#15803d" },
  "Partially Paid": { bg: "#ffedd5", color: "#c2410c" },
  "Pending":        { bg: "#fee2e2", color: "#b91c1c" },
};

/* ─────────────────────────── Mobile Responsive CSS ─────────────────────────── */
const STYLES = `
  *{box-sizing:border-box;margin:0;padding:0;}
  .vd2-page{font-family:'Segoe UI',system-ui,sans-serif;background:#f8f8f8;min-height:100vh;}

  /* nav */
  .vd2-nav{background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 24px;
    display:flex;align-items:center;justify-content:space-between;
    position:sticky;top:0;z-index:10;flex-wrap:wrap;gap:10px;}
  .vd2-nav-actions{display:flex;gap:10px;flex-wrap:wrap;}

  /* body */
  .vd2-body{max-width:1080px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:20px;}

  /* vendor card */
  .vd2-info-meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px;}
  .vd2-info-stats{display:flex;align-items:center;gap:20px;flex-wrap:wrap;}

  /* stat grid */
  .vd2-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}

  /* tabs */
  .vd2-tabs{display:flex;gap:4px;background:#fff;border-radius:12px;
    border:1px solid #e5e7eb;padding:4px;width:fit-content;flex-wrap:wrap;}

  /* table wrapper — horizontal scroll on mobile */
  .vd2-tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -20px;padding:0 20px;}
  .vd2-tbl{width:100%;border-collapse:collapse;min-width:600px;}
  .vd2-th{text-align:left;padding:12px 16px;font-size:12px;color:#9ca3af;font-weight:600;border-bottom:1px solid #f3f4f6;}
  .vd2-td{padding:14px 16px;font-size:13px;}
  .vd2-tr{border-bottom:1px solid #f9fafb;}
  .vd2-tr:last-child{border-bottom:none;}
  .vd2-tr:hover{background:#fafafa;}

  /* business grid */
  .vd2-biz-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}

  /* modal */
  .vd2-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px;}
  .vd2-modal{background:#fff;border-radius:20px;padding:28px;width:100%;
    max-width:500px;box-shadow:0 24px 60px rgba(0,0,0,0.18);
    max-height:90vh;overflow-y:auto;}
  .vd2-modal-sm{max-width:380px;}
  .vd2-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

  /* form */
  .vd2-inp{width:100%;border:1px solid #e5e7eb;border-radius:10px;
    padding:12px 14px;font-size:14px;outline:none;font-family:inherit;background:#fff;}
  .vd2-inp:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15);}
  .vd2-inp-hi{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15);}
  .vd2-inp-disabled{background:#f9fafb;color:#6b7280;cursor:default;}
  .vd2-lbl{display:block;margin-bottom:5px;font-size:13px;font-weight:600;color:#374151;}
  .vd2-select{width:100%;border:1px solid #e5e7eb;border-radius:10px;
    padding:12px 14px;font-size:14px;outline:none;font-family:inherit;
    background:#fff;cursor:pointer;}
  .vd2-select:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,0.15);}

  /* btn */
  .vd2-btn-ghost{background:#fff;border:1px solid #e5e7eb;border-radius:10px;
    padding:10px 16px;cursor:pointer;font-weight:500;font-size:13px;
    display:flex;align-items:center;gap:6px;font-family:inherit;color:#374151;}
  .vd2-btn-ghost:hover{background:#f9fafb;}
  .vd2-btn-primary{background:#f97316;color:#fff;border:none;border-radius:10px;
    padding:10px 16px;cursor:pointer;font-weight:700;font-size:13px;
    display:flex;align-items:center;gap:6px;font-family:inherit;}
  .vd2-btn-primary:hover{background:#ea6a0a;}
  .vd2-btn-cancel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;
    padding:12px 20px;cursor:pointer;font-weight:600;font-size:14px;font-family:inherit;}
  .vd2-btn-cancel:hover{background:#f9fafb;}
  .vd2-btn-save{background:#f97316;color:#fff;border:none;border-radius:10px;
    padding:12px 20px;cursor:pointer;font-weight:700;font-size:14px;font-family:inherit;}
  .vd2-btn-save:hover{background:#ea6a0a;}
  .vd2-btn-save:disabled{opacity:0.5;cursor:not-allowed;}

  /* Mobile Action Menu */
  .vd2-mobile-menu-btn{display:none;}
  .vd2-mobile-action-menu{display:none;}

  /* ═══════════ MOBILE FIRST RESPONSIVE ═══════════ */
  @media(max-width:768px){
    .vd2-nav{padding:12px 16px;}
    .vd2-nav-actions{width:100%;}
    .vd2-nav-actions button{flex:1;justify-content:center;}
    .vd2-body{padding:16px;}
    
    /* Vendor Info */
    .vd2-info-meta{grid-template-columns:1fr;gap:8px;}
    .vd2-info-stats{gap:12px;}
    .vd2-info-stats span{display:none;}
    
    /* Stat Cards */
    .vd2-stat-grid{grid-template-columns:1fr;gap:12px;}
    
    /* Tabs */
    .vd2-tabs{width:100%;}
    .vd2-tabs button{flex:1;text-align:center;padding:10px 8px;font-size:12px;}
    
    /* Business Grid */
    .vd2-biz-grid{grid-template-columns:1fr;gap:16px;}
    
    /* Modals */
    .vd2-modal{padding:20px;max-height:85vh;}
    .vd2-modal-grid{grid-template-columns:1fr;gap:12px;}
    .vd2-modal-footer{flex-direction:column;}
    .vd2-modal-footer button{width:100%;}
    
    /* Vendor Hero */
    .vd2-vendor-hero{flex-direction:column;align-items:flex-start !important;}
    .vd2-vendor-hero > div:first-child{margin-bottom:8px;}
    
    /* Mobile Action Menu - Show on Mobile */
    .vd2-mobile-menu-btn{
      display:flex;
      position:fixed;
      bottom:20px;
      right:20px;
      width:56px;
      height:56px;
      border-radius:28px;
      background:#f97316;
      color:#fff;
      border:none;
      align-items:center;
      justify-content:center;
      box-shadow:0 4px 12px rgba(249,115,22,0.4);
      z-index:100;
      cursor:pointer;
    }
    
    .vd2-mobile-action-menu{
      display:block;
      position:fixed;
      bottom:90px;
      right:20px;
      background:#fff;
      border-radius:16px;
      box-shadow:0 4px 20px rgba(0,0,0,0.15);
      padding:8px;
      z-index:101;
      min-width:200px;
    }
    
    .vd2-mobile-action-menu button{
      display:flex;
      align-items:center;
      gap:12px;
      width:100%;
      padding:14px 16px;
      border:none;
      background:none;
      text-align:left;
      font-size:14px;
      font-weight:500;
      color:#374151;
      border-radius:10px;
      cursor:pointer;
    }
    
    .vd2-mobile-action-menu button:hover,
    .vd2-mobile-action-menu button:active{
      background:#f3f4f6;
    }
    
    .vd2-mobile-action-menu hr{
      margin:8px 0;
      border:none;
      border-top:1px solid #e5e7eb;
    }

    /* Hide desktop actions on mobile */
    .vd2-desktop-actions{display:none !important;}
  }

  @media(min-width:480px) and (max-width:768px){
    .vd2-stat-grid{grid-template-columns:1fr 1fr;}
  }

  @media(min-width:769px){
    .vd2-mobile-menu-btn{display:none !important;}
    .vd2-mobile-action-menu{display:none !important;}
  }
`;

/* ─────────────────────────── helpers ─────────────────────────── */
function Badge({ label, bg, color, border }) {
  let text = label;
  if (typeof label === "object" && label !== null) {
    text = label.name || label.title || label.label || String(label);
  } else {
    text = String(label ?? "");
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "4px 12px",
      borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: bg, color, border: border ? `1px solid ${color}` : "none",
      whiteSpace: "nowrap"
    }}>{text}</span>
  );
}

function IconBtn({ icon, color, onClick, title }) {
  return (
    <button title={title} onClick={onClick}
      style={{ background: "none", border: "none", cursor: "pointer", color: color || "#9ca3af", padding: "8px", display: "flex", alignItems: "center", borderRadius: 6 }}
      onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}>
      {icon}
    </button>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="vd2-lbl">{label}</label>
      {children}
    </div>
  );
}

/* ─────────────────────────── Modals ─────────────────────────── */

/** Image 1 — Edit Product modal */
function EditProductModal({ product, vendorName, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product.name, sku: product.sku, category: product.category,
    price: product.price, stock: product.stock,
    paidAmount: product.paidAmount || "", description: product.description || ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.sku && form.category && form.price !== "" && form.stock !== "";

  return (
    <div className="vd2-overlay" onClick={onClose}>
      <div className="vd2-modal" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>Edit Product</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9ca3af" }}>Edit product details for {vendorName}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af", padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ borderTop: "1px solid #f3f4f6", margin: "16px 0" }} />

        {/* body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormField label="Product Name *">
            <input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="Enter product name"
              className={`vd2-inp ${form.name ? "vd2-inp-hi" : ""}`} />
          </FormField>

          <div className="vd2-modal-grid">
            <FormField label="SKU *">
              <input value={form.sku} onChange={e => set("sku", e.target.value)}
                placeholder="e.g., WBH-001" className="vd2-inp" />
            </FormField>
            <FormField label="Category *">
              <select value={form.category} onChange={e => set("category", e.target.value)} className="vd2-select">
                <option value="">Select category</option>
                <option>Electronics</option><option>Accessories</option><option>Clothing</option><option>Other</option>
              </select>
            </FormField>
          </div>

          <div className="vd2-modal-grid">
            <FormField label="Price (₹) *">
              <input value={form.price} onChange={e => set("price", e.target.value)}
                placeholder="e.g., 89.99" type="number" className="vd2-inp" />
            </FormField>
            <FormField label="Stock *">
              <input value={form.stock} onChange={e => set("stock", e.target.value)}
                placeholder="e.g., 100" type="number" className="vd2-inp" />
            </FormField>
          </div>

          <FormField label="Paid Amount (₹)">
            <input value={form.paidAmount} onChange={e => set("paidAmount", e.target.value)}
              placeholder="e.g., 30.00" type="number" className="vd2-inp" />
          </FormField>

          <FormField label="Product Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Enter product description (optional)" rows={3}
              className="vd2-inp" style={{ resize: "none" }} />
          </FormField>
        </div>

        {/* footer */}
        <div className="vd2-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <button className="vd2-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="vd2-btn-save" disabled={!valid}
            onClick={() => { onSave({ ...product, ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }); onClose(); }}>
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
}

/** Image 2 — Add Payment modal */
function AddPaymentModal({ product, onClose, onSave }) {
  const totalAmount = (product.price * product.sold);
  const balance = totalAmount - (product.paidAmount || 0);
  const [payAmt, setPayAmt] = useState("");

  return (
    <div className="vd2-overlay" onClick={onClose}>
      <div className="vd2-modal vd2-modal-sm" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>Add Payment</h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9ca3af" }}>Add payment for "{product.name}"</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af", padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ borderTop: "1px solid #f3f4f6", margin: "16px 0" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormField label="Product Name">
            <input value={product.name} disabled className="vd2-inp vd2-inp-disabled" />
          </FormField>
          
          <div className="vd2-modal-grid">
            <FormField label="Paid Amount">
              <input value={`₹${(Number(product.paidAmount) || 0).toFixed(2)}`} disabled className="vd2-inp vd2-inp-disabled" />
            </FormField>
            <FormField label="Balance">
              <input value={`₹${(Number(balance) || 0).toFixed(2)}`} disabled className="vd2-inp vd2-inp-disabled" />
            </FormField>
          </div>
          
          <FormField label="Payment Amount *">
            <input value={payAmt} onChange={e => setPayAmt(e.target.value)}
              placeholder="Enter payment amount" type="number"
              className={`vd2-inp ${payAmt ? "vd2-inp-hi" : ""}`} />
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>Enter the amount to pay for this product</p>
          </FormField>
        </div>

        <div className="vd2-modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
          <button className="vd2-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="vd2-btn-save" disabled={!payAmt}
            onClick={() => {
              const amt = parseFloat(payAmt);
              onSave({ ...product, paidAmount: (product.paidAmount || 0) + amt, hasPay: true });
              onClose();
            }}>
            Add Payment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function VendorDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState(location.state?.vendor || null);
  const [products, setProducts] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [vendorStatus, setVendorStatus] = useState("active");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    partiallyPaidAmount: 0,
    salesCount: 0,
    paidPaymentsCount: 0,
    pendingPaymentsCount: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const loadVendorDetails = async () => {
      try {
        let currentVendor = location.state?.vendor;
        if (id) {
          const res = await vendorsAPI.getById(id).catch(() => null);
          if (res) {
            currentVendor = res;
            if (isMounted) {
              setVendorData(res);
              setVendorStatus(res.approvalStatus || res.status || "active");
            }
          }
        }

        // Fetch products & orders to calculate real stats & list
        const [allProdsRes, allOrdersRes] = await Promise.allSettled([
          productsAPI.getAll({ limit: 1000 }),
          ordersAPI.getAll(),
        ]);

        const rawProducts = allProdsRes.status === "fulfilled"
          ? (Array.isArray(allProdsRes.value) ? allProdsRes.value : allProdsRes.value?.products || [])
          : [];

        const rawOrders = allOrdersRes.status === "fulfilled"
          ? (Array.isArray(allOrdersRes.value) ? allOrdersRes.value : allOrdersRes.value?.orders || [])
          : [];

        const getStrId = (val) => {
          if (!val) return "";
          if (typeof val === "string") return val;
          if (typeof val === "object") return String(val._id || val.id || val.storeName || val.name || "");
          return String(val);
        };

        const vendorIdStr = getStrId(id || currentVendor?._id || currentVendor?.id).toLowerCase();
        const vendorNameStr = getStrId(currentVendor?.storeName || currentVendor?.name).toLowerCase();
        const vendorOwnerStr = getStrId(currentVendor?.ownerName || currentVendor?.owner?.name).toLowerCase();

        // Filter products for this vendor
        const vendorProds = (rawProducts || []).filter((p) => {
          if (!p) return false;
          const pVendorStr = getStrId(p.vendor).toLowerCase();
          const pBrandStr = getStrId(p.brand).toLowerCase();
          const pVendorIdStr = getStrId(p.vendorId || p.vendor?._id).toLowerCase();

          const hasMatchingVariant = (p.variants || []).some((v) => {
            const vVendorId = getStrId(v?.currentVendor).toLowerCase();
            const vVendorName = getStrId(v?.vendorName || v?.vendor).toLowerCase();
            return (
              (vendorIdStr && vVendorId === vendorIdStr) ||
              (vendorNameStr && (vVendorId === vendorNameStr || vVendorName === vendorNameStr))
            );
          });

          return (
            hasMatchingVariant ||
            (vendorIdStr && (pVendorIdStr === vendorIdStr || pVendorStr === vendorIdStr)) ||
            (vendorNameStr && (pVendorStr === vendorNameStr || pBrandStr === vendorNameStr)) ||
            (vendorOwnerStr && (pVendorStr === vendorOwnerStr || pBrandStr === vendorOwnerStr))
          );
        }).map((p, idx) => {
          const firstVariant = p?.variants?.[0] || {};
          const price = Number(firstVariant.sellingPrice || p?.price || 0) || 0;
          const stock = Number(firstVariant.currentStock ?? p?.stock ?? 0) || 0;
          const sold = Number(p?.soldCount || 0) || 0;
          const categoryStr = typeof p?.category === "object" && p?.category !== null
            ? (p?.category?.name || p?.category?.title || "General")
            : String(p?.category || "General");
          return {
            id: p?._id || p?.id || `p-${idx}`,
            name: typeof p?.title === "object" ? (p?.title?.name || "Product") : String(p?.title || p?.name || "Product"),
            sku: String(firstVariant.sku || p?.sku || `SKU-${String(p?._id || "").slice(-4)}`),
            category: categoryStr,
            price: price,
            stock: stock,
            sold: sold,
            total: `₹${(price * sold).toFixed(2)}`,
            hasPay: true,
            paidAmount: Number(p?.paidAmount || 0) || 0,
          };
        });

        if (isMounted) setProducts(vendorProds);

        // Filter orders for items from this vendor
        let totRev = 0;
        let totSalesCount = 0;
        let paidAmt = 0;
        let partPaidAmt = 0;
        let paidCount = 0;
        let pendingCount = 0;
        const paymentsList = [];

        (rawOrders || []).forEach((o, oIdx) => {
          if (!o) return;
          const vendorItems = (o.items || []).filter((item) => {
            if (!item) return false;
            const itemVendorId = getStrId(item.vendorId || item.vendorId?._id).toLowerCase();
            const itemVendorName = getStrId(item.vendorId?.storeName || item.vendorName).toLowerCase();
            return (
              (vendorIdStr && itemVendorId === vendorIdStr) ||
              (vendorNameStr && itemVendorName === vendorNameStr)
            );
          });

          const itemsToCount = vendorItems;

          let orderVendorRev = 0;
          let orderVendorQty = 0;

          itemsToCount.forEach((it) => {
            if (!it) return;
            const p = Number(it.price) || 0;
            const q = Number(it.quantity) || 1;
            orderVendorRev += p * q;
            orderVendorQty += q;
          });

          if (orderVendorRev > 0) {
            totRev += orderVendorRev;
            totSalesCount += orderVendorQty;

            const isPaid = String(o.paymentStatus || "").toLowerCase() === "paid";
            if (isPaid) {
              paidAmt += orderVendorRev;
              paidCount++;
            } else {
              partPaidAmt += orderVendorRev;
              pendingCount++;
            }

            paymentsList.push({
              id: o.orderNumber || `ORD-${String(o._id || oIdx).slice(-6).toUpperCase()}`,
              date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
              total: `₹${orderVendorRev.toFixed(2)}`,
              paid: isPaid ? `₹${orderVendorRev.toFixed(2)}` : "₹0.00",
              balance: isPaid ? "-" : `₹${orderVendorRev.toFixed(2)}`,
              method: String(o.paymentMethod || "COD").toUpperCase(),
              orders: `${itemsToCount.length} item(s)`,
              status: isPaid ? "Paid" : "Pending",
            });
          }
        });

        if (isMounted) {
          setStats({
            totalRevenue: totRev || currentVendor?.totalSales || currentVendor?.totalRevenue || 0,
            paidAmount: paidAmt,
            partiallyPaidAmount: partPaidAmt,
            salesCount: totSalesCount || currentVendor?.salesCount || 0,
            paidPaymentsCount: paidCount,
            pendingPaymentsCount: pendingCount,
          });
          setPaymentHistory(paymentsList);
        }
      } catch (err) {
        console.error("Vendor details fetch error:", err);
      }
    };

    loadVendorDetails();
    return () => { isMounted = false; };
  }, [id, location.state]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const vendor = {
    name:         typeof vendorData?.storeName === "object" ? (vendorData?.storeName?.name || "") : String(vendorData?.storeName || vendorData?.name || "N/A"),
    initial:      String(vendorData?.storeName || vendorData?.name || "N").charAt(0).toUpperCase(),
    owner:        typeof vendorData?.ownerName === "object" ? (vendorData?.ownerName?.name || "") : String(vendorData?.ownerName || vendorData?.owner?.name || "N/A"),
    email:        typeof vendorData?.email === "object" ? (vendorData?.email?.email || "") : String(vendorData?.email || vendorData?.owner?.email || "N/A"),
    phone:        typeof vendorData?.phone === "object" ? (vendorData?.phone?.phone || "") : String(vendorData?.phone || "N/A"),
    address:      typeof vendorData?.address === "object" && vendorData?.address !== null ? Object.values(vendorData.address).filter(Boolean).join(", ") : String(vendorData?.address || "N/A"),
    joined:       vendorData?.createdAt ? new Date(vendorData.createdAt).toLocaleDateString() : "N/A",
    rating:       vendorData?.rating ?? 4.8,
    reviews:      vendorData?.reviewsCount ?? 12,
    products:     products.length > 0 ? products.length : (vendorData?.productsCount || vendorData?.productCount || 0),
    totalSales:   (stats.totalRevenue || 0) > 0 ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : `₹${Number(vendorData?.totalSales || vendorData?.totalRevenue || 0).toLocaleString("en-IN")}`,
    verified:     vendorData?.approvalStatus === "approved" || vendorData?.status === "verified",
    status:       typeof vendorStatus === "object" && vendorStatus !== null ? (vendorStatus?.name || String(vendorStatus)) : String(vendorStatus || vendorData?.approvalStatus || vendorData?.status || "active"),
  };

  const [activeTab,       setActiveTab]       = useState("products");
  const [docs,            setDocs]             = useState(businessDocuments);

  // modal states
  const [showStatusModal,  setShowStatusModal]  = useState(false);
  const [showAddProduct,   setShowAddProduct]   = useState(false);
  const [showEditProduct,  setShowEditProduct]  = useState(false);
  const [showPayment,      setShowPayment]      = useState(false);
  const [showUploadDoc,    setShowUploadDoc]    = useState(false);
  const [selectedProduct,  setSelectedProduct]  = useState(null);
  const [selectedStatus,   setSelectedStatus]   = useState(vendorStatus);
  const [uploadFile,       setUploadFile]       = useState(null);
  const [uploadCategory,   setUploadCategory]   = useState("");
  const [newProduct,       setNewProduct]       = useState({ name:"",sku:"",category:"",price:"",stock:"",paidAmount:"",description:"" });

  // handlers
  const handleUpdateStatus = async () => {
    try {
      const backendStatus = selectedStatus === "verified" || selectedStatus === "active" ? "approved" : (selectedStatus === "suspended" ? "rejected" : "pending");
      await vendorsAPI.updateStatus(id || vendorData?.id || vendorData?._id, backendStatus);
      setVendorStatus(selectedStatus);
      setShowStatusModal(false);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.category || !newProduct.price || !newProduct.stock) return;
    const pPrice = parseFloat(newProduct.price) || 0;
    setProducts(prev => [...prev, {
      id: Date.now(), name: newProduct.name, sku: newProduct.sku, category: newProduct.category,
      price: pPrice, stock: parseInt(newProduct.stock) || 0,
      sold: 0, total: "₹0.00", hasPay: false, paidAmount: 0,
    }]);
    setNewProduct({ name:"",sku:"",category:"",price:"",stock:"",paidAmount:"",description:"" });
    setShowAddProduct(false);
  };

  const handleEditSave = (updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? { ...updated, price: Number(updated.price) || 0 } : p));
  };

  const handlePaymentSave = (updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadCategory) return;
    setDocs(prev => [...prev, {
      name: uploadFile.name, category: uploadCategory, type: "PDF",
      size: `${(uploadFile.size/1024/1024).toFixed(1)} MB`,
      date: new Date().toISOString().slice(0,10),
    }]);
    setUploadFile(null); setUploadCategory(""); setShowUploadDoc(false);
  };

  const activeCount   = products.filter(p => p.stock > 0).length;
  const inactiveCount = products.filter(p => p.stock === 0).length;

  const exportVendorProducts = () => {
    downloadCSV(
      `vendor-products-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Product", "SKU", "Category", "Price", "Stock", "Sold", "Revenue"],
      products.map((product) => [product.name, product.sku, product.category, product.price, product.stock, product.sold, product.total])
    );
  };

  const exportPayments = () => {
    downloadCSV(
      `vendor-payments-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Transaction", "Date", "Total", "Paid", "Balance", "Method", "Orders", "Status"],
      paymentHistory.map((payment) => [payment.id, payment.date, payment.total, payment.paid, payment.balance, payment.method, payment.orders, payment.status])
    );
  };

  const statusBadgeStyle = {
    verified:  { bg:"#10b981", color:"#fff" },
    active:    { bg:"#10b981", color:"#fff" },
    pending:   { bg:"#f59e0b", color:"#fff" },
    suspended: { bg:"#ef4444", color:"#fff" },
  }[vendorStatus] || { bg:"#9ca3af", color:"#fff" };

  return (
    <div className="vd2-page">
      <style>{STYLES}</style>

      {/* ── Top Nav ── */}
      <div className="vd2-nav">
        <button className="vd2-btn-ghost" onClick={() => navigate("/vendors")}>
          ← Back
        </button>
        <div className="vd2-nav-actions vd2-desktop-actions">
          <button className="vd2-btn-ghost" onClick={() => { setSelectedStatus(vendorStatus); setShowStatusModal(true); }}>
            <TrendingUp size={15} /> Change Status
          </button>
          <button className="vd2-btn-ghost" onClick={exportVendorProducts}><Download size={15} /> Export</button>
          <button className="vd2-btn-primary"><Pencil size={15} /> Edit</button>
        </div>
      </div>

      {/* Mobile Action Button */}
      <button className="vd2-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Action Menu */}
      {isMobileMenuOpen && (
        <div className="vd2-mobile-action-menu">
          <button onClick={() => { setSelectedStatus(vendorStatus); setShowStatusModal(true); setIsMobileMenuOpen(false); }}>
            <TrendingUp size={18} color="#f97316" /> Change Status
          </button>
          <button onClick={() => { setIsMobileMenuOpen(false); }}>
            <Download size={18} color="#6b7280" /> Export Report
          </button>
          <hr />
          <button onClick={() => { setShowAddProduct(true); setIsMobileMenuOpen(false); }}>
            <Plus size={18} color="#f97316" /> Add Product
          </button>
          <button onClick={() => { setShowUploadDoc(true); setIsMobileMenuOpen(false); }}>
            <Upload size={18} color="#f97316" /> Upload Document
          </button>
        </div>
      )}

      <div className="vd2-body">

        {/* ── Vendor Info Card ── */}
        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #f0f0f0", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", padding:"20px" }}>
          <div className="vd2-vendor-hero" style={{ display:"flex", alignItems:"flex-start", gap:18 }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"#f97316", color:"#fff", fontSize:24, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {vendor.initial}
            </div>
            <div style={{ flex:1, width:"100%" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#111" }}>{vendor.name}</h1>
                {vendor.verified && <Badge label="✓ Verified" bg="#10b981" color="#fff" />}
                <Badge label={vendorStatus === "verified" ? "active" : vendorStatus} bg={statusBadgeStyle.bg} color={statusBadgeStyle.color} />
              </div>
              <p style={{ margin:"0 0 12px", fontSize:13, color:"#6b7280" }}>Owner: {vendor.owner}</p>
              <div className="vd2-info-meta">
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#4b5563", padding:"4px 0" }}><Mail size={14}/>{vendor.email}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#4b5563", padding:"4px 0" }}><Phone size={14}/>{vendor.phone}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#4b5563", padding:"4px 0" }}><MapPin size={14}/>{vendor.address}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#4b5563", padding:"4px 0" }}><Calendar size={14}/>Joined: {vendor.joined}</div>
              </div>
              <div className="vd2-info-stats" style={{ marginTop:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}><Star size={14} style={{color:"#f59e0b"}}/><span><strong>{vendor.rating}</strong> ({vendor.reviews} reviews)</span></div>
                <span style={{color:"#e5e7eb"}}>|</span>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}><Package size={14}/><strong>{vendor.products} Products</strong></div>
                <span style={{color:"#e5e7eb"}}>|</span>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}><DollarSign size={14}/><strong>{vendor.totalSales} Revenue</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="vd2-stat-grid">
          {[
            { label:"Total Revenue", value:`₹${stats.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub:`From ${stats.salesCount} sales`, subColor:"#16a34a",
              icon:<DollarSign size={22} color="#fff"/>, iconBg:"#f97316" },
            { label:"Paid Amount", value:`₹${stats.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub:<Badge label={`${stats.paidPaymentsCount} payments`} bg="#dcfce7" color="#15803d"/>,
              icon:<CheckCircle size={22} color="#16a34a"/>, iconBg:"#dcfce7" },
            { label:"Partially Paid / Pending", value:`₹${stats.partiallyPaidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sub:<Badge label={`${stats.pendingPaymentsCount} pending`} bg="#ffedd5" color="#c2410c"/>,
              icon:<AlertCircle size={22} color="#d97706"/>, iconBg:"#fef9c3" },
          ].map(c => (
            <div key={c.label} style={{ background:"#fff", borderRadius:18, border:"1px solid #f0f0f0", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", padding:"20px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <p style={{ margin:"0 0 6px", fontSize:13, color:"#6b7280" }}>{c.label}</p>
                <p style={{ margin:"0 0 8px", fontSize:26, fontWeight:800, color:"#111", lineHeight:1 }}>{c.value}</p>
                {typeof c.sub === "string"
                  ? <p style={{ margin:0, fontSize:12, color:c.subColor, fontWeight:500 }}>{c.sub}</p>
                  : c.sub}
              </div>
              <div style={{ width:46, height:46, borderRadius:14, background:c.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="vd2-tabs">
          {[
            { key:"products", label:`Products (${products.length})` },
            { key:"payment",  label:`Payments (${paymentHistory.length})` },
            { key:"business", label:"Business" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                padding:"10px 16px", fontSize:13, borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"inherit", transition:"all 0.15s",
                background: activeTab===t.key ? "#f3f4f6" : "transparent",
                fontWeight: activeTab===t.key ? 700 : 400,
                color: activeTab===t.key ? "#111" : "#6b7280",
                whiteSpace:"nowrap"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════ PRODUCTS TAB ══════════ */}
        {activeTab === "products" && (
          <div style={{ background:"#fff", borderRadius:18, border:"1px solid #f0f0f0", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", flexWrap:"wrap", gap:10 }}>
              <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#111" }}>Products</h2>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <Badge label={`${activeCount} Active`}   bg="#dcfce7" color="#15803d" />
                <Badge label={`${inactiveCount} Inactive`} bg="#f3f4f6" color="#4b5563" />
                <button className="vd2-btn-primary" onClick={() => setShowAddProduct(true)}>
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
            <div className="vd2-tbl-wrap">
              <table className="vd2-tbl">
                <thead>
                  <tr>
                    {["Product","SKU","Category","Price","Stock","Sold","Total","Actions"].map(h=>(
                      <th key={h} className="vd2-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="vd2-tr">
                      <td className="vd2-td" style={{ fontWeight:600, color:"#111" }}>{p.name}</td>
                      <td className="vd2-td" style={{ color:"#9ca3af" }}>{p.sku}</td>
                      <td className="vd2-td">
                        <Badge label={p.category}
                          bg={p.category==="Electronics"?"#eff6ff":"#f5f3ff"}
                          color={p.category==="Electronics"?"#1d4ed8":"#6d28d9"} />
                      </td>
                      <td className="vd2-td" style={{ fontWeight:600 }}>₹{(Number(p.price) || 0).toFixed(2)}</td>
                      <td className="vd2-td" style={{ fontWeight:700, color:p.stock===0?"#ef4444":"#111" }}>{p.stock}</td>
                      <td className="vd2-td">{p.sold}</td>
                      <td className="vd2-td" style={{ fontWeight:600, color:"#16a34a" }}>{p.total}</td>
                      <td className="vd2-td">
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <IconBtn icon={<Eye size={16}/>} />
                          <IconBtn icon={<Pencil size={16}/>} title="Edit Product"
                            onClick={() => { setSelectedProduct(p); setShowEditProduct(true); }} />
                          {p.hasPay && (
                            <IconBtn icon={<DollarSign size={16}/>} color="#f97316" title="Add Payment"
                              onClick={() => { setSelectedProduct(p); setShowPayment(true); }} />
                          )}
                          <IconBtn icon={<Trash2 size={16}/>} color="#ef4444"
                            onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ PAYMENT HISTORY TAB ══════════ */}
        {activeTab === "payment" && (
          <div style={{ background:"#fff", borderRadius:18, border:"1px solid #f0f0f0", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", flexWrap:"wrap", gap:10 }}>
              <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#111" }}>Payment History</h2>
              <button className="vd2-btn-ghost" onClick={exportPayments}><Download size={14}/> Export</button>
            </div>
            <div className="vd2-tbl-wrap">
              <table className="vd2-tbl">
                <thead>
                  <tr>
                    {["Transaction","Date","Total","Paid","Balance","Method","Orders","Status","Actions"].map(h=>(
                      <th key={h} className="vd2-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map(t => (
                    <tr key={t.id} className="vd2-tr">
                      <td className="vd2-td" style={{ color:"#6b7280", fontSize:12 }}>{t.id}</td>
                      <td className="vd2-td">{t.date}</td>
                      <td className="vd2-td" style={{ fontWeight:600 }}>{t.total}</td>
                      <td className="vd2-td" style={{ fontWeight:600, color:"#16a34a" }}>{t.paid}</td>
                      <td className="vd2-td" style={{ color: t.balance!=="-"?"#f97316":"#9ca3af" }}>{t.balance}</td>
                      <td className="vd2-td">
                        <div style={{ display:"flex", alignItems:"center", gap:4, color:"#4b5563" }}>
                          <CreditCard size={14} style={{color:"#9ca3af"}}/>{t.method}
                        </div>
                      </td>
                      <td className="vd2-td">{t.orders}</td>
                      <td className="vd2-td">
                        <Badge label={t.status}
                          bg={statusStyle[t.status]?.bg||"#f3f4f6"}
                          color={statusStyle[t.status]?.color||"#374151"} />
                      </td>
                      <td className="vd2-td">
                        <div style={{ display:"flex", gap:4 }}>
                          <IconBtn icon={<Download size={15}/>} />
                          <IconBtn icon={<Eye size={15}/>} />
                          {t.status!=="Paid" && <IconBtn icon={<Plus size={15}/>} color="#f97316"/>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ BUSINESS DETAILS TAB ══════════ */}
        {activeTab === "business" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div className="vd2-biz-grid">
              {/* Business Info */}
              <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid #e5e7eb" }}>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Business Info</h3>
                </div>
                <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>
                  {[
                    ["Business License","BL-2025-0012345"],
                    ["Tax ID","TAX-123456789"],
                    ["Business Address", vendor.address],
                    ["Registration Date", vendor.joined],
                  ].map(([k,v])=>(
                    <div key={k}>
                      <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280" }}>{k}</p>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#111" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Payment Info */}
              <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid #e5e7eb" }}>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Payment Info</h3>
                </div>
                <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>
                  {[
                    ["Payment Method","N/A"],
                    ["Bank Account","N/A"],
                  ].map(([k,v])=>(
                    <div key={k}>
                      <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280" }}>{k}</p>
                      <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#111" }}>{v}</p>
                    </div>
                  ))}
                  <div>
                    <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280" }}>Total Paid</p>
                    <p style={{ margin:0, fontSize:24, fontWeight:800, color:"#16a34a" }}>N/A</p>
                  </div>
                  <div>
                    <p style={{ margin:"0 0 4px", fontSize:12, color:"#6b7280" }}>Outstanding Balance</p>
                    <p style={{ margin:0, fontSize:24, fontWeight:800, color:"#f97316" }}>N/A</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div style={{ background:"#fff", borderRadius:18, border:"1px solid #f0f0f0", boxShadow:"0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", flexWrap:"wrap", gap:10 }}>
                <div>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Documents</h3>
                  <p style={{ margin:"4px 0 0", fontSize:12, color:"#9ca3af" }}>Upload business documents</p>
                </div>
                <button className="vd2-btn-primary" onClick={() => setShowUploadDoc(true)}>
                  <Upload size={15}/> Upload
                </button>
              </div>
              <div className="vd2-tbl-wrap">
                <table className="vd2-tbl">
                  <thead>
                    <tr>{["Document","Category","Type","Size","Date","Actions"].map(h=><th key={h} className="vd2-th">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {docs.map((d,i)=>(
                      <tr key={i} className="vd2-tr">
                        <td className="vd2-td">
                          <div style={{ display:"flex", alignItems:"center", gap:8, color:"#374151" }}>
                            <FileText size={15} style={{color:"#9ca3af", flexShrink:0}}/>{d.name}
                          </div>
                        </td>
                        <td className="vd2-td">
                          <Badge label={d.category}
                            bg={categoryColors[d.category]?.bg||"#f3f4f6"}
                            color={categoryColors[d.category]?.color||"#374151"} />
                        </td>
                        <td className="vd2-td">
                          <span style={{ background:"#f3f4f6", color:"#374151", fontSize:11, padding:"4px 10px", borderRadius:6, fontWeight:600 }}>{d.type}</span>
                        </td>
                        <td className="vd2-td" style={{ color:"#6b7280" }}>{d.size}</td>
                        <td className="vd2-td" style={{ color:"#6b7280" }}>{d.date}</td>
                        <td className="vd2-td">
                          <div style={{ display:"flex", gap:4 }}>
                            <IconBtn icon={<Download size={15}/>}/>
                            <IconBtn icon={<Trash2 size={15}/>} color="#ef4444"/>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════ MODALS ══════════ */}

      {/* Edit Product Modal */}
      {showEditProduct && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          vendorName={vendor.name}
          onClose={() => setShowEditProduct(false)}
          onSave={handleEditSave}
        />
      )}

      {/* Add Payment Modal */}
      {showPayment && selectedProduct && (
        <AddPaymentModal
          product={selectedProduct}
          onClose={() => setShowPayment(false)}
          onSave={handlePaymentSave}
        />
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="vd2-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="vd2-modal vd2-modal-sm" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#111" }}>Change Status</h2>
                <p style={{ margin:"6px 0 0", fontSize:13, color:"#9ca3af" }}>Update status for {vendor.name}</p>
              </div>
              <button onClick={() => setShowStatusModal(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af", padding:"4px 8px" }}>✕</button>
            </div>
            <div style={{ borderTop:"1px solid #f3f4f6", margin:"16px 0" }} />
            <div style={{ marginBottom:16 }}>
              <label className="vd2-lbl">Select Status</label>
              <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="vd2-select">
                <option value="active">🟢 Active</option>
                <option value="pending">🟡 Pending</option>
                <option value="suspended">🔴 Suspended</option>
              </select>
            </div>
            <div style={{ background:"#f9fafb", borderRadius:10, padding:"14px", marginBottom:20, fontSize:13, color:"#4b5563" }}>
              <strong>Note:</strong> Changing vendor status affects their ability to manage products and receive payments.
            </div>
            <div className="vd2-modal-footer" style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
              <button className="vd2-btn-cancel" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="vd2-btn-save" onClick={handleUpdateStatus}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="vd2-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="vd2-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#111" }}>Add Product</h2>
                <p style={{ margin:"6px 0 0", fontSize:13, color:"#9ca3af" }}>Add product to {vendor.name}</p>
              </div>
              <button onClick={() => setShowAddProduct(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af", padding:"4px 8px" }}>✕</button>
            </div>
            <div style={{ borderTop:"1px solid #f3f4f6", margin:"16px 0" }} />
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <FormField label="Product Name *">
                <input value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})}
                  placeholder="Enter product name" className={`vd2-inp ${newProduct.name?"vd2-inp-hi":""}`} />
              </FormField>
              <div className="vd2-modal-grid">
                <FormField label="SKU *">
                  <input value={newProduct.sku} onChange={e=>setNewProduct({...newProduct,sku:e.target.value})}
                    placeholder="e.g., WBH-001" className="vd2-inp" />
                </FormField>
                <FormField label="Category *">
                  <select value={newProduct.category} onChange={e=>setNewProduct({...newProduct,category:e.target.value})} className="vd2-select">
                    <option value="">Select category</option>
                    <option>Electronics</option><option>Accessories</option><option>Clothing</option><option>Other</option>
                  </select>
                </FormField>
              </div>
              <div className="vd2-modal-grid">
                <FormField label="Price (₹) *">
                  <input value={newProduct.price} onChange={e=>setNewProduct({...newProduct,price:e.target.value})}
                    placeholder="89.99" type="number" className="vd2-inp" />
                </FormField>
                <FormField label="Stock *">
                  <input value={newProduct.stock} onChange={e=>setNewProduct({...newProduct,stock:e.target.value})}
                    placeholder="100" type="number" className="vd2-inp" />
                </FormField>
              </div>
              <FormField label="Paid Amount (₹)">
                <input value={newProduct.paidAmount} onChange={e=>setNewProduct({...newProduct,paidAmount:e.target.value})}
                  placeholder="30.00" type="number" className="vd2-inp" />
              </FormField>
              <FormField label="Description">
                <textarea value={newProduct.description} onChange={e=>setNewProduct({...newProduct,description:e.target.value})}
                  placeholder="Enter product description (optional)" rows={3}
                  className="vd2-inp" style={{ resize:"none" }} />
              </FormField>
            </div>
            <div className="vd2-modal-footer" style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:20 }}>
              <button className="vd2-btn-cancel" onClick={() => setShowAddProduct(false)}>Cancel</button>
              <button className="vd2-btn-save"
                disabled={!newProduct.name||!newProduct.sku||!newProduct.category||!newProduct.price||!newProduct.stock}
                onClick={handleAddProduct}>Add Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadDoc && (
        <div className="vd2-overlay" onClick={() => setShowUploadDoc(false)}>
          <div className="vd2-modal vd2-modal-sm" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ flex:1 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#111" }}>Upload Document</h2>
                <p style={{ margin:"6px 0 0", fontSize:13, color:"#9ca3af" }}>Upload document for {vendor.name}</p>
              </div>
              <button onClick={() => setShowUploadDoc(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af", padding:"4px 8px" }}>✕</button>
            </div>
            <div style={{ borderTop:"1px solid #f3f4f6", margin:"16px 0" }} />
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <FormField label="Select File *">
                <input type="file" onChange={e=>setUploadFile(e.target.files[0])}
                  className="vd2-inp" style={{ padding:"10px" }} />
              </FormField>
              <FormField label="Document Category *">
                <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} className="vd2-select">
                  <option value="">Select category</option>
                  <option value="License">License</option>
                  <option value="Tax">Tax</option>
                  <option value="Banking">Banking</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
            </div>
            <div className="vd2-modal-footer" style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:24 }}>
              <button className="vd2-btn-cancel" onClick={() => setShowUploadDoc(false)}>Cancel</button>
              <button className="vd2-btn-save" disabled={!uploadFile||!uploadCategory} onClick={handleUpload}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}