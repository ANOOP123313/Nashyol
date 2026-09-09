"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

import {
  Search, Download, Plus, MoreVertical, Package, X, Upload,
  Eye, Pencil, Trash2, Star, ShoppingCart, DollarSign,
  TrendingUp, Copy, Edit2, ChevronLeft,
  Heart, Share2, ShoppingBag, CheckCircle, XCircle, Check, ChevronDown,
  Tag, Store, BarChart2, Box, AlertCircle, Loader2,
} from "lucide-react";
import { useProducts, useProduct, useProductMutations } from "../hooks/useProducts";
import { productsAPI, reviewsAPI, uploadAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";


// ─────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────
const productStatusBadge = (s) => {
  if (s === "approved")     return { bg: "#10b981", label: "approved" };
  if (s === "pending")      return { bg: "#f59e0b", label: "pending" };
  if (s === "out-of-stock") return { bg: "#374151", label: "out-of-stock" };
  return { bg: "#9ca3af", label: s ?? "unknown" };
};

const couponStatusStyle = (s) => {
  if (s === "Active")   return { bg: "#10b981", color: "#fff" };
  if (s === "Used")     return { bg: "#ef4444", color: "#fff" };
  if (s === "Expired")  return { bg: "#6b7280", color: "#fff" };
  return { bg: "#e5e7eb", color: "#374151" };
};

const formatRevenue = (n) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

/** Normalise backend product shape → UI-friendly shape */
const normalise = (p) => ({
  ...p,
  id        : p._id,
  name      : p.title,
  sku       : p.variants?.[0]?.sku ?? p._id,
  category  : p.category?.name ?? p.category ?? "—",
  vendor    : p.variants?.[0]?.currentVendor?.storeName ?? p.brand ?? "—",
  price     : p.variants?.[0]?.sellingPrice ?? 0,
  originalPrice: null,
  stock     : p.variants?.reduce((sum, v) => sum + (v.currentStock ?? 0), 0) ?? 0,
  status    : p.isActive
    ? (p.variants?.some(v => v.currentStock > 0) ? "approved" : "out-of-stock")
    : "pending",
  image     : p.images?.[0] ?? "https://placehold.co/300x300?text=No+Image",
  description: p.description ?? "",
  referralCoupons: p.referralCoupons ?? [],
});

// ─────────────────────────────────────────────────
//  Inline CSS
// ─────────────────────────────────────────────────
const globalCSS = `
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f1f5f9; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  .page-wrap::-webkit-scrollbar { display: none !important; }
  .page-wrap { scrollbar-width: none !important; }
  .tabs-bar::-webkit-scrollbar { display:none!important; width:0!important; height:0!important; }
  .tabs-bar { scrollbar-width:none!important; -ms-overflow-style:none!important; background:#fff; }
  .prog-fill { transition: width 0.4s ease; }

  .modal-input:focus,.modal-select:focus,.modal-textarea:focus,
  .add-modal-input:focus,.add-modal-select:focus,.add-modal-textarea:focus,
  .search-input:focus {
    border-color:#f97316!important;
    box-shadow:0 0 0 3px rgba(249,115,22,0.15)!important;
    outline:none!important;
  }
  .modal-input:hover,.modal-select:hover,.modal-textarea:hover,
  .add-modal-input:hover,.add-modal-select:hover,.add-modal-textarea:hover,
  .search-input:hover { border-color:#fdba74!important; }

  .custom-dd-btn:hover { border-color:#fdba74!important; }
  .custom-dd-btn.open  { border-color:#f97316!important; box-shadow:0 0 0 3px rgba(249,115,22,0.15)!important; }

  .three-dots-btn { background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px 6px; border-radius:6px; display:flex; font-family:inherit; transition:background .15s,color .15s; }
  .three-dots-btn:hover { background:#fff7ed!important; color:#f97316!important; }
  .three-dots-btn:hover svg { stroke:#f97316!important; }

  .export-btn { display:flex; align-items:center; gap:7px; padding:9px 18px; border:1.5px solid #d1d5db; border-radius:9px; background:#fff; font-size:13px; font-weight:500; color:#374151; cursor:pointer; font-family:inherit; transition:border-color .18s,color .18s,background .18s,box-shadow .18s; }
  .export-btn:hover { border-color:#f97316!important; color:#f97316!important; background:#fff7ed!important; box-shadow:0 0 0 3px rgba(249,115,22,0.10)!important; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; }

  @media (max-width:767px) {
    .page-wrap                { padding:14px!important; }
    .page-header              { flex-direction:column!important; align-items:flex-start!important; gap:10px!important; }
    .kpi-list-grid            { grid-template-columns:1fr 1fr!important; gap:10px!important; margin-bottom:14px!important; }
    .toolbar-row              { flex-direction:column!important; gap:10px!important; }
    .filters-wrap             { flex-direction:column!important; gap:8px!important; width:100%!important; }
    .filters-wrap > *         { width:100%!important; }
    .table-scroll             { overflow-x:auto!important; }
    table.prod-table          { min-width:620px!important; }
    .detail-topbar            { flex-direction:column!important; align-items:flex-start!important; gap:10px!important; }
    .hero-card                { flex-direction:column!important; }
    .hero-meta-grid           { grid-template-columns:1fr 1fr!important; }
    .kpi-detail-grid          { grid-template-columns:1fr 1fr!important; }
    .modal-grid               { grid-template-columns:1fr!important; }
    .preview-layout           { flex-direction:column!important; }
    .preview-img              { width:100%!important; height:200px!important; }
  }
  @media (min-width:1024px) {
    .kpi-detail-grid  { grid-template-columns:repeat(4,1fr)!important; }
    .kpi-list-grid    { grid-template-columns:repeat(4,1fr)!important; }
    .hero-meta-grid   { grid-template-columns:repeat(4,1fr)!important; }
    table.prod-table  { min-width:unset!important; }
  }
`;

// ─────────────────────────────────────────────────
//  Shared sub-components
// ─────────────────────────────────────────────────
function Spinner({ size = 18, color = "#f97316" }) {
  return <Loader2 size={size} color={color} className="spin" />;
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:12,marginBottom:20,gap:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#dc2626" }}>
        <AlertCircle size={16}/> {message}
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{ fontSize:12,fontWeight:600,color:"#dc2626",background:"none",border:"1px solid #fca5a5",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit" }}>Retry</button>
      )}
    </div>
  );
}

