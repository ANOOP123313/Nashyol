import { useState, useRef, useEffect } from "react";
import { Search, Download, DollarSign, CreditCard, Check, TrendingUp, ChevronDown, RefreshCw, AlertCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { paymentsAPI } from "../services/api";
import { downloadCSV } from "../utils/exportCSV";
import { toast } from "sonner";

const CustomDropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  return (
    <div className="relative w-full sm:min-w-[140px]">
      <button
        ref={buttonRef}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={menuStyle}
          className="bg-white border border-gray-200 rounded-lg shadow-xl"
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg
                ${value === option
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <span>{option}</span>
              {value === option && (
                <Check size={14} className="text-orange-500 flex-shrink-0 ml-2" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidThisMonth: 0,
    totalTransactions: 0,
    paidCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.getAll();
      const list = res?.payments || (Array.isArray(res) ? res : []);
      setPayments(list);
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Payments fetch error:", err);
      toast.error("Failed to load payments from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await paymentsAPI.updateStatus(id, newStatus.toLowerCase());
      toast.success(`Payment marked as ${newStatus}`);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
      // Refresh stats
      fetchPayments();
    } catch (err) {
      toast.error(err.message || "Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusOptions = ["All Status", "Paid", "Pending", "Failed", "Refunded"];

  const filtered = payments.filter((p) => {
    const matchesSearch =
      `${p.name} ${p.email} ${p.phone || ""} ${p.orderId || ""} ${p.paymentId || ""} ${p.orders || ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const exportPayments = () => {
    downloadCSV(
      `payments-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Order ID", "Payment ID", "Customer", "Email", "Phone", "Amount", "Method", "Items", "Date", "Status"],
      filtered.map((payment) => [
        payment.orderId,
        payment.paymentId,
        payment.name,
        payment.email,
        payment.phone,
        payment.amountNum,
        payment.paymentMethod,
        payment.orders,
        payment.dueDate,
        payment.status,
      ])
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-6 min-h-screen font-sans" style={{ background: "#f3f4f6" }}>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
            Manage real customer payments and transaction records from the database
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Revenue</p>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                ₹{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="inline-flex items-center mt-1 sm:mt-2 text-xs text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded font-medium">
                {stats.paidCount} paid orders
              </span>
            </div>
            <div className="bg-orange-500 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center">
              <DollarSign size={18} className="text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Pending Payments</p>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                ₹{stats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="inline-flex items-center mt-1 sm:mt-2 text-xs text-orange-600 bg-orange-50 px-1.5 sm:px-2 py-0.5 rounded font-medium">
                {stats.pendingCount} pending
              </span>
            </div>
            <div className="bg-orange-100 p-2 sm:p-3 rounded-lg flex items-center justify-center">
              <CreditCard size={18} className="text-orange-600" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Paid This Month</p>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                ₹{stats.paidThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="inline-flex items-center mt-1 sm:mt-2 text-xs text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded font-medium">
                Current month
              </span>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex items-center justify-center">
              <Check size={18} className="text-blue-600" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">Total Transactions</p>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalTransactions}</h2>
              <span className="inline-flex items-center mt-1 sm:mt-2 text-xs text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded font-medium">
                Real DB Records
              </span>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">

        {/* Toolbar */}
        <div className="p-3 sm:p-4 lg:p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Customer Payments</h2>
            <p className="text-xs text-gray-500 mt-0.5">Showing {filtered.length} of {payments.length} transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 w-full sm:min-w-[200px] lg:min-w-[260px]">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by customer, email, order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="w-full sm:w-auto">
              <CustomDropdown options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
            </div>
            <button onClick={exportPayments} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-all">
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Items</th>
                <th className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 lg:px-5 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-sm">Loading payments from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 lg:px-5 py-12 text-center text-gray-500 text-xs sm:text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="size-8 text-gray-400" />
                      <span className="font-medium text-gray-700">No matching payments found</span>
                      <p className="text-xs text-gray-500">Try adjusting your search query or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer */}
                    <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4">
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{item.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5 break-all">{item.email}</div>
                      {item.phone && <div className="text-gray-400 text-[11px] mt-0.5">{item.phone}</div>}
                    </td>

                    {/* Amount & Method */}
                    <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4">
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm">{item.amount}</div>
                      <span className="inline-block text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-0.5">
                        {item.paymentMethod}
                      </span>
                    </td>

                    {/* Orders */}
                    <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 max-w-xs">
                      <div className="text-gray-800 text-xs sm:text-sm line-clamp-1 font-medium" title={item.orders}>
                        {item.orders}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <span>#{item.orderId?.slice(-8)?.toUpperCase()}</span>
                        <span>•</span>
                        <Link
                          to={`/orders/${item.orderId}`}
                          className="text-orange-600 hover:underline inline-flex items-center gap-0.5 text-[11px]"
                        >
                          View <ArrowUpRight size={10} />
                        </Link>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-gray-600 text-xs sm:text-sm whitespace-nowrap">
                      {item.dueDate}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Paid"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : item.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : item.status === "Failed"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions: Quick Status Change */}
                    <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {item.status !== "Paid" && (
                          <button
                            disabled={updatingId === item._id}
                            onClick={() => handleStatusChange(item._id, "Paid")}
                            className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors"
                            title="Mark payment as Paid"
                          >
                            Mark Paid
                          </button>
                        )}
                        {item.status === "Paid" && (
                          <button
                            disabled={updatingId === item._id}
                            onClick={() => handleStatusChange(item._id, "Refunded")}
                            className="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                            title="Mark payment as Refunded"
                          >
                            Refund
                          </button>
                        )}
                        {item.status !== "Pending" && item.status !== "Paid" && (
                          <button
                            disabled={updatingId === item._id}
                            onClick={() => handleStatusChange(item._id, "Pending")}
                            className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                            title="Mark payment as Pending"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}