import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";

import { Menu, X, Search, ChevronDown, Settings, LogOut } from "lucide-react";
import { menuItems } from "../config/menuItems";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { NotificationDropdown } from "../components/NotificationDropdown";
import { Toaster } from "../components/ui/sonner";
import { getToken, clearToken, authAPI } from "../services/api";
import { toast } from "sonner";

export function AdminLayout() {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem("adminUser") || localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch (_) {
      return null;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    authAPI.getMe()
      .then((res) => {
        const u = res?.user || res?.data || res;
        if (u && u.name) {
          setCurrentUser(u);
          localStorage.setItem("adminUser", JSON.stringify(u));
        }
      })
      .catch(() => { });
  }, []);

  const initials = currentUser?.name
    ? currentUser.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "AD";

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-20"
          } bg-[#111111] text-white transition-all duration-300 fixed inset-y-0 z-30 flex h-screen min-h-0 flex-col`}
      >

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1F2937] shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F7931A] rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">N4</span>
              </div>
              <span className="font-semibold">NAASHYOL</span>
            </div>
          )}

          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 pb-6 sidebar-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${isActive
                    ? "bg-[#F7931A]"
                    : "text-gray-300 hover:bg-[#1F2937]"
                  }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col h-full min-w-0 overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-20"
          }`}
      >

        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 w-full max-w-md">
            <Search className="text-gray-400 cursor-pointer" size={18} onClick={() => searchQuery.trim() && navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)} />
            <Input
              placeholder="Search products, orders, vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <div className="flex items-center gap-5">

            <NotificationDropdown />

            {/* Admin User Profile with Dropdown */}
            <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-3 border-l pl-4 cursor-pointer focus:outline-none select-none text-left"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                >
                  <Avatar>
                    <AvatarFallback className="bg-[#F7931A] text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser?.role === "admin"
                        ? "Super Admin"
                        : currentUser?.role || "Super Admin"}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 p-1.5 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                sideOffset={8}
              >
                {/* User Details Header */}
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-900 leading-none">
                    {currentUser?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {currentUser?.email || "admin@naashyol.com"}
                  </p>
                </div>

                {/* Settings Item */}
                <DropdownMenuItem
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer font-medium transition-colors"
                >
                  <Settings size={16} className="text-gray-500" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {/* Logout Item */}
                <DropdownMenuItem
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer font-medium transition-colors"
                >
                  <LogOut size={16} className="text-red-500" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full mx-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <LogOut size={20} />
              </div>
              <div>
                <h3 id="logout-title" className="text-base font-bold text-gray-900">
                  Are you sure you want to logout?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  You will be signed out of the Admin Panel.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  clearToken();
                  localStorage.removeItem("adminUser");
                  localStorage.removeItem("user");
                  sessionStorage.clear();
                  setIsLogoutModalOpen(false);
                  toast.success("Logged out successfully");
                  navigate("/login", { replace: true });
                }}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}