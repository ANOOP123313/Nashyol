import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Building, 
  Warehouse as WarehouseIcon, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Eye, 
  Plus, 
  Download 
} from "lucide-react";
import { warehousesAPI } from "../services/api";
import { downloadCSV } from "../utils/exportCSV";

const AMBER = "#d97706";
const GREEN = "#16a34a";
const RED = "#dc2626";

function WarehouseAvatar({ name }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: "#fff7ed",
      border: "1.5px solid #fed7aa", color: AMBER, fontWeight: 700, fontSize: 18,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <WarehouseIcon size={22} color={AMBER} />
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "active";
  const isMaintenance = status === "maintenance";

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap"
  };

  if (isActive) {
    return (
      <span style={{
        ...baseStyle,
        background: "#10b981",
        color: "#fff"
      }}>
        <span style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "2px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9
        }}>
          ✓
        </span>
        Active
      </span>
    );
  }

  if (isMaintenance) {
    return (
      <span style={{
        ...baseStyle,
        background: "#fff",
        color: "#f59e0b",
        border: "1.5px solid #f59e0b"
      }}>
        <span style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "1.5px solid #f59e0b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9
        }}>
          !
        </span>
        Maintenance
      </span>
    );
  }

  return (
    <span style={{
      ...baseStyle,
      background: "#fff",
      color: "#ef4444",
      border: "1.5px solid #ef4444"
    }}>
      <span style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        border: "1.5px solid #ef4444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9
      }}>
        ×
      </span>
      Inactive
    </span>
  );
}

function MenuItem({ icon, label, onClick, color = "#374151" }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "11px 16px",
        background: hover ? "#f3f4f6" : "none",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        fontSize: 14,
        color,
        fontFamily: "inherit",
        fontWeight: 600
      }}
    >
      <span style={{ fontSize: 15, opacity: 0.7 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

const inp = {
  width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb",
  borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none",
  fontFamily: "inherit", background: "#fff"
};
const lbl = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#374151" };
const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
};
const modalBox = {
  background: "#fff", borderRadius: 16, padding: 32,
  width: "100%", maxWidth: 620, boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
  maxHeight: "90vh", overflowY: "auto"
};

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [detailWarehouse, setDetailWarehouse] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [form, setForm] = useState({
    name: "",
    code: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    capacity: 25000,
    status: "active"
  });

  const loadWarehouses = () => {
    setLoading(true);
    warehousesAPI.getAll()
      .then((res) => {
        const data = res.warehouses || res || [];
        setWarehouses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Warehouses fetch error:", err);
        toast.error("Failed to load warehouses");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(w => w.status === "active").length;
  const totalCapacity = warehouses.reduce((sum, w) => sum + (Number(w.capacity) || 0), 0);
  const activeRate = totalWarehouses > 0 ? ((activeWarehouses / totalWarehouses) * 100).toFixed(1) : "0.0";

  const filtered = warehouses.filter(w => {
    const q = search.toLowerCase();
    const matchSearch =
      (w.name || "").toLowerCase().includes(q) ||
      (w.code || "").toLowerCase().includes(q) ||
      (w.city || "").toLowerCase().includes(q) ||
      (w.contactPerson || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || (w.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const exportWarehouses = () => {
    downloadCSV(
      `warehouses-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Warehouse Name", "Code", "Contact Person", "Phone", "Email", "City", "State", "Capacity", "Status"],
      filtered.map((w) => [
        w.name,
        w.code,
        w.contactPerson,
        w.phone,
        w.email,
        w.city,
        w.state,
        w.capacity,
        w.status
      ])
    );
  };

  const handleAdd = async () => {
    if (!form.name || !form.code) {
      toast.error("Warehouse name and code are required");
      return;
    }
    try {
      await warehousesAPI.create(form);
      toast.success("Warehouse added successfully!");
      setForm({
        name: "",
        code: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        capacity: 25000,
        status: "active"
      });
      setShowAdd(false);
      loadWarehouses();
    } catch (err) {
      toast.error(err.message || "Failed to add warehouse");
    }
  };

  const handleAction = async (action, warehouse) => {
    setOpenMenu(null);
    if (action === "view") {
      setDetailWarehouse(warehouse);
      return;
    }
    try {
      if (action === "activate") {
        await warehousesAPI.update(warehouse._id, { status: "active" });
        toast.success("Warehouse activated");
      } else if (action === "deactivate") {
        await warehousesAPI.update(warehouse._id, { status: "inactive" });
        toast.success("Warehouse deactivated");
      } else if (action === "maintenance") {
        await warehousesAPI.update(warehouse._id, { status: "maintenance" });
        toast.success("Warehouse status set to Maintenance");
      } else if (action === "delete") {
        if (window.confirm(`Are you sure you want to delete "${warehouse.name}"?`)) {
          await warehousesAPI.delete(warehouse._id);
          toast.success("Warehouse deleted successfully");
        } else {
          return;
        }
      }
      loadWarehouses();
    } catch (err) {
      toast.error("Operation failed: " + err.message);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", padding: "32px 40px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 500,
              color: "#000",
              letterSpacing: "-0.5px"
            }}
          >
            Warehouses
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              color: "#6b7280",
              fontSize: 16
            }}
          >
            Manage fulfillment centers, inventory storage hubs, and facility locations
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={exportWarehouses} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 500, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowAdd(true)} style={{ background: AMBER, color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={18} /> Add Warehouse
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "#6b7280" }}>Total Warehouses</p>
          <p style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 500, color: "#111", lineHeight: 1 }}>{totalWarehouses}</p>
          <p style={{ margin: 0, fontSize: 13, color: GREEN, fontWeight: 500 }}>Live registered hubs</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "#6b7280" }}>Active Warehouses</p>
          <p style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 500, color: "#111", lineHeight: 1 }}>{activeWarehouses}</p>
          <p style={{ margin: 0, fontSize: 13, color: GREEN, fontWeight: 500 }}>{activeRate}% active rate</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "#6b7280" }}>Total Storage Capacity</p>
          <p style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 500, color: "#111", lineHeight: 1 }}>{totalCapacity.toLocaleString()}</p>
          <span style={{ background: AMBER, color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>Units capability</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "visible" }}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6" }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: 18, 
            fontWeight: 600, 
            color: "#111827" 
          }}>
            All Warehouses & Distribution Centers
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <Search size={18} strokeWidth={1.5} />
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search warehouses..."
                style={{ ...inp, width: 240, paddingLeft: 38 }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ ...inp, width: 140, cursor: "pointer" }}>
              {["All Status", "Active", "Inactive", "Maintenance"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Warehouse Name & Code", "Location", "Contact Person", "Capacity", "Status", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "14px 24px", fontSize: 13, color: "#9ca3af", fontWeight: 600, borderBottom: "1px solid #f3f4f6" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr
                key={w._id}
                style={{ borderBottom: "1px solid #f9fafb", cursor: "pointer" }}
                onClick={() => setDetailWarehouse(w)}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <WarehouseAvatar name={w.name} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{w.name}</div>
                      <div style={{ fontSize: 13, color: AMBER, fontWeight: 600, marginTop: 2 }}>{w.code}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "#374151" }}>
                    {w.city ? `${w.city}, ${w.state || ""}` : (w.address || "Location pending")}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>PIN: {w.pincode || "N/A"}</div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: "#374151" }}>{w.contactPerson || "Manager Assigned"}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{w.phone || w.email || "No direct phone"}</div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>
                    {(w.capacity || 0).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: "#6b7280" }}>units</span>
                  </div>
                  {w.currentOccupancy !== undefined && (
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {((w.currentOccupancy / (w.capacity || 1)) * 100).toFixed(0)}% used
                    </div>
                  )}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <StatusBadge status={w.status} />
                </td>
                <td style={{ padding: "16px 24px", position: "relative" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setOpenMenu(openMenu === w._id ? null : w._id);
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#9ca3af", padding: "4px 10px", borderRadius: 6 }}>
                    ⋮
                  </button>
                  {openMenu === w._id && (
                    <div style={{
                      position: "absolute", right: 20, top: 52,
                      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 300, minWidth: 195, overflow: "hidden"
                    }}>
                      <MenuItem
                        icon="👁"
                        label="View Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(null);
                          setDetailWarehouse(w);
                        }}
                      />
                      {w.status === "active" ? (
                        <MenuItem
                          icon="✕"
                          label="Deactivate"
                          onClick={(e) => { e.stopPropagation(); handleAction("deactivate", w); }}
                          color={RED}
                        />
                      ) : (
                        <MenuItem
                          icon="✓"
                          label="Activate"
                          onClick={(e) => { e.stopPropagation(); handleAction("activate", w); }}
                          color={GREEN}
                        />
                      )}
                      <MenuItem
                        icon="⚠️"
                        label="Set Maintenance"
                        onClick={(e) => { e.stopPropagation(); handleAction("maintenance", w); }}
                        color={AMBER}
                      />
                      <MenuItem
                        icon="🗑"
                        label="Delete Warehouse"
                        onClick={(e) => { e.stopPropagation(); handleAction("delete", w); }}
                        color={RED}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>No warehouses found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {openMenu && <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={() => setOpenMenu(null)} />}

      {/* Add Warehouse Modal */}
      {showAdd && (
        <div style={overlay} onClick={() => setShowAdd(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>Add New Warehouse</h2>
                <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: 14 }}>Add a new storage hub or fulfillment center to the network</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>✕</button>
            </div>
            <div style={{ borderTop: "1px solid #f3f4f6", margin: "20px 0" }} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Warehouse Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. West Coast Distribution Hub"
                  style={{ ...inp, borderColor: form.name ? AMBER : "#e5e7eb" }} />
              </div>
              <div>
                <label style={lbl}>Warehouse Code *</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WH-PUN-04"
                  style={{ ...inp, textTransform: "uppercase" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Contact Person Name</label>
                <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="Manager / Supervisor Name" style={inp} />
              </div>
              <div>
                <label style={lbl}>Contact Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 00000" style={inp} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Email Address</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="warehouse@nashyol.com" style={inp} />
              </div>
              <div>
                <label style={lbl}>Storage Capacity (Units)</label>
                <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                  placeholder="25000" style={inp} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>City</label>
                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Pune" style={inp} />
              </div>
              <div>
                <label style={lbl}>State</label>
                <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g. Maharashtra" style={inp} />
              </div>
              <div>
                <label style={lbl}>Pincode</label>
                <input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })}
                  placeholder="411001" style={inp} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Full Street Address</label>
              <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                rows={2} placeholder="Industrial Park, Plot No., Landmark..." style={{ ...inp, resize: "none" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setShowAdd(false)}
                style={{ padding: "11px 28px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
                Cancel
              </button>
              <button onClick={handleAdd}
                style={{
                  padding: "11px 28px", background: AMBER, color: "#fff", border: "none",
                  borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15,
                  opacity: (!form.name || !form.code) ? 0.55 : 1
                }}>
                Add Warehouse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {detailWarehouse && (
        <div style={overlay} onClick={() => setDetailWarehouse(null)}>
          <div style={{ ...modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Warehouse Details</h2>
              <button onClick={() => setDetailWarehouse(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <WarehouseAvatar name={detailWarehouse.name} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{detailWarehouse.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 13, color: AMBER, fontWeight: 700 }}>{detailWarehouse.code}</span>
                  <StatusBadge status={detailWarehouse.status} />
                </div>
              </div>
            </div>
            {[
              ["Contact Person", detailWarehouse.contactPerson || "Not specified"],
              ["Phone", detailWarehouse.phone || "Not specified"],
              ["Email", detailWarehouse.email || "Not specified"],
              ["Storage Capacity", `${(detailWarehouse.capacity || 0).toLocaleString()} units`],
              ["Current Occupancy", `${(detailWarehouse.currentOccupancy || 0).toLocaleString()} units`],
              ["City / State", `${detailWarehouse.city || ""} ${detailWarehouse.state ? `, ${detailWarehouse.state}` : ""}`.trim() || "N/A"],
              ["Pincode", detailWarehouse.pincode || "N/A"],
              ["Address", detailWarehouse.address || "N/A"],
            ].map(([k, val]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#6b7280", fontSize: 14 }}>{k}</span>
                <span style={{ fontWeight: 600, color: "#111", fontSize: 14, maxWidth: "60%", textAlign: "right" }}>{val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button onClick={() => setDetailWarehouse(null)}
                style={{ padding: "11px 28px", background: AMBER, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