function CustomDropdown({ value, onChange, options, minWidth = 150 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuStyle({ position:"fixed",top:r.bottom+4,left:r.left,minWidth:r.width,zIndex:99999 });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const close = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) && menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", () => setIsOpen(false), true);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div style={{ position:"relative",display:"inline-block" }}>
      <button ref={btnRef} className={`custom-dd-btn${isOpen?" open":""}`} onClick={() => isOpen ? setIsOpen(false) : openMenu()} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"8px 14px",border:"1px solid #d1d5db",borderRadius:8,background:"#fff",fontSize:13,color:"#374151",cursor:"pointer",fontFamily:"inherit",minWidth,whiteSpace:"nowrap" }}>
        <span>{value}</span>
        <ChevronDown size={15} color="#9ca3af" style={{ transition:"transform .2s",transform:isOpen?"rotate(180deg)":"rotate(0deg)",flexShrink:0 }}/>
      </button>
      {isOpen && (
        <div ref={menuRef} style={{ ...menuStyle,background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,boxShadow:"0 10px 30px rgba(0,0,0,0.12)",padding:"4px 0",overflow:"hidden" }}>
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 16px",background:selected?"#fff7ed":"#fff",border:"none",cursor:"pointer",fontSize:13,fontFamily:"inherit",color:selected?"#f97316":"#374151",fontWeight:selected?600:400,textAlign:"left" }} onMouseEnter={e => { if (!selected) e.currentTarget.style.background="#f9fafb"; }} onMouseLeave={e => { if (!selected) e.currentTarget.style.background="#fff"; }}>
                <span>{opt}</span>
                {selected && <Check size={14} color="#f97316" strokeWidth={2.5}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Product Details Page (real data via useProduct)
// ─────────────────────────────────────────────────
function ProductDetailsPage({ productId, rawProduct, onBack }) {
  const { product: fetched, loading, error } = useProduct(productId);
  const product = fetched ? normalise(fetched) : rawProduct;
  const [activeTab, setActiveTab] = useState("referral");
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);

  const tabs = [
    { id:"referral",  Icon:Tag,      label:"Referral Coupons" },
    { id:"analytics", Icon:BarChart2, label:"Analytics" },
    { id:"inventory", Icon:Box,       label:"Inventory" },
    { id:"reviews",   Icon:Star,      label:"Reviews" },
  ];

  if (loading) return (
    <div style={{ display:"flex",justifyContent:"center",alignItems:"center",height:300 }}>
      <Spinner size={32}/>
    </div>
  );
  if (error) return <ErrorBanner message={error} onRetry={() => window.location.reload()}/>;
  if (!product) return null;

  const badge = productStatusBadge(product.status);

  return (
    <div className="page-wrap" style={{ background:"#f3f4f6",padding:"28px 32px" }}>
      {/* Top bar */}
      <div className="detail-topbar" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#6b7280",fontWeight:500,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit" }}>
          <ChevronLeft size={16}/> Back to Products
        </button>
        <div className="topbar-right" style={{ display:"flex",gap:10 }}>
          <button style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 16px",fontSize:13,fontWeight:500,color:"#374151",border:"1px solid #d1d5db",borderRadius:8,background:"#fff",cursor:"pointer",fontFamily:"inherit" }}><Edit2 size={14}/> Edit Product</button>
          <button style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 16px",fontSize:13,fontWeight:500,color:"#ef4444",border:"1px solid #fca5a5",borderRadius:8,background:"#fff",cursor:"pointer",fontFamily:"inherit" }}><Trash2 size={14}/> Delete</button>
        </div>
      </div>

      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22,fontWeight:700,color:"#111827",margin:0 }}>Product Details</h1>
        <p style={{ fontSize:13,color:"#9ca3af",margin:"4px 0 0" }}>Manage product information and settings</p>
      </div>

      {/* Hero card */}
      <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:24,marginBottom:18,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="hero-card" style={{ display:"flex",gap:24 }}>
          <img src={product.image} alt={product.name} style={{ width:130,height:130,borderRadius:12,objectFit:"cover",flexShrink:0 }}/>
          <div style={{ flex:1,minWidth:0 }}>
            <h2 style={{ fontSize:20,fontWeight:700,color:"#111827",margin:"0 0 10px" }}>{product.name}</h2>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:12 }}>
              <span style={{ background:"#f97316",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"monospace",padding:"3px 10px",borderRadius:9999 }}>{product.sku}</span>
              <span style={{ background:badge.bg,color:"#fff",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:9999 }}>{badge.label}</span>
            </div>
            <p style={{ fontSize:13,color:"#6b7280",lineHeight:1.65,margin:"0 0 20px" }}>{product.description}</p>
            <div className="hero-meta-grid" style={{ display:"grid",gap:16 }}>
              {[
                { Icon:Tag,      label:"Category", val:product.category },
                { Icon:Store,    label:"Vendor",   val:product.vendor },
                { Icon:DollarSign, label:"Price",  val:`$${product.price.toFixed(2)}` },
                { Icon:Box,      label:"Stock",    val:product.stock },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:6 }}><m.Icon size={13} color="#9ca3af" strokeWidth={1.8}/><span style={{ fontSize:12,color:"#9ca3af" }}>{m.label}</span></div>
                  <p style={{ margin:0,fontSize:15,fontWeight:700,color:"#111827" }}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,0.05)",overflow:"hidden" }}>
        <div className="tabs-bar" style={{ borderBottom:"1px solid #e5e7eb",paddingLeft:24,paddingRight:24,overflowX:"auto" }}>
          <div style={{ display:"flex",minWidth:"max-content" }}>
            {tabs.map(t => {
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display:"flex",alignItems:"center",gap:7,padding:"14px 16px",fontSize:13,fontWeight:active?600:500,background:"none",border:"none",cursor:"pointer",borderBottom:active?"2px solid #f97316":"2px solid transparent",color:active?"#f97316":"#6b7280",marginBottom:-1,whiteSpace:"nowrap",fontFamily:"inherit" }}>
                  <t.Icon size={15} color={active?"#f97316":"#6b7280"}/>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ padding:24 }}>
          {activeTab === "referral" && (
            <>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20 }}>
                <div>
                  <h3 style={{ fontSize:16,fontWeight:700,color:"#111827",margin:"0 0 4px" }}>Referral Coupons</h3>
                  <p style={{ fontSize:13,color:"#9ca3af",margin:0 }}>Active referral codes for {product.name}</p>
                </div>
                <button onClick={() => setShowCreateCoupon(true)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:"#f97316",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}><Plus size={14}/> Add Rule</button>
              </div>
              {product.referralCoupons.length === 0 ? (
                <div style={{ textAlign:"center",padding:"40px 0",color:"#9ca3af",fontSize:13 }}>No referral coupons yet.</div>
              ) : (
                <div style={{ border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead><tr style={{ background:"#f3f4f6" }}>{["COUPON CODE","REFERRER","DISCOUNT","USAGE","EXPIRY","STATUS","ACTIONS"].map(h=><th key={h} style={{ padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#9ca3af",letterSpacing:"0.05em",whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {product.referralCoupons.map((c, i) => {
                        const cs = couponStatusStyle(c.status);
                        const pct = Math.min(100, (c.used / (c.total || 1)) * 100);
                        return (
                          <tr key={c.code || i} style={{ borderBottom:i<product.referralCoupons.length-1?"1px solid #f3f4f6":"none" }}>
                            <td style={{ padding:"14px 16px" }}><div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontFamily:"monospace",fontWeight:700,fontSize:12,color:"#111827" }}>{c.code}</span><button style={{ background:"none",border:"none",cursor:"pointer",color:"#d1d5db",padding:0,display:"flex" }}><Copy size={12}/></button></div></td>
                            <td style={{ padding:"14px 16px" }}><p style={{ margin:0,fontWeight:600,color:"#111827",fontSize:13 }}>{c.email}</p></td>
                            <td style={{ padding:"14px 16px",whiteSpace:"nowrap" }}><span style={{ fontWeight:700,color:"#f97316",fontSize:13 }}>{c.discountPrefix}{c.discountValue}</span></td>
                            <td style={{ padding:"14px 16px" }}><span style={{ fontSize:13,fontWeight:600,color:"#374151" }}>{c.used}/{c.total}</span><div style={{ width:90,height:4,background:"#e5e7eb",borderRadius:9999,marginTop:5 }}><div className="prog-fill" style={{ width:`${pct}%`,height:4,background:"#f97316",borderRadius:9999 }}/></div></td>
                            <td style={{ padding:"14px 16px",fontSize:12,color:"#6b7280",whiteSpace:"nowrap" }}>{c.expiry ? new Date(c.expiry).toLocaleDateString() : "—"}</td>
                            <td style={{ padding:"14px 16px" }}><span style={{ background:cs.bg,color:cs.color,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:9999 }}>{c.status}</span></td>
                            <td style={{ padding:"14px 16px" }}><div style={{ display:"flex",gap:10 }}><button style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:0,display:"flex" }}><Edit2 size={14}/></button><button style={{ background:"none",border:"none",cursor:"pointer",color:"#ef4444",padding:0,display:"flex" }}><Trash2 size={14}/></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {activeTab === "analytics" && (
            <div>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#111827",margin:"0 0 16px" }}>Product Performance Analytics</h3>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20 }}>
                <div style={{ background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:16 }}>
                  <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 4px" }}>Est. Total Revenue</p>
                  <p style={{ fontSize:22,fontWeight:700,color:"#10b981",margin:0 }}>${((product.price || 0) * (product.stock || 5)).toFixed(2)}</p>
                </div>
                <div style={{ background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:16 }}>
                  <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 4px" }}>Available Stock Units</p>
                  <p style={{ fontSize:22,fontWeight:700,color:"#f97316",margin:0 }}>{product.stock || 0}</p>
                </div>
                <div style={{ background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:16 }}>
                  <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 4px" }}>Customer Rating</p>
                  <p style={{ fontSize:22,fontWeight:700,color:"#f59e0b",margin:0 }}>4.8 ★</p>
                </div>
              </div>
              <div style={{ height:240,width:"100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: "Jan", sales: 12 },
                    { month: "Feb", sales: 19 },
                    { month: "Mar", sales: 15 },
                    { month: "Apr", sales: 22 },
                    { month: "May", sales: 30 },
                    { month: "Jun", sales: 25 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeTab === "inventory" && (
            <div>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#111827",margin:"0 0 16px" }}>Variants & Stock</h3>
              {(fetched?.variants ?? []).length === 0 ? (
                <div style={{ textAlign:"center",padding:"32px 0",color:"#9ca3af",fontSize:13 }}>No variants found.</div>
              ) : (
                <div style={{ border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead><tr style={{ background:"#f3f4f6" }}>{["SKU","ATTRIBUTES","PRICE","STOCK","STATUS"].map(h=><th key={h} style={{ padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#9ca3af",letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(fetched?.variants ?? []).map((v, i) => (
                        <tr key={v._id || i} style={{ borderBottom:i<(fetched?.variants?.length-1)?"1px solid #f3f4f6":"none" }}>
                          <td style={{ padding:"12px 16px",fontFamily:"monospace",fontSize:11,color:"#64748b" }}>{v.sku}</td>
                          <td style={{ padding:"12px 16px",fontSize:12,color:"#374151" }}>{v.attributes?.map(a=>`${a.name}: ${a.value}`).join(", ") || "—"}</td>
                          <td style={{ padding:"12px 16px",fontWeight:600,color:"#374151" }}>${v.sellingPrice?.toFixed(2)}</td>
                          <td style={{ padding:"12px 16px",fontWeight:700,color:v.currentStock===0?"#ef4444":v.currentStock<10?"#f97316":"#10b981" }}>{v.currentStock ?? 0}</td>
                          <td style={{ padding:"12px 16px" }}><span style={{ background:v.isActive?"#d1fae5":"#fee2e2",color:v.isActive?"#065f46":"#991b1b",fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:9999 }}>{v.isActive?"Active":"Inactive"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === "reviews" && (
            <div>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#111827",margin:"0 0 16px" }}>Customer Reviews & Ratings</h3>
              <div style={{ border:"1px solid #e5e7eb",borderRadius:10,padding:20,background:"#fff" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                  <div style={{ fontSize:28,fontWeight:800,color:"#111827" }}>4.8</div>
                  <div style={{ display:"flex",alignItems:"center",gap:2,color:"#f59e0b" }}>
                    <Star size={18} fill="#f59e0b"/>
                    <Star size={18} fill="#f59e0b"/>
                    <Star size={18} fill="#f59e0b"/>
                    <Star size={18} fill="#f59e0b"/>
                    <Star size={18} fill="#f59e0b"/>
                  </div>
                  <span style={{ fontSize:13,color:"#6b7280" }}>(Verified Customer Feedback)</span>
                </div>
                <div style={{ borderTop:"1px solid #f3f4f6",paddingTop:16,display:"flex",flexDirection:"column",gap:14 }}>
                  {[
                    { user: "Sarah M.", rating: 5, date: "2 days ago", comment: "Excellent quality and fast delivery. Exactly as described!" },
                    { user: "David K.", rating: 5, date: "1 week ago", comment: "Very satisfied with this product. Would highly recommend." },
                  ].map((rev, idx) => (
                    <div key={idx} style={{ background:"#f9fafb",borderRadius:8,padding:14,border:"1px solid #f3f4f6" }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:13,fontWeight:600,color:"#111827" }}>{rev.user}</span>
                        <span style={{ fontSize:12,color:"#9ca3af" }}>{rev.date}</span>
                      </div>
                      <div style={{ display:"flex",gap:2,color:"#f59e0b",marginBottom:6 }}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b"/>
                        ))}
                      </div>
                      <p style={{ margin:0,fontSize:13,color:"#4b5563" }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Add / Edit Product Modal
// ─────────────────────────────────────────────────
function ProductFormModal({ product, onClose, onSuccess }) {
  const isEdit = !!product;
  const { createProduct, updateProduct, loading, error } = useProductMutations({ onSuccess });

  const [form, setForm] = useState({
    title       : product?.name      ?? "",
    brand       : product?.vendor    ?? "",
    category    : product?.category  ?? "",
    description : product?.description ?? "",
    price       : product?.price?.toString() ?? "",
    stock       : product?.stock?.toString() ?? "",
    paidAmount  : product?.paidAmount?.toString() ?? "",
    status      : product?.status === "approved" ? "Approved" : product?.status === "pending" ? "Pending" : "Out of Stock",
  });
  const [images, setImages] = useState(product?.images || (product?.image ? [product.image] : []));
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange  = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleFiles   = async (e) => {
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

  const handleSubmit  = async () => {
    const payload = {
      title       : form.title,
      brand       : form.brand,
      category    : form.category || "Electronics",
      price       : Number(form.price) || 0,
      stock       : Number(form.stock) || 0,
      description : form.description,
      paidAmount  : Number(form.paidAmount) || 0,
      isActive    : form.status !== "Out of Stock",
      images      : images.length > 0 ? images : ["https://placehold.co/300x300?text=No+Image"],
    };
    try {
      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
    } catch (_) { /* error shown inline */ }
  };

  const iS = { width:"100%",borderRadius:8,border:"1px solid #d1d5db",padding:"8px 12px",fontSize:13,outline:"none",fontFamily:"inherit",background:"#fff",color:"#374151" };
  const lS = { display:"block",fontSize:12,fontWeight:500,color:"#4b5563",marginBottom:4 };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.4)" }} onClick={onClose}/>
      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:640,margin:"0 16px",background:"#fff",borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",overflow:"hidden" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #e5e7eb" }}>
          <h2 style={{ margin:0,fontSize:16,fontWeight:700,color:"#111827" }}>{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#9ca3af",display:"flex" }}><X size={20}/></button>
        </div>

        <div style={{ padding:"20px 24px",maxHeight:"72vh",overflowY:"auto" }}>
          {error && <ErrorBanner message={error}/>}

          <div className="modal-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
            <div><label style={lS}>Product Name <span style={{ color:"#ef4444" }}>*</span></label><input name="title" value={form.title} onChange={handleChange} placeholder="Enter product name" className="add-modal-input" style={iS}/></div>
            <div><label style={lS}>Brand / Vendor <span style={{ color:"#ef4444" }}>*</span></label><input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand name" className="add-modal-input" style={iS}/></div>
          </div>
          <div className="modal-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
            <div>
              <label style={lS}>Category <span style={{ color:"#ef4444" }}>*</span></label>
              <select name="category" value={form.category} onChange={handleChange} className="add-modal-select" style={{ ...iS,appearance:"none",cursor:"pointer" }}>
                <option value="">Select category</option>
                <option>Electronics</option><option>Fashion</option>
                <option>Home &amp; Garden</option><option>Sports</option><option>Beauty</option>
              </select>
            </div>
            <div><label style={lS}>Status</label><select name="status" value={form.status} onChange={handleChange} className="add-modal-select" style={{ ...iS,appearance:"none",cursor:"pointer" }}><option>Pending</option><option>Approved</option><option>Out of Stock</option></select></div>
          </div>
          <div className="modal-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
            <div><label style={lS}>Price ($) <span style={{ color:"#ef4444" }}>*</span></label><input name="price" value={form.price} onChange={handleChange} type="number" placeholder="0.00" className="add-modal-input" style={iS}/></div>
            <div><label style={lS}>Stock Quantity</label><input name="stock" value={form.stock} onChange={handleChange} type="number" placeholder="0" className="add-modal-input" style={iS}/></div>
          </div>
          <div style={{ marginBottom:16 }}><label style={lS}>Paid Amount ($)</label><input name="paidAmount" value={form.paidAmount} onChange={handleChange} type="number" placeholder="0.00" className="add-modal-input" style={iS}/></div>
          <div style={{ marginBottom:16 }}><label style={lS}>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="add-modal-textarea" style={{ ...iS,resize:"none" }}/></div>
          <div>
            <p style={{ ...lS,fontWeight:600,marginBottom:8 }}>Product Images</p>
            <label style={{ display:"flex",alignItems:"center",gap:12,cursor:uploadingImage?"not-allowed":"pointer",marginBottom:12 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",border:"1px solid #d1d5db",borderRadius:8,fontSize:13,color:"#374151" }}>
                {uploadingImage ? <Spinner size={14}/> : <Upload size={14}/>} Upload Images
              </div>
              <span style={{ fontSize:13,color:"#9ca3af" }}>{images.length > 0 ? `${images.length} image(s) uploaded` : "No images uploaded"}</span>
              <input type="file" multiple accept="image/*" style={{ display:"none" }} onChange={handleFiles} disabled={uploadingImage}/>
            </label>
            {images.length > 0 && (
              <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
                {images.map((url, idx) => (
                  <div key={idx} style={{ position:"relative",width:70,height:70,borderRadius:8,overflow:"hidden",border:"1px solid #e5e7eb" }}>
                    <img src={url} alt={`img-${idx}`} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                    <button onClick={() => removeImage(idx)} style={{ position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                      <X size={12}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",gap:10,padding:"16px 24px",borderTop:"1px solid #e5e7eb",background:"#f3f4f6" }}>
          <button onClick={onClose} style={{ padding:"8px 20px",borderRadius:8,border:"1px solid #d1d5db",background:"#fff",fontSize:13,fontWeight:500,color:"#374151",cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading || uploadingImage} style={{ padding:"8px 20px",borderRadius:8,border:"none",background:(loading||uploadingImage)?"#fdba74":"#f97316",fontSize:13,fontWeight:600,color:"#fff",cursor:(loading||uploadingImage)?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6 }}>
            {loading && <Spinner size={14} color="#fff"/>}
            {isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Delete Confirmation Modal
// ─────────────────────────────────────────────────
function DeleteModal({ product, onClose, onConfirm, loading }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.45)" }} onClick={onClose}/>
      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:400,margin:"0 16px",background:"#fff",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.2)",padding:"28px 28px 20px",textAlign:"center" }}>
        <div style={{ width:52,height:52,borderRadius:"50%",background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}><Trash2 size={22} color="#ef4444"/></div>
        <h3 style={{ margin:"0 0 8px",fontSize:16,fontWeight:700,color:"#111827" }}>Delete Product?</h3>
        <p style={{ margin:"0 0 24px",fontSize:13,color:"#6b7280" }}>This will soft-delete <strong>{product.name}</strong> and hide it from the store.</p>
        <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
          <button onClick={onClose} style={{ padding:"9px 22px",borderRadius:9,border:"1px solid #d1d5db",background:"#fff",fontSize:13,fontWeight:500,color:"#374151",cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding:"9px 22px",borderRadius:9,border:"none",background:loading?"#fca5a5":"#ef4444",fontSize:13,fontWeight:600,color:"#fff",cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6 }}>
            {loading && <Spinner size={14} color="#fff"/>} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
//  Main Products Page
// ─────────────────────────────────────────────────
export default function Products() {
  // ── State ──
  const [search, setSearch]             = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedProduct, setSelectedProduct] = useState(null); // { id, raw }
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [openMenuId, setOpenMenuId]           = useState(null);
  const menuRef = useRef(null);

  // ── API hooks ──
  const { products: raw, total, loading, error, params, updateParams, goToPage, refetch } = useProducts({ includeInactive: "true" });
  const { deleteProduct, loading: deleteLoading } = useProductMutations({ onSuccess: () => { setDeletingProduct(null); refetch(); } });

  // Normalise backend → UI shape
  const products = raw.map(normalise);

  // ── Derived filter values applied CLIENT-SIDE for instant UX ──
  const statusMap = { "All Status":null,"Approved":"approved","Pending":"pending","Out of Stock":"out-of-stock" };
  const filtered = products.filter(p => {
    const ms = statusMap[statusFilter];
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "All Categories" || p.category === categoryFilter) &&
      (ms === null || p.status === ms)
    );
  });

  // ── Stats ──
  const activeListings = products.filter(p => p.status === "approved").length;
  const pendingCount   = products.filter(p => p.status === "pending").length;
  const outOfStock     = products.filter(p => p.stock === 0).length;

  // Close context menu on outside click
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Debounce search → push to API ──
  useEffect(() => {
    const t = setTimeout(() => updateParams({ search }), 350);
    return () => clearTimeout(t);
  }, [search]);

  const statusPillStyle = (s) => {
    if (s === "approved")     return { background:"#10b981",color:"#fff" };
    if (s === "pending")      return { background:"#f59e0b",color:"#fff" };
    if (s === "out-of-stock") return { background:"#374151",color:"#fff" };
    return { background:"#e5e7eb",color:"#6b7280" };
  };
  const stockStyle = (n) => {
    if (n === 0) return { color:"#ef4444",fontWeight:700 };
    if (n < 50)  return { color:"#f97316",fontWeight:700 };
    return { color:"#10b981",fontWeight:700 };
  };

  const menuItem = (color = "#374151") => ({
    display:"flex",width:"100%",alignItems:"center",gap:9,padding:"9px 14px",fontSize:12,color,background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"inherit",
  });

  const categoryOptions = ["All Categories","Electronics","Fashion","Home & Garden","Sports","Beauty"];
  const statusOptions   = ["All Status","Approved","Pending","Out of Stock"];

  // ── If viewing a product detail ──
  if (selectedProduct) {
    return (
      <>
        <style>{globalCSS}</style>
        <ProductDetailsPage
          productId={selectedProduct.id}
          rawProduct={selectedProduct.raw}
          onBack={() => setSelectedProduct(null)}
        />
      </>
    );
  }

  return (
    <>
      <style>{globalCSS}</style>
      <div className="page-wrap" style={{ background:"#f3f4f6",minHeight:"100vh",padding:"28px 32px" }}>

        {/* Modals */}
        {showAddModal && (
          <ProductFormModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { setShowAddModal(false); refetch(); }}
          />
        )}
        {editingProduct && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={() => { setEditingProduct(null); refetch(); }}
          />
        )}
        {deletingProduct && (
          <DeleteModal
            product={deletingProduct}
            loading={deleteLoading}
            onClose={() => setDeletingProduct(null)}
            onConfirm={() => deleteProduct(deletingProduct.id)}
          />
        )}

        {/* Header */}
        <div className="page-header" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28 }}>
          <div>
            <h1 style={{ margin:0,fontSize:26,fontWeight:700,color:"#111827" }}>Products</h1>
            <p style={{ margin:"4px 0 0",fontSize:13,color:"#9ca3af" }}>Manage product listings and inventory</p>
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button className="export-btn"><Download size={15}/> Export</button>
            <button onClick={() => setShowAddModal(true)} style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 20px",border:"none",borderRadius:9,background:"#f97316",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"inherit" }}><Plus size={15}/> Add Product</button>
          </div>
        </div>

        {/* Error banner */}
        {error && <ErrorBanner message={error} onRetry={refetch}/>}

        {/* KPI cards */}
        <div className="kpi-list-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24 }}>
          {[
            { label:"Total Products",  val:loading?"—":total,            icon:<Package size={20} color="#fff"/>,         bg:"#f97316",  valColor:"#111827" },
            { label:"Active Listings", val:loading?"—":activeListings,   icon:<CheckCircle size={20} color="#fff"/>,     bg:"#10b981",  valColor:"#10b981" },
            { label:"Pending Approval",val:loading?"—":pendingCount,     icon:<AlertCircle size={20} color="#fff"/>,     bg:"#f59e0b",  valColor:"#f97316" },
            { label:"Out of Stock",    val:loading?"—":outOfStock,       icon:<XCircle size={20} color="#fff"/>,         bg:"#ef4444",  valColor:"#ef4444" },
          ].map(k => (
            <div key={k.label} style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"20px 22px",boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
                <div>
                  <p style={{ margin:"0 0 6px",fontSize:13,color:"#6b7280" }}>{k.label}</p>
                  <p style={{ margin:0,fontSize:35,fontWeight:700,color:k.valColor,lineHeight:1 }}>
                    {loading ? <Spinner/> : k.val}
                  </p>
                </div>
                <div style={{ width:44,height:44,borderRadius:12,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{k.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{ background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
          {/* Toolbar */}
          <div style={{ padding:"16px 24px",borderBottom:"1px solid #e5e7eb" }}>
            <div className="toolbar-row" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
              <h2 style={{ margin:0,fontSize:15,fontWeight:600,color:"#111827",whiteSpace:"nowrap" }}>
                All Products
                <span style={{ marginLeft:8,fontSize:13,fontWeight:400,color:"#f97316" }}>({filtered.length} of {total})</span>
              </h2>
              <div className="filters-wrap" style={{ display:"flex",flexWrap:"wrap",gap:10,alignItems:"center" }}>
                <div style={{ position:"relative" }}>
                  <Search size={15} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#9ca3af",pointerEvents:"none" }}/>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="search-input" style={{ paddingLeft:32,paddingRight:14,paddingTop:8,paddingBottom:8,border:"1px solid #d1d5db",borderRadius:8,fontSize:13,width:210,fontFamily:"inherit",background:"#fff",color:"#374151" }}/>
                </div>
                <CustomDropdown value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} minWidth={160}/>
                <CustomDropdown value={statusFilter}   onChange={setStatusFilter}   options={statusOptions}   minWidth={140}/>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-scroll" style={{ overflowX:"auto" }}>
            <table className="prod-table" style={{ width:"100%",borderCollapse:"collapse",tableLayout:"fixed" }}>
              <colgroup>
                <col style={{ width:"28%" }}/><col style={{ width:"14%" }}/><col style={{ width:"12%" }}/><col style={{ width:"13%" }}/><col style={{ width:"9%" }}/><col style={{ width:"7%" }}/><col style={{ width:"11%" }}/><col style={{ width:"6%" }}/>
              </colgroup>
              <thead>
                <tr style={{ borderBottom:"1px solid #e5e7eb" }}>
                  {["Product","SKU","Category","Vendor","Price","Stock","Status","Actions"].map(h => (
                    <th key={h} style={{ padding:"12px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ textAlign:"center",padding:"48px 0" }}><Spinner size={24}/></td></tr>
                )}
                {!loading && filtered.map((product) => {
                  const ps = statusPillStyle(product.status);
                  const sc = stockStyle(product.stock);
                  const isPending = product.status === "pending";
                  return (
                    <tr key={product.id} style={{ borderBottom:"1px solid #f3f4f6",transition:"background .12s" }} onMouseEnter={e => e.currentTarget.style.background="#f9fafb"} onMouseLeave={e => e.currentTarget.style.background=""}>
                      <td style={{ padding:"14px 12px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                          <img src={product.image} alt={product.name} style={{ width:46,height:46,borderRadius:10,objectFit:"cover",flexShrink:0 }}/>
                          <span style={{ fontSize:14,fontWeight:600,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 12px" }}><span style={{ background:"#f1f5f9",borderRadius:6,padding:"2px 8px",fontFamily:"monospace",fontSize:11,color:"#64748b" }}>{product.sku}</span></td>
                      <td style={{ padding:"14px 12px",fontSize:13,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{product.category}</td>
                      <td style={{ padding:"14px 12px",fontSize:13,color:"#6b7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{product.vendor}</td>
                      <td style={{ padding:"14px 12px",fontSize:14,fontWeight:400,color:"#374151",whiteSpace:"nowrap" }}>${product.price.toLocaleString("en-US",{ minimumFractionDigits:2 })}</td>
                      <td style={{ padding:"14px 12px" }}><span style={{ fontSize:14,...sc }}>{product.stock}</span></td>
                      <td style={{ padding:"14px 12px" }}><span style={{ ...ps,borderRadius:9999,padding:"3px 12px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center" }}>{product.status}</span></td>
                      <td style={{ padding:"14px 12px" }}>
                        <div style={{ position:"relative" }} ref={openMenuId === product.id ? menuRef : null}>
                          <button className="three-dots-btn" onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}>
                            <MoreVertical size={16}/>
                          </button>
                          {openMenuId === product.id && (
                            <div style={{ position:"absolute",right:0,zIndex:30,width:172,background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,boxShadow:"0 10px 30px rgba(0,0,0,.12)",padding:"4px 0",...(product.id && products.indexOf(product) >= products.length - 2 ? { bottom:34 } : { top:34 }) }}>
                              <button onClick={() => { setOpenMenuId(null); setSelectedProduct({ id:product.id, raw:product }); }} onMouseEnter={e => e.currentTarget.style.background="#f3f4f6"} onMouseLeave={e => e.currentTarget.style.background=""} style={menuItem()}><Eye size={13} color="#9ca3af"/> View Details</button>
                              <button onClick={() => { setOpenMenuId(null); setEditingProduct(product); }} onMouseEnter={e => e.currentTarget.style.background="#f3f4f6"} onMouseLeave={e => e.currentTarget.style.background=""} style={menuItem()}><Pencil size={13} color="#9ca3af"/> Edit Product</button>
                              {isPending && (
                                <>
                                  <button onClick={() => setOpenMenuId(null)} onMouseEnter={e => e.currentTarget.style.background="#f0fdf4"} onMouseLeave={e => e.currentTarget.style.background=""} style={menuItem("#16a34a")}><CheckCircle size={13} color="#16a34a"/> Approve</button>
                                  <button onClick={() => setOpenMenuId(null)} onMouseEnter={e => e.currentTarget.style.background="#fef2f2"} onMouseLeave={e => e.currentTarget.style.background=""} style={menuItem("#dc2626")}><XCircle size={13} color="#dc2626"/> Reject</button>
                                </>
                              )}
                              <div style={{ height:1,background:"#f1f5f9",margin:"4px 0" }}/>
                              <button onClick={() => { setOpenMenuId(null); setDeletingProduct(product); }} onMouseEnter={e => e.currentTarget.style.background="#fef2f2"} onMouseLeave={e => e.currentTarget.style.background=""} style={menuItem("#ef4444")}><Trash2 size={13} color="#f87171"/> Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:"center",padding:"56px 0",color:"#9ca3af",fontSize:13 }}>No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > params.limit && (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderTop:"1px solid #e5e7eb",fontSize:13,color:"#6b7280" }}>
              <span>Showing {((params.page - 1) * params.limit) + 1}–{Math.min(params.page * params.limit, total)} of {total}</span>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={() => goToPage(params.page - 1)} disabled={params.page <= 1} style={{ padding:"6px 14px",borderRadius:7,border:"1px solid #d1d5db",background:"#fff",fontSize:13,cursor:params.page<=1?"not-allowed":"pointer",color:params.page<=1?"#d1d5db":"#374151",fontFamily:"inherit" }}>← Prev</button>
                <button onClick={() => goToPage(params.page + 1)} disabled={params.page * params.limit >= total} style={{ padding:"6px 14px",borderRadius:7,border:"1px solid #d1d5db",background:"#fff",fontSize:13,cursor:params.page*params.limit>=total?"not-allowed":"pointer",color:params.page*params.limit>=total?"#d1d5db":"#374151",fontFamily:"inherit" }}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}