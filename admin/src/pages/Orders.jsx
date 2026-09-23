import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye, Pencil, Navigation, RotateCcw, Download, Search, X, Check, ChevronDown
} from "lucide-react";
import OrderDetail from "./OrderDetail";
import { ordersAPI } from "../services/api";
import { downloadCSV } from "../utils/exportCSV";


/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */


/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .op { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f5f5; min-height: 100vh; padding: 32px 40px; }
  .op-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .op-hdr h1 { font-size: 34px; font-weight: 700; color: #111; letter-spacing: -0.5px; }
  .op-hdr p { margin-top: 5px; font-size: 14px; color: #6b7280; }
  .op-export { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #e5e7eb; background: #fff; border-radius: 10px; padding: 9px 18px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; color: #374151; }
  .op-export:hover { background: #f9fafb; }
  .op-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .op-stat { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 22px 24px; }
  .op-card { background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; }
  .op-card-top { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid #f3f4f6; flex-wrap: wrap; gap: 12px; }
  .op-filters { display: flex; gap: 10px; flex-wrap: wrap; }
  .op-srch-wrap { position: relative; }
  .op-srch-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9ca3af; display: flex; align-items: center; pointer-events: none; }
  .op-srch { border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 14px 9px 35px; font-size: 14px; outline: none; font-family: inherit; width: 210px; background: #fff; }
  .op-srch:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
  .op-tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .op-tbl { width: 100%; border-collapse: collapse; min-width: 720px; }
  .op-th { text-align: left; padding: 12px 20px; font-size: 12px; color: #9ca3af; font-weight: 600; border-bottom: 1px solid #f3f4f6; white-space: nowrap; }
  .op-td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid #f9fafb; }
  .op-tr:last-child .op-td { border-bottom: none; }
  .op-tr { cursor: pointer; }
  .op-tr:hover .op-td { background: #fafafa; }
  .op-id-wrap { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
  .op-id { font-size: 12px; color: #6b7280; white-space: nowrap; }
  .op-ref { display: inline-flex; align-items: center; gap: 4px; background: #f97316; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }
  .op-acts { display: flex; align-items: center; gap: 2px; }
  .op-act { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; display: inline-flex; align-items: center; color: #9ca3af; transition: all 0.15s; }
  .op-act:hover { background: #f3f4f6; }
  .op-act.v:hover { color: #3b82f6; }
  .op-act.e:hover { color: #f97316; }
  .op-act.a:hover { color: #10b981; }
  .op-act.r:hover { color: #ef4444; }
  .bdg { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .bdg-paid { background: #10b981; color: #fff; }
  .bdg-pending { background: #f97316; color: #fff; }
  .bdg-failed { background: #ef4444; color: #fff; }
  .bdg-delivered { background: #10b981; color: #fff; }
  .bdg-shipped { background: #3b82f6; color: #fff; }
  .bdg-processing { background: #f97316; color: #fff; }
  .bdg-cancelled { background: #6b7280; color: #fff; }
  .bdg-active { background: #f97316; color: #fff; }
  .op-mob { display: none; }
  .op-mob-card { background: #fff; border-radius: 14px; padding: 16px; margin-bottom: 12px; border: 1px solid #e5e7eb; cursor: pointer; }
  .op-mob-card:hover { background: #fafafa; }
  .op-mob-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .op-mob-badges { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .op-mob-acts { display: flex; gap: 6px; justify-content: flex-end; }
  .op-ov { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
  .op-modal { background: #fff; border-radius: 20px; padding: 28px; width: 100%; max-width: 460px; box-shadow: 0 24px 60px rgba(0,0,0,0.18); max-height: 90vh; overflow-y: auto; }
  .op-mhdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .op-mdiv { border: none; border-top: 1px solid #f0f0f0; margin: 16px 0; }
  .op-mbody { display: flex; flex-direction: column; gap: 14px; }
  .op-mfoot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
  .op-lbl { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #374151; }
  .op-inp { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; font-family: inherit; background: #fff; }
  .op-inp:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
  .op-inp-hi { border-color: #f97316 !important; }
  .op-ta { resize: none; }
  .op-sel { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; font-family: inherit; background: #fff; cursor: pointer; }
  .op-sel:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
  .op-btn-cancel { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 22px; cursor: pointer; font-weight: 600; font-size: 14px; font-family: inherit; }
  .op-btn-cancel:hover { background: #f9fafb; }
  .op-btn-ok { background: #f97316; color: #fff; border: none; border-radius: 10px; padding: 9px 22px; cursor: pointer; font-weight: 700; font-size: 14px; font-family: inherit; }
  .op-btn-ok:hover { background: #ea6a0a; }
  .op-cls { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 2px; line-height: 1; flex-shrink: 0; margin-left: 8px; display: inline-flex; }
  .op-cls:hover { color: #374151; }
  .op-dd { position: relative; }
  .op-dd-btn { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 14px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: inherit; background: #fff; color: #374151; white-space: nowrap; min-width: 130px; justify-content: space-between; }
  .op-dd-btn:hover { background: #f9fafb; }
  .op-dd-menu { position: absolute; right: 0; top: calc(100% + 6px); background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 50; min-width: 160px; padding: 6px; }
  .op-dd-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; font-size: 14px; border-radius: 8px; cursor: pointer; color: #374151; }
  .op-dd-item:hover { background: #fff7ed; }
  .op-dd-item.selected { background: #fff7ed; font-weight: 600; color: #111; }
  .op-dd-check { color: #f97316; display: flex; align-items: center; }
  @media(max-width: 1100px) { .op-stats { grid-template-columns: 1fr 1fr; } }
  @media(max-width: 767px) {
    .op { padding: 14px; }
    .op-hdr { flex-direction: column; gap: 12px; align-items: stretch; }
    .op-hdr h1 { font-size: 26px; }
    .op-export { width: 100%; justify-content: center; }
    .op-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .op-stat { padding: 14px 16px; }
    .op-card-top { flex-direction: column; align-items: stretch; }
    .op-filters { flex-direction: column; }
    .op-srch { width: 100% !important; }
    .op-dd { width: 100%; }
    .op-dd-btn { width: 100%; }
    .op-dd-menu { left: 0; right: 0; min-width: unset; }
    .op-desk { display: none; }
    .op-mob { display: block; padding: 12px; }
    .op-modal { padding: 18px; }
    .op-mfoot { flex-direction: column; }
    .op-mfoot .op-btn-cancel,
    .op-mfoot .op-btn-ok { width: 100%; text-align: center; }
  }
  @media(max-width: 480px) { .op-stats { grid-template-columns: 1fr; } }
`;

/* helpers */
function Badge({ status }) {
  const cls = {
    paid: "bdg bdg-paid", pending: "bdg bdg-pending", failed: "bdg bdg-failed",
    delivered: "bdg bdg-delivered", shipped: "bdg bdg-shipped",
    processing: "bdg bdg-processing", cancelled: "bdg bdg-cancelled", active: "bdg bdg-active",
  };
  return <span className={cls[status] || "bdg"}>{status}</span>;
}
function F({ label, children }) {
  return <div><label className="op-lbl">{label}</label>{children}</div>;
}

/* ─── MODAL 1 — Update Delivery ─── */
function UpdateDeliveryModal({ order, onClose, onSave }) {
  const [form, setForm] = useState({
    status: order.tracking.status || "Pending",
    trackingNo: order.tracking.trackingNo || "",
    carrier: order.tracking.carrier || "",
    estimatedDelivery: order.tracking.estimatedDelivery || "",
  });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="op-ov" onClick={onClose}>
      <div className="op-modal" onClick={e => e.stopPropagation()}>
        <div className="op-mhdr">
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#111" }}>Update Delivery Information</div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 5 }}>Update the delivery status and tracking details for the order.</div>
          </div>
          <button className="op-cls" onClick={onClose}><X size={20} /></button>
        </div>
        <hr className="op-mdiv" />
        <div className="op-mbody">
          <F label="Delivery Status">
            <select value={form.status} onChange={e => s("status", e.target.value)} className="op-sel">
              {["Pending","Processing","Shipped","Delivered","Cancelled"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F label="Tracking Number">
            <input value={form.trackingNo} onChange={e => s("trackingNo", e.target.value)} placeholder="FDX1234567890" className="op-inp" />
          </F>
          <F label="Delivery Partner">
            <input value={form.carrier} onChange={e => s("carrier", e.target.value)} placeholder="FedEx" className="op-inp" />
          </F>
          <F label="Estimated Delivery">
            <input value={form.estimatedDelivery} onChange={e => s("estimatedDelivery", e.target.value)} placeholder="2026-02-20" className="op-inp" />
          </F>
        </div>
        <div className="op-mfoot">
          <button className="op-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="op-btn-ok" onClick={() => { onSave(form); onClose(); }}>Update</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL 2 — Assign to Delivery ─── */
function AssignDeliveryModal({ order, onClose, onSave }) {
  const [form, setForm] = useState({
    status: order.tracking.status || "Pending",
    trackingNo: order.tracking.trackingNo || "",
    carrier: order.tracking.carrier || "",
    estimatedDelivery: order.tracking.estimatedDelivery || "",
    location: order.tracking.location || "",
    notes: order.tracking.notes || "",
  });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="op-ov" onClick={onClose}>
      <div className="op-modal" onClick={e => e.stopPropagation()}>
        <div className="op-mhdr">
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#111" }}>Assign Order to Delivery</div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 5 }}>Assign the order to the delivery section with updated details.</div>
          </div>
          <button className="op-cls" onClick={onClose}><X size={20} /></button>
        </div>
        <hr className="op-mdiv" />
        <div className="op-mbody">
          <F label="Delivery Status">
            <select value={form.status} onChange={e => s("status", e.target.value)} className="op-sel">
              {["Pending","Processing","Shipped","Delivered","Cancelled"].map(v => <option key={v}>{v}</option>)}
            </select>
          </F>
          <F label="Tracking Number">
            <input value={form.trackingNo} onChange={e => s("trackingNo", e.target.value)} placeholder="FDX1234567890" className="op-inp" />
          </F>
          <F label="Delivery Partner">
            <input value={form.carrier} onChange={e => s("carrier", e.target.value)} placeholder="FedEx" className="op-inp" />
          </F>
          <F label="Estimated Delivery">
            <input value={form.estimatedDelivery} onChange={e => s("estimatedDelivery", e.target.value)} placeholder="2026-02-20" className="op-inp" />
          </F>
          <F label="Current Location">
            <input value={form.location} onChange={e => s("location", e.target.value)} className="op-inp" />
          </F>
          <F label="Delivery Notes">
            <textarea value={form.notes} onChange={e => s("notes", e.target.value)} rows={3} className="op-inp op-ta" />
          </F>
        </div>
        <div className="op-mfoot">
          <button className="op-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="op-btn-ok" onClick={() => { onSave(form); onClose(); }}>Assign</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL 3 — Return/Refund ─── */
function RefundModal({ order, onClose }) {
  const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  const [form, setForm] = useState({
    reason: "", type: "Return",
    amount: order.amount.toFixed(2), notes: "", requestDate: today, product: "",
  });
  const s = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const productNames = order.products.map(p => typeof p === "string" ? p : p.name);
  return (
    <div className="op-ov" onClick={onClose}>
      <div className="op-modal" onClick={e => e.stopPropagation()}>
        <div className="op-mhdr">
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#111" }}>Initiate Return/Refund</div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 5 }}>Create a return or refund request for the order.</div>
          </div>
          <button className="op-cls" onClick={onClose}><X size={20} /></button>
        </div>
        <hr className="op-mdiv" />
        <div className="op-mbody">
          <F label="Reason for Return/Refund">
            <input value={form.reason} onChange={e => s("reason", e.target.value)}
              className={`op-inp ${form.reason ? "op-inp-hi" : ""}`} autoFocus />
          </F>
          <F label="Type">
            <select value={form.type} onChange={e => s("type", e.target.value)} className="op-sel">
              <option>Return</option><option>Refund</option><option>Exchange</option>
            </select>
          </F>
          <F label="Refund Amount">
            <input value={form.amount} onChange={e => s("amount", e.target.value)} type="number" className="op-inp" />
          </F>
          <F label="Notes">
            <textarea value={form.notes} onChange={e => s("notes", e.target.value)} rows={3} className="op-inp op-ta" />
          </F>
          <F label="Request Date">
            <input value={form.requestDate} onChange={e => s("requestDate", e.target.value)} className="op-inp" />
          </F>
          <F label="Products to Return/Refund">
            <select value={form.product} onChange={e => s("product", e.target.value)} className="op-sel">
              <option value=""></option>
              {productNames.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </F>
        </div>
        <div className="op-mfoot">
          <button className="op-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="op-btn-ok" onClick={onClose}>Submit</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Custom Filter Dropdown ─── */
const FILTER_OPTIONS = ["All Status", "Pending", "Processing", "Shipped", "Delivered"];
function FilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="op-dd" ref={ref}>
      <button className="op-dd-btn" onClick={() => setOpen(o => !o)}>
        <span>{value}</span><ChevronDown size={14} />
      </button>
      {open && (
        <div className="op-dd-menu">
          {FILTER_OPTIONS.map(opt => (
            <div key={opt} className={`op-dd-item ${value === opt ? "selected" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}>
              <span>{opt}</span>
              {value === opt && <span className="op-dd-check"><Check size={14} /></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function Orders() {
  const [orders, setOrders]           = useState([]);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("All Status");
  const [modal, setModal]             = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);

  const exportOrders = () => {
    downloadCSV(
      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Order ID", "Customer", "Vendor", "Amount", "Items", "Payment Status", "Delivery Status", "Date"],
      filtered.map((order) => [order.id, order.customer, order.vendor, order.amount, order.items, order.payment, order.delivery, order.date])
    );
    toast.success(`Exported ${filtered.length} order${filtered.length === 1 ? "" : "s"}`);
  };

  useEffect(() => {
    ordersAPI.getAll()
      .then((res) => {
        const data = res.orders || res || [];
        if (Array.isArray(data)) {
          const mapped = data.map((o) => ({
            id: `ORD-${(o._id || "").slice(-8).toUpperCase()}`,
            _id: o._id,
            referral: !!o.couponCode,
            customer: o.user?.name || o.address?.fullName || "Customer",
            vendor: o.items?.[0]?.vendorId?.storeName || "",
            amount: o.totalAmount || 0,
            items: o.items?.length || 1,
            payment: o.paymentStatus || "paid",
            delivery: o.orderStatus || "delivered",
            date: new Date(o.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            email: o.user?.email || "",
            tax: o.taxAmount || 0,
            tracking: { status: o.orderStatus, trackingNo: o.trackingNumber || "", carrier: o.carrier || "", estimatedDelivery: o.estimatedDelivery || "" },
            products: (o.items || []).map((it) => ({
              name: it.title || "Product Item",
              qty: it.quantity || 1,
              price: it.price || 0,
              img: "📦",
            })),
          }));
          setOrders(mapped);
        }
      })
      .catch((err) => console.error("Orders fetch error:", err));
  }, []);

  const processingCount = orders.filter(o => o.delivery.toLowerCase() === "processing" || o.delivery.toLowerCase() === "shipped").length;
  const completedCount = orders.filter(o => o.delivery.toLowerCase() === "delivered").length;
  const pendingPaymentCount = orders.filter(o => o.payment.toLowerCase() === "pending").length;

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const mq = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.vendor.toLowerCase().includes(q);
    const ms = filter === "All Status" || o.payment === filter.toLowerCase() || o.delivery === filter.toLowerCase();
    return mq && ms;
  });

  const updateTracking = async (orderId, data) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    try {
      if (targetOrder._id && data.status) {
        await ordersAPI.updateStatus(targetOrder._id, data.status.toLowerCase());
      }
      setOrders(prev => prev.map(o =>
        o.id !== orderId ? o : { ...o, delivery: data.status.toLowerCase(), tracking: { ...o.tracking, ...data } }
      ));
      if (detailOrder?.id === orderId) {
        setDetailOrder(prev => ({ ...prev, delivery: data.status.toLowerCase(), tracking: { ...prev.tracking, ...data } }));
      }
      toast.success("Order status updated successfully");
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const navigate = useNavigate();
  const openModal = (type, order, e) => { e.stopPropagation(); setModal({ type, order }); };

  const goToDetail = (o, e) => {
    if (e) e.stopPropagation();
    if (o._id || o.id) {
      navigate(`/orders/${o._id || o.id}`);
    } else {
      setDetailOrder(o);
    }
  };

  const ActionBtns = ({ o }) => (
    <>
      <button className="op-act v" title="View Order" onClick={e => goToDetail(o, e)}>
        <Eye size={15} />
      </button>
      <button className="op-act e" title="Update Delivery" onClick={e => openModal("edit", o, e)}><Pencil size={15} /></button>
      <button className="op-act a" title="Assign to Delivery" onClick={e => openModal("assign", o, e)}><Navigation size={15} /></button>
      <button className="op-act r" title="Return/Refund" onClick={e => openModal("refund", o, e)}><RotateCcw size={15} /></button>
    </>
  );

  /* ── OrderDetail view ── */
  if (detailOrder) {
    return (
      <OrderDetail
        order={detailOrder}
        onBack={() => setDetailOrder(null)}
      />
    );
  }

  return (
    <div className="op">
      <style>{STYLES}</style>

      {/* HEADER */}
      <div className="op-hdr">
        <div>
          <h1>Orders</h1>
          <p>Manage and track all marketplace orders</p>
        </div>
        <button className="op-export" onClick={exportOrders}><Download size={15} /> Export Orders</button>
      </div>

      {/* STAT CARDS */}
      <div className="op-stats">
        <div className="op-stat">
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Total Orders</p>
          <p style={{ fontSize: 34, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 8 }}>{orders.length}</p>
          <p style={{ fontSize: 13, color: "#16a34a", fontWeight: 500 }}>Live Orders</p>
        </div>
        <div className="op-stat">
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Processing</p>
          <p style={{ fontSize: 34, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 8 }}>{processingCount}</p>
          <span className="bdg bdg-active">Active</span>
        </div>
        <div className="op-stat">
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Completed</p>
          <p style={{ fontSize: 34, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 8 }}>{completedCount}</p>
          <p style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{orders.length > 0 ? `${Math.round((completedCount/orders.length)*100)}% completion rate` : "0% completion rate"}</p>
        </div>
        <div className="op-stat">
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Pending Payment</p>
          <p style={{ fontSize: 34, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 8 }}>{pendingPaymentCount}</p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="op-card">
        <div className="op-card-top">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>All Orders</h2>
          <div className="op-filters">
            <div className="op-srch-wrap">
              <span className="op-srch-icon"><Search size={15} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search orders..." className="op-srch" />
            </div>
            <FilterDropdown value={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="op-desk">
          <div className="op-tbl-wrap">
            <table className="op-tbl">
              <thead>
                <tr>
                  {["Order ID","Customer","Vendor","Amount","Payment","Delivery","Date","Actions"].map(h => (
                    <th key={h} className="op-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="op-tr" onClick={() => setDetailOrder(o)}>
                    <td className="op-td">
                      <div className="op-id-wrap">
                        <span className="op-id">{o.id}</span>
                        {o.referral && <span className="op-ref">🎁 Referral</span>}
                      </div>
                    </td>
                    <td className="op-td" style={{ fontWeight: 700, color: "#111" }}>{o.customer}</td>
                    <td className="op-td" style={{ color: "#6b7280" }}>{o.vendor}</td>
                    <td className="op-td">
                      <div style={{ fontWeight: 700, color: "#111" }}>₹{o.amount.toFixed(2)}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{o.items} items</div>
                    </td>
                    <td className="op-td"><Badge status={o.payment} /></td>
                    <td className="op-td"><Badge status={o.delivery} /></td>
                    <td className="op-td" style={{ color: "#6b7280" }}>{o.date}</td>
                    <td className="op-td" onClick={e => e.stopPropagation()}>
                      <div className="op-acts"><ActionBtns o={o} /></div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="op-mob">
          {filtered.map(o => (
            <div key={o.id} className="op-mob-card" onClick={() => setDetailOrder(o)}>
              <div className="op-mob-top">
                <div>
                  <div className="op-id-wrap" style={{ marginBottom: 4 }}>
                    <span className="op-id">{o.id}</span>
                    {o.referral && <span className="op-ref">🎁 Referral</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{o.customer}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{o.vendor}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>₹{o.amount.toFixed(2)}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{o.items} items</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{o.date}</div>
                </div>
              </div>
              <div className="op-mob-badges">
                <div><span style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 2 }}>Payment</span><Badge status={o.payment} /></div>
                <div><span style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 2 }}>Delivery</span><Badge status={o.delivery} /></div>
              </div>
              <div className="op-mob-acts" onClick={e => e.stopPropagation()}>
                <div className="op-acts"><ActionBtns o={o} /></div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No orders found</div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {modal?.type === "edit" && (
        <UpdateDeliveryModal order={modal.order} onClose={() => setModal(null)}
          onSave={data => updateTracking(modal.order.id, data)} />
      )}
      {modal?.type === "assign" && (
        <AssignDeliveryModal order={modal.order} onClose={() => setModal(null)}
          onSave={data => updateTracking(modal.order.id, data)} />
      )}
      {modal?.type === "refund" && (
        <RefundModal order={modal.order} onClose={() => setModal(null)} />
      )}
    </div>
  );
}