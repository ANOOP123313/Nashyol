import { useState, useEffect } from "react";
import { Mail, Search, Copy, Download, Trash2, CheckCircle2, User, UserCheck, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cmsAPI } from "../services/api";

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "registered" | "guest"
  const [copied, setCopied] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await cmsAPI.getNewsletterSubscribers();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch subscribers error:", err);
      toast.error("Failed to load newsletter subscribers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from the newsletter subscriber list?`)) {
      return;
    }
    try {
      await cmsAPI.deleteNewsletterSubscriber(id);
      toast.success("Subscriber removed successfully");
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed to remove subscriber: " + err.message);
    }
  };

  const handleCopyEmails = () => {
    const emails = filteredSubscribers.map((s) => s.email).filter(Boolean);
    if (emails.length === 0) {
      toast.error("No subscriber emails to copy");
      return;
    }
    navigator.clipboard.writeText(emails.join(", "));
    setCopied(true);
    toast.success(`Copied ${emails.length} subscriber email(s) to clipboard`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      toast.error("No subscriber data to export");
      return;
    }
    const headers = ["User Name", "Email ID", "Type", "Phone", "Subscribed Date", "Status"];
    const rows = filteredSubscribers.map((s) => [
      `"${s.userName || "Guest"}"`,
      `"${s.email}"`,
      `"${s.isRegistered ? "Registered Customer" : "Guest"}"`,
      `"${s.userPhone || "—"}"`,
      `"${s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : "—"}"`,
      `"${s.isActive ? "Active" : "Inactive"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscriber list exported to CSV");
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.userName && s.userName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (typeFilter === "registered") return s.isRegistered;
    if (typeFilter === "guest") return !s.isRegistered;
    return true;
  });

  const totalCount = subscribers.length;
  const registeredCount = subscribers.filter((s) => s.isRegistered).length;
  const guestCount = subscribers.filter((s) => !s.isRegistered).length;
  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-[#F7931A] rounded-2xl">
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Newsletter Subscribers
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Users and email addresses subscribed to marketing newsletters
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSubscribers}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition shadow-sm"
            title="Refresh list"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCopyEmails}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Copy size={16} />
            <span>{copied ? "Copied!" : "Copy Emails"}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F7931A] hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition shadow-md"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Subscribers</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>{activeCount} active subscriptions</span>
          </p>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Registered Users</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#F7931A] mt-1">{registeredCount}</p>
          <p className="text-xs text-gray-500 mt-1">With profile account</p>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Guest Subscribers</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{guestCount}</p>
          <p className="text-xs text-gray-500 mt-1">Direct website signups</p>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Engagement</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {totalCount > 0 ? `${Math.round((registeredCount / totalCount) * 100)}%` : "0%"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Registered conversion</p>
        </div>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7931A]/30 focus:border-[#F7931A]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              typeFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setTypeFilter("registered")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              typeFilter === "registered" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Registered Users ({registeredCount})
          </button>
          <button
            onClick={() => setTypeFilter("guest")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              typeFilter === "guest" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Guests ({guestCount})
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={24} className="animate-spin text-[#F7931A]" />
            <p className="text-sm font-medium">Loading newsletter subscribers...</p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Mail size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-base font-semibold text-gray-700">No subscribers found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? `No results matching "${search}"` : "Subscribers will appear here when users submit the newsletter form."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase tracking-wider font-bold text-gray-400">
                <tr>
                  <th className="py-3.5 px-6">Subscriber</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">User Type</th>
                  <th className="py-3.5 px-6">Subscribed Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredSubscribers.map((item) => (
                  <tr key={item._id} className="hover:bg-orange-50/40 transition-colors">
                    {/* User */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          item.isRegistered ? "bg-orange-100 text-[#F7931A]" : "bg-gray-100 text-gray-500"
                        }`}>
                          {item.userName ? item.userName.slice(0, 2).toUpperCase() : <Mail size={15} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.userName || "Guest Visitor"}
                          </p>
                          {item.userPhone && (
                            <p className="text-xs text-gray-400">{item.userPhone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 font-mono text-gray-900 font-medium">
                      {item.email}
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-6">
                      {item.isRegistered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <UserCheck size={12} />
                          Registered Customer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          <User size={12} />
                          Guest Subscriber
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {item.subscribedAt ? new Date(item.subscribedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="size-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(item._id, item.email)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete subscriber"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
