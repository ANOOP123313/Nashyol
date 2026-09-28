import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cmsAPI } from "../services/api";
import {
  Flame,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Headphones,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Sliders,
  Layers,
} from "lucide-react";

export default function TopOffers() {
  const [activeTab, setActiveTab] = useState("top_bar"); // "top_bar" or "clearance"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── 1. Top Bar Offers State (From Screenshot 3) ──
  const [topBarMessages, setTopBarMessages] = useState([
    "✨ Free shipping on orders over ₹500",
    "🎉 20% OFF on your first order - Use code: WELCOME20",
    "🔥 Flash Sale! Up to 50% OFF on selected items",
    "💎 New Arrivals - Shop the latest trends now",
    "🎁 Earn reward points with every purchase",
  ]);
  const [supportText, setSupportText] = useState("24/7 Customer Support 🎧");
  const [isTopBarActive, setIsTopBarActive] = useState(true);
  const [intervalSeconds, setIntervalSeconds] = useState(4);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Modal for Top Bar Message
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [editingMsgIndex, setEditingMsgIndex] = useState(null);
  const [msgInput, setMsgInput] = useState("");

  // ── 2. Clearance / Category Offers State ──
  const [clearanceSection, setClearanceSection] = useState(null);
  const [clearanceOffers, setClearanceOffers] = useState([]);
  const [clearanceTitle, setClearanceTitle] = useState("🔥 Clearance offers");
  const [clearanceSubtitle, setClearanceSubtitle] = useState("Unbeatable discounts on top categories");
  const [isClearanceActive, setIsClearanceActive] = useState(true);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Top Bar Offers
      const topBarRes = await cmsAPI.getTopBarOffers().catch(() => null);
      if (topBarRes && topBarRes.success) {
        if (Array.isArray(topBarRes.messages) && topBarRes.messages.length > 0) {
          setTopBarMessages(topBarRes.messages);
        }
        if (topBarRes.supportText) setSupportText(topBarRes.supportText);
        if (topBarRes.isActive !== undefined) setIsTopBarActive(topBarRes.isActive);
        if (topBarRes.intervalSeconds) setIntervalSeconds(topBarRes.intervalSeconds);
      }

      // 2. Fetch Clearance Section
      const secRes = await cmsAPI.getHomePageSections().catch(() => []);
      const sectionsList = Array.isArray(secRes) ? secRes : secRes?.data || [];
      const offerSec = sectionsList.find(
        (s) => s.sectionKey === "clearance_offers" || s.sectionType === "clearance_offers"
      );
      if (offerSec) {
        setClearanceSection(offerSec);
        setClearanceTitle(offerSec.title || "🔥 Clearance offers");
        setClearanceSubtitle(offerSec.subtitle || "Unbeatable discounts on top categories");
        setIsClearanceActive(offerSec.isActive !== false);
        setClearanceOffers(Array.isArray(offerSec.items) ? offerSec.items : []);
      }
    } catch (err) {
      console.error("Failed to load offers:", err);
      toast.error("Failed to load Top Offers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live top bar preview animation
  useEffect(() => {
    if (topBarMessages.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % topBarMessages.length);
    }, (intervalSeconds || 4) * 1000);
    return () => clearInterval(timer);
  }, [topBarMessages, intervalSeconds]);

  // Save Top Bar Offers
  const handleSaveTopBar = async (
    newMessages = topBarMessages,
    newSupport = supportText,
    newActive = isTopBarActive,
    newSecs = intervalSeconds
  ) => {
    setSaving(true);
    try {
      await cmsAPI.updateTopBarOffers({
        messages: newMessages,
        supportText: newSupport,
        isActive: newActive,
        intervalSeconds: Number(newSecs) || 4,
      });
      toast.success("Top bar announcements saved & updated on Client site!");
    } catch (err) {
      console.error("Failed to update top bar:", err);
      toast.error("Failed to update: " + (err.message || "Error"));
    } finally {
      setSaving(false);
    }
  };

  // Top Bar Modal Handlers
  const handleOpenAddMsg = () => {
    setEditingMsgIndex(null);
    setMsgInput("");
    setMsgModalOpen(true);
  };

  const handleOpenEditMsg = (idx) => {
    setEditingMsgIndex(idx);
    setMsgInput(topBarMessages[idx] || "");
    setMsgModalOpen(true);
  };

  const handleSaveMsgSubmit = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    let updated;
    if (editingMsgIndex !== null) {
      updated = [...topBarMessages];
      updated[editingMsgIndex] = msgInput.trim();
    } else {
      updated = [...topBarMessages, msgInput.trim()];
    }

    setTopBarMessages(updated);
    setMsgModalOpen(false);
    await handleSaveTopBar(updated);
  };

  const handleDeleteMsg = async (idx) => {
    if (topBarMessages.length <= 1) {
      toast.error("At least one announcement message is required");
      return;
    }
    const updated = topBarMessages.filter((_, i) => i !== idx);
    setTopBarMessages(updated);
    await handleSaveTopBar(updated);
  };

  const handleMoveMsg = async (idx, dir) => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= topBarMessages.length) return;
    const updated = [...topBarMessages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setTopBarMessages(updated);
    await handleSaveTopBar(updated);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Top Offers CMS</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Customize the Top Bar announcements and promotional offers displayed in the store header
            </p>
          </div>
        </div>

        {/* Action Button */}
        {activeTab === "top_bar" && (
          <button
            onClick={handleOpenAddMsg}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Announcement
          </button>
        )}
      </div>

      {/* Live Top Bar Header Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-orange-500" />
            Live Store Header Preview (matches the website top bar)
          </span>
          <span>{isTopBarActive ? "Status: Active" : "Status: Disabled"}</span>
        </div>

        <div className={`overflow-hidden rounded-xl shadow-md transition-opacity ${isTopBarActive ? "opacity-100" : "opacity-40"}`}>
          <div className="bg-gradient-to-r from-[#F7931A] via-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2 truncate flex-1">
              <span className="animate-pulse">✨</span>
              <p className="truncate">
                {topBarMessages[previewIndex] || topBarMessages[0] || "No message configured"}
              </p>
            </div>
            <div className="text-white/90 shrink-0 text-xs sm:text-sm flex items-center gap-1 ml-4">
              <span>{supportText || "24/7 Customer Support 🎧"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        <button
          onClick={() => setActiveTab("top_bar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "top_bar"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Top Bar Announcements</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
            {topBarMessages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("clearance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "clearance"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Clearance & Category Deals</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
            {clearanceOffers.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Top Bar Offers & Messages */}
      {activeTab === "top_bar" && (
        <div className="space-y-6">
          {/* Top Bar Settings Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              Top Bar Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-gray-400" />
                  Right-Side Support / Phone Text
                </label>
                <input
                  type="text"
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  placeholder="e.g. 24/7 Customer Support 🎧"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Rotation Speed (seconds per message)
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={() => {
                    const next = !isTopBarActive;
                    setIsTopBarActive(next);
                    handleSaveTopBar(topBarMessages, supportText, next, intervalSeconds);
                  }}
                  className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isTopBarActive
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {isTopBarActive ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" /> Active on Website
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-gray-400" /> Hidden on Website
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleSaveTopBar(topBarMessages, supportText, isTopBarActive, intervalSeconds)}
                  disabled={saving}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>

          {/* Messages Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Rotating Promotional Offers ({topBarMessages.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  These messages cycle automatically on the top bar in the user's browser
                </p>
              </div>
              <button
                onClick={handleOpenAddMsg}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Message
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-gray-400">Loading top bar offers...</div>
            ) : topBarMessages.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-400">
                No promotional messages yet. Click "Add Message" to create one.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {topBarMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {msg}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveMsg(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveMsg(idx, "down")}
                        disabled={idx === topBarMessages.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-20 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditMsg(idx)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                        title="Edit Message"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMsg(idx)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Clearance / Category Deals Cards */}
      {activeTab === "clearance" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Clearance & Top Brands Section Header
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={clearanceTitle}
                  onChange={(e) => setClearanceTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={clearanceSubtitle}
                  onChange={(e) => setClearanceSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={async () => {
                    if (!clearanceSection?._id) return;
                    setSaving(true);
                    try {
                      await cmsAPI.updateHomePageSection(clearanceSection._id, {
                        ...clearanceSection,
                        title: clearanceTitle,
                        subtitle: clearanceSubtitle,
                        isActive: isClearanceActive,
                      });
                      toast.success("Clearance offers header updated!");
                    } catch (err) {
                      toast.error("Failed to save: " + err.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition"
                >
                  {saving ? "Saving..." : "Save Clearance Header"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {clearanceOffers.map((offer, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-orange-400 dark:border-orange-500 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                      src={offer.image || "https://placehold.co/400x500?text=Offer"}
                      alt={offer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">
                      {offer.name || offer.title}
                    </h3>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                      {offer.price || offer.discount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Bar Message Add/Edit Modal */}
      {msgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {editingMsgIndex !== null ? "Edit Top Bar Announcement" : "Add Top Bar Announcement"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enter promotional message text that will display on the top announcement bar
            </p>

            <form onSubmit={handleSaveMsgSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Announcement Text *
                </label>
                <input
                  type="text"
                  required
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  placeholder="e.g. 🎉 20% OFF on your first order - Use code: WELCOME20"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 font-medium">Quick Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "✨ Free shipping on orders over ₹500",
                    "🎉 20% OFF on your first order - Use code: WELCOME20",
                    "🔥 Flash Sale! Up to 50% OFF on selected items",
                    "💎 New Arrivals - Shop the latest trends now",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMsgInput(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/40 text-left transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setMsgModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingMsgIndex !== null ? "Save Changes" : "Add Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
