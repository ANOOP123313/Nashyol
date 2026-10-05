import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Package, ShoppingCart, Store, User, ArrowRight, Eye } from "lucide-react";
import { productsAPI, ordersAPI, vendorsAPI, customersAPI } from "../services/api";

export function AdminSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    products: [],
    orders: [],
    vendors: [],
    customers: [],
  });
  const [selectedItemModal, setSelectedItemModal] = useState(null);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults({ products: [], orders: [], vendors: [], customers: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const qLower = trimmed.toLowerCase();

        const [prodsRes, ordersRes, vendorsRes, custRes] = await Promise.allSettled([
          productsAPI.getAll({ limit: 20 }),
          ordersAPI.getAll(),
          vendorsAPI.getAll(),
          customersAPI.getAll({ limit: 30 }),
        ]);

        // Products filtering
        let matchedProds = [];
        if (prodsRes.status === "fulfilled") {
          const list = Array.isArray(prodsRes.value) ? prodsRes.value : prodsRes.value?.products || [];
          matchedProds = list
            .filter((p) => {
              const title = (p.title || p.name || "").toLowerCase();
              const cat = (p.category?.name || p.category || "").toLowerCase();
              const sku = (p.variants?.[0]?.sku || p.SKU || "").toLowerCase();
              return title.includes(qLower) || cat.includes(qLower) || sku.includes(qLower);
            })
            .slice(0, 5);
        }

        // Orders filtering
        let matchedOrders = [];
        if (ordersRes.status === "fulfilled") {
          const list = Array.isArray(ordersRes.value) ? ordersRes.value : ordersRes.value?.orders || [];
          matchedOrders = list
            .filter((o) => {
              const num = (o.orderNumber || o._id || "").toLowerCase();
              const cust = (o.user?.name || o.user?.email || o.shippingAddress?.fullName || "").toLowerCase();
              return num.includes(qLower) || cust.includes(qLower);
            })
            .slice(0, 5);
        }

        // Vendors filtering
        let matchedVendors = [];
        if (vendorsRes.status === "fulfilled") {
          const list = Array.isArray(vendorsRes.value) ? vendorsRes.value : vendorsRes.value?.vendors || [];
          matchedVendors = list
            .filter((v) => {
              const name = (v.storeName || v.name || "").toLowerCase();
              const email = (v.email || "").toLowerCase();
              return name.includes(qLower) || email.includes(qLower);
            })
            .slice(0, 5);
        }

        // Customers filtering
        let matchedCustomers = [];
        if (custRes.status === "fulfilled") {
          const list = Array.isArray(custRes.value) ? custRes.value : custRes.value?.users || [];
          matchedCustomers = list
            .filter((u) => {
              const name = (u.name || "").toLowerCase();
              const email = (u.email || "").toLowerCase();
              const phone = (u.phone || "").toLowerCase();
              return name.includes(qLower) || email.includes(qLower) || phone.includes(qLower);
            })
            .slice(0, 5);
        }

        setResults({
          products: matchedProds,
          orders: matchedOrders,
          vendors: matchedVendors,
          customers: matchedCustomers,
        });
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const totalResultsCount =
    results.products.length +
    results.orders.length +
    results.vendors.length +
    results.customers.length;

  const handleSelectProduct = (p) => {
    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(p.title || p.name || "")}`);
  };

  const handleSelectOrder = () => {
    setIsOpen(false);
    navigate(`/orders`);
  };

  const handleSelectVendor = (v) => {
    setIsOpen(false);
    if (v._id) {
      navigate(`/vendorsdetails/${v._id}`);
    } else {
      navigate(`/vendors`);
    }
  };

  const handleSelectCustomer = (c) => {
    setIsOpen(false);
    setSelectedItemModal({
      type: "Customer",
      title: c.name || "Customer",
      data: {
        "Full Name": c.name || "—",
        "Email Address": c.email || "—",
        "Phone Number": c.phone || "—",
        "Account Role": c.role || "customer",
        "Joined Date": c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
        "Account Status": c.isBlocked ? "Blocked" : "Active",
      },
      actionLink: `/customers`,
      actionLabel: "View Customers Page",
    });
  };

  const handleShowDetails = (item, type, e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (type === "Product") {
      setSelectedItemModal({
        type: "Product",
        title: item.title || item.name,
        image: item.images?.[0] || item.variants?.[0]?.image,
        description: item.description,
        data: {
          "Price": `₹${item.price || item.variants?.[0]?.sellingPrice || 0}`,
          "Category": item.category?.name || item.category || "—",
          "Subcategory": item.subCategory || "—",
          "SKU / Code": item.variants?.[0]?.sku || item.SKU || "—",
          "Current Stock": `${item.variants?.[0]?.currentStock ?? item.stock ?? 0} units`,
          "Status": item.isActive !== false ? "Active" : "Inactive",
        },
        actionLink: `/products`,
        actionLabel: "Open Products Page",
      });
    } else if (type === "Order") {
      const addr = item.shippingAddress;
      const formattedAddress = addr
        ? [addr.fullName, addr.phone, addr.addressLine1 || addr.address, addr.addressLine2, addr.city, addr.state, addr.postalCode || addr.pincode, addr.country]
            .filter(Boolean)
            .join(", ")
        : "—";

      setSelectedItemModal({
        type: "Order",
        title: item.orderNumber || `Order #${String(item._id).slice(-6).toUpperCase()}`,
        items: item.items || [],
        data: {
          "Customer Name": item.user?.name || addr?.fullName || "—",
          "Customer Email": item.user?.email || "—",
          "Total Amount": `₹${(item.totalAmount || 0).toFixed(2)}`,
          "Order Status": item.orderStatus || item.status || "pending",
          "Payment Status": item.paymentStatus || item.paymentInfo?.status || "—",
          "Payment Method": item.paymentMethod || item.paymentInfo?.method || "—",
          "Shipping Address": formattedAddress,
          "Placed On": item.createdAt ? new Date(item.createdAt).toLocaleString() : "—",
          "Items Count": `${item.items?.length || 0} item(s)`,
        },
        actionLink: `/orders`,
        actionLabel: "Open Order Details Page",
      });
    } else if (type === "Vendor") {
      setSelectedItemModal({
        type: "Vendor",
        title: item.storeName || item.name || "Vendor",
        data: {
          "Store Name": item.storeName || item.name || "—",
          "Contact Email": item.email || "—",
          "Phone Number": item.phone || "—",
          "Approval Status": item.approvalStatus || item.status || "—",
          "Total Revenue": `₹${(item.totalRevenue || 0).toFixed(2)}`,
          "Products Count": `${item.productsCount || item.products?.length || 0}`,
        },
        actionLink: item._id ? `/vendorsdetails/${item._id}` : `/vendors`,
        actionLabel: "Open Vendor Profile",
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Search products, orders, vendors, customers..."
          className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F7931A]/30 focus:border-[#F7931A] transition-all"
        />
        <div className="absolute right-3 flex items-center gap-1">
          {loading && <Loader2 size={16} className="animate-spin text-[#F7931A]" />}
          {!loading && query && (
            <button
              onClick={() => {
                setQuery("");
                setResults({ products: [], orders: [], vendors: [], customers: [] });
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-[460px] md:left-0 md:right-0 md:w-full top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] sm:max-h-[480px] overflow-y-auto">
          {loading && totalResultsCount === 0 && (
            <div className="p-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-[#F7931A]" />
              <span>Searching across catalog, orders, and users...</span>
            </div>
          )}

          {!loading && totalResultsCount === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No matching products, orders, or vendors found for "{query}".
            </div>
          )}

          {/* Products */}
          {results.products.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Package size={14} className="text-[#F7931A]" />
                Products ({results.products.length})
              </div>
              {results.products.map((p) => {
                const img = p.images?.[0] || p.variants?.[0]?.image;
                const price = p.price || p.variants?.[0]?.sellingPrice || 0;
                return (
                  <div
                    key={p._id}
                    onClick={() => handleSelectProduct(p)}
                    className="flex items-center justify-between p-2.5 hover:bg-orange-50/70 rounded-xl cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="size-9 object-cover rounded-lg border flex-shrink-0"
                        />
                      ) : (
                        <div className="size-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#F7931A]">
                          {p.title || p.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.category?.name || p.category || "General"} • ₹{price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={(e) => handleShowDetails(p, "Product", e)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition"
                        title="Quick View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#F7931A] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Orders */}
          {results.orders.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <ShoppingCart size={14} className="text-blue-500" />
                Orders ({results.orders.length})
              </div>
              {results.orders.map((o) => (
                <div
                  key={o._id}
                  onClick={() => handleSelectOrder(o)}
                  className="flex items-center justify-between p-2.5 hover:bg-blue-50/70 rounded-xl cursor-pointer group transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
                      {o.orderNumber || `ORD-${String(o._id).slice(-6).toUpperCase()}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {o.user?.name || o.user?.email || "Customer"} • ₹{(o.totalAmount || 0).toFixed(2)} •{" "}
                      <span className="capitalize">{o.orderStatus}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={(e) => handleShowDetails(o, "Order", e)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition"
                      title="Quick View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vendors */}
          {results.vendors.length > 0 && (
            <div className="p-2 border-b border-gray-100">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Store size={14} className="text-emerald-500" />
                Vendors ({results.vendors.length})
              </div>
              {results.vendors.map((v) => (
                <div
                  key={v._id}
                  onClick={() => handleSelectVendor(v)}
                  className="flex items-center justify-between p-2.5 hover:bg-emerald-50/70 rounded-xl cursor-pointer group transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-emerald-600">
                      {v.storeName || v.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {v.email} • Status: {v.approvalStatus || v.status || "Active"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={(e) => handleShowDetails(v, "Vendor", e)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition"
                      title="Quick View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <User size={14} className="text-purple-500" />
                Customers ({results.customers.length})
              </div>
              {results.customers.map((c) => (
                <div
                  key={c._id}
                  onClick={() => handleSelectCustomer(c)}
                  className="flex items-center justify-between p-2.5 hover:bg-purple-50/70 rounded-xl cursor-pointer group transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-600">
                      {c.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {c.email || c.phone || "No contact"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => handleSelectCustomer(c)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Details Modal when clicked or if no direct detail page exists */}
      {selectedItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-hidden"
          onClick={() => setSelectedItemModal(null)}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 shrink-0 pb-3 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#F7931A] bg-orange-50 px-2.5 py-1 rounded-full mb-1">
                  {selectedItemModal.type} Details
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words leading-snug">
                  {selectedItemModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemModal(null)}
                className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain py-3 space-y-3 min-h-0 pr-1">
              {selectedItemModal.image && (
                <div className="shrink-0 max-h-48 sm:max-h-56 rounded-2xl overflow-hidden bg-gray-50 border flex items-center justify-center">
                  <img
                    src={selectedItemModal.image}
                    alt=""
                    className="w-full h-full object-contain max-h-48 sm:max-h-56"
                  />
                </div>
              )}

              {selectedItemModal.description && (
                <div className="p-3 rounded-xl bg-orange-50/40 border border-orange-100/60 text-xs sm:text-sm">
                  <span className="font-bold text-orange-950 block mb-1">Product Description</span>
                  <p className="text-gray-700 leading-relaxed break-words whitespace-pre-line">
                    {selectedItemModal.description}
                  </p>
                </div>
              )}

              {selectedItemModal.items && selectedItemModal.items.length > 0 && (
                <div className="p-3 rounded-xl bg-gray-50/90 border border-gray-100 text-xs sm:text-sm space-y-2">
                  <span className="font-bold text-gray-600 block">Ordered Items ({selectedItemModal.items.length})</span>
                  <div className="space-y-1.5 divide-y divide-gray-200/60 max-h-40 overflow-y-auto pr-1">
                    {selectedItemModal.items.map((it, idx) => (
                      <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between gap-3">
                        <span className="text-gray-800 font-medium break-words leading-tight flex-1">
                          {it.title || it.name || it.product?.title || "Item"} {it.quantity ? `× ${it.quantity}` : ""}
                        </span>
                        <span className="text-gray-900 font-bold shrink-0">
                          ₹{((it.price || it.unitPrice || 0) * (it.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {Object.entries(selectedItemModal.data || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-xs sm:text-sm gap-1 sm:gap-4"
                  >
                    <span className="font-semibold text-gray-500 shrink-0">{key}</span>
                    <span className="font-bold text-gray-900 break-words text-left sm:text-right select-all leading-relaxed max-w-full sm:max-w-[65%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned Modal Footer */}
            <div className="flex gap-2.5 sm:gap-3 pt-3 shrink-0 border-t border-gray-100 mt-auto">
              <button
                onClick={() => setSelectedItemModal(null)}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Close
              </button>
              {selectedItemModal.actionLink && (
                <button
                  onClick={() => {
                    const link = selectedItemModal.actionLink;
                    setSelectedItemModal(null);
                    navigate(link);
                  }}
                  className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-[#F7931A] hover:bg-orange-600 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>{selectedItemModal.actionLabel || "View Page"}</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
