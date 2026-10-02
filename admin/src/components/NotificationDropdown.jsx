import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  Package, 
  TrendingDown, 
  RotateCcw, 
  Ticket, 
  Star, 
  MessageSquare, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { notificationsAPI } from "../services/api";

function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_read_notifications") || "[]");
    } catch {
      return [];
    }
  });
  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_deleted_notifications") || "[]");
    } catch {
      return [];
    }
  });

  const fetchLiveNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAdminNotifications();
      if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error("Live notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const visibleNotifications = notifications.filter((n) => !deletedIds.includes(n.id));
  const unreadCount = visibleNotifications.filter((n) => !readIds.includes(n.id)).length;

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem("admin_read_notifications", JSON.stringify(updated));
      } catch {}
    }
  };

  const markAllAsRead = () => {
    const allIds = visibleNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem("admin_read_notifications", JSON.stringify(updated));
    } catch {}
  };

  const deleteNotification = (id) => {
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    try {
      localStorage.setItem("admin_deleted_notifications", JSON.stringify(updated));
    } catch {}
  };

  const clearAll = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...deletedIds, ...allIds]));
    setDeletedIds(updated);
    try {
      localStorage.setItem("admin_deleted_notifications", JSON.stringify(updated));
    } catch {}
  };

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "out_of_stock":
        return <TrendingDown size={17} className="text-red-600" />;
      case "low_stock":
        return <Package size={17} className="text-orange-500" />;
      case "return_request":
        return <RotateCcw size={17} className="text-purple-600" />;
      case "coupon_expired":
        return <Ticket size={17} className="text-amber-600" />;
      case "new_review":
        return <Star size={17} className="text-yellow-500" />;
      case "support_ticket":
        return <MessageSquare size={17} className="text-blue-600" />;
      case "order_cancelled":
        return <XCircle size={17} className="text-rose-600" />;
      default:
        return <AlertTriangle size={17} className="text-gray-500" />;
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case "out_of_stock":
        return "bg-red-50 border border-red-200";
      case "low_stock":
        return "bg-orange-50 border border-orange-200";
      case "return_request":
        return "bg-purple-50 border border-purple-200";
      case "coupon_expired":
        return "bg-amber-50 border border-amber-200";
      case "new_review":
        return "bg-yellow-50 border border-yellow-200";
      case "support_ticket":
        return "bg-blue-50 border border-blue-200";
      case "order_cancelled":
        return "bg-rose-50 border border-rose-200";
      default:
        return "bg-gray-50 border border-gray-200";
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "out_of_stock":
        return "bg-red-100 text-red-700 border-red-200";
      case "low_stock":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "return_request":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "coupon_expired":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "new_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "support_ticket":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "order_cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
          title="Notifications"
        >
          <Bell size={20} className="text-gray-600" />

          {unreadCount > 0 && (
            <>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#F7931A] rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 bg-[#F7931A] text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[420px] max-w-[95vw] p-0 mt-2 shadow-2xl rounded-2xl border border-gray-200 bg-white overflow-hidden"
        sideOffset={5}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                Live Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-[#F7931A] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              onClick={fetchLiveNotifications}
              disabled={loading}
              title="Refresh notifications"
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {visibleNotifications.length > 0 && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-[#F7931A] hover:text-[#E8850F] hover:bg-orange-50 h-7 px-2 font-medium"
                  >
                    <Check size={12} className="mr-1" />
                    Mark all as read
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 h-7 px-2 font-medium"
              >
                <Trash2 size={12} className="mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[460px]">
          {visibleNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 border border-gray-100 rounded-full mb-3 text-gray-400">
                <Bell size={22} />
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                No active notifications
              </p>
              <p className="text-xs text-gray-400">
                Inventory, returns, coupons, reviews, and support alerts will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visibleNotifications.map((item) => {
                const isRead = readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 hover:bg-gray-50 transition-colors group cursor-pointer relative ${
                      !isRead ? "bg-orange-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-xs mt-0.5 ${getIconBackground(item.type)}`}>
                        {getNotificationIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              !isRead ? "text-gray-900" : "text-gray-600"
                            }`}
                          >
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.badge && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyle(item.type)}`}>
                                {item.badge}
                              </span>
                            )}
                            {!isRead && (
                              <span className="w-2 h-2 bg-[#F7931A] rounded-full shrink-0"></span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 leading-snug line-clamp-2 mb-2">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{formatTimeAgo(item.timestamp)}</span>

                          <div
                            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isRead && (
                              <button
                                onClick={() => markAsRead(item.id)}
                                title="Mark as read"
                                className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-orange-600 transition"
                              >
                                <Check size={13} />
                              </button>
                            )}

                            <button
                              onClick={() => deleteNotification(item.id)}
                              title="Dismiss"
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {visibleNotifications.length > 0 && (
          <div className="p-2.5 border-t border-gray-100 bg-gray-50/70 text-center">
            <span className="text-[11px] text-gray-400 font-medium">
              Click any notification to navigate directly to its section
            </span>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}