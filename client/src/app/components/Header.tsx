import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, User, Heart, Package, LogOut, ChevronDown, Sun, Moon, X, Gift } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useFilter } from "../contexts/FilterContext";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useAuth } from "../contexts/AuthContext";
import { CartDrawer } from "./CartDrawer";
import { useTheme } from "../contexts/ThemeContext";
import { categoriesApi } from "@/services/api";

const logoImage = "/logo.png";

const FALLBACK_NAV_CATEGORIES = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "💻",
    description: "Smartphones, Laptops, Audio Gear & Smart Accessories",
    subCategories: [
      { name: "Smartphones", slug: "smartphones", icon: "📱", productCount: 10 },
      { name: "Laptops & Computers", slug: "laptops", icon: "💻", productCount: 1 },
      { name: "Headphones & Audio", slug: "audio", icon: "🎧", productCount: 1 },
      { name: "Gaming & Consoles", slug: "gaming", icon: "🎮", productCount: 1 },
      { name: "Smart Watches", slug: "smartwatches", icon: "⌚", productCount: 0 },
      { name: "Cameras & Photography", slug: "cameras", icon: "📷", productCount: 0 },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👕",
    description: "Trending Men & Women Apparel, Shoes, and Accessories",
    subCategories: [
      { name: "T-Shirts & Shirts", slug: "shirts", icon: "👕", productCount: 5 },
      { name: "Dresses & Tops", slug: "dresses", icon: "👗", productCount: 1 },
      { name: "Jackets & Coats", slug: "jackets", icon: "🧥", productCount: 1 },
      { name: "Bags & Luggage", slug: "bags", icon: "👜", productCount: 1 },
      { name: "Watches", slug: "watches", icon: "⌚", productCount: 1 },
    ],
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    icon: "🏡",
    description: "Modern Living Room, Bedroom & Kitchen Essentials",
    subCategories: [
      { name: "Furniture", slug: "furniture", icon: "🛋️", productCount: 1 },
      { name: "Lighting", slug: "lighting", icon: "💡", productCount: 1 },
      { name: "Plants & Garden", slug: "plants", icon: "🪴", productCount: 1 },
      { name: "Home Decor", slug: "decor", icon: "🖼️", productCount: 0 },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    icon: "⚽",
    description: "Professional Sports Equipment, Activewear & Outdoor Gear",
    subCategories: [
      { name: "Fitness & Gym Equipment", slug: "fitness", icon: "🏋️", productCount: 1 },
      { name: "Dumbbells & Weights", slug: "dumbbells", icon: "🏋️‍♂️", productCount: 1 },
      { name: "Tennis & Racket Sports", slug: "tennis", icon: "🎾", productCount: 1 },
      { name: "Outdoor & Camping", slug: "outdoor-gear", icon: "⛺", productCount: 1 },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty",
    icon: "💄",
    description: "Skincare, Cosmetics, Perfumes, & Wellness",
    subCategories: [
      { name: "Skincare", slug: "skincare", icon: "🧴", productCount: 4 },
      { name: "Lip Care & Lipstick", slug: "lipstick", icon: "💋", productCount: 1 },
      { name: "Perfumes & Fragrances", slug: "perfumes", icon: "🌸", productCount: 0 },
    ],
  },
  {
    name: "Books & Media",
    slug: "books",
    icon: "📚",
    description: "Fiction, Non-Fiction, Self-Help, Business, & Academic Books",
    subCategories: [
      { name: "Fiction", slug: "fiction", icon: "📖", productCount: 1 },
      { name: "Self-Help & Business", slug: "self-help", icon: "💡", productCount: 1 },
      { name: "Biographies & Memoirs", slug: "biographies", icon: "✍️", productCount: 1 },
      { name: "Science & Technology", slug: "science", icon: "🔬", productCount: 1 },
    ],
  },
];

export function Header() {
  const navigate = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [hoveredCatSlug, setHoveredCatSlug] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.list(true)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Header categories fetch error:", err));
  }, []);

  const navCategories = categories.length > 0 ? categories : FALLBACK_NAV_CATEGORIES;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { wishlistCount } = useWishlist();
  const { items, updateQuantity, removeItem, openDrawer, isDrawerOpen } = useCart();

  // Dynamic promotional messages
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const promoMessages = [
    "✨ Free shipping on orders over ₹500",
    "🎉 20% OFF on your first order - Use code: WELCOME20",
    "🔥 Flash Sale! Up to 50% OFF on selected items",
    "💎 New Arrivals - Shop the latest trends now",
    "🎁 Earn reward points with every purchase",
  ];

  // Rotate promotional messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const cartItemsCount = items.length;

  // const categories = [
  //   "electronics",
  //   "Fashion",
  //   "Home & Garden",
  //   "Sports",
  //   "Beauty",
  //   "Books",
  // ];

  // Check if current page should show filter button
  // const showFilterButton =
  //   pathname === "/products" ||
  //   pathname === "/electronics" ||
  //   pathname === "/home-garden" ||
  //   pathname === "/sports" ||
  //   pathname === "/beauty" ||
  //   pathname === "/books";

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-navbar shadow-lg">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[var(--primary-color)] via-orange-500 to-orange-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm font-medium">

            <div className="hidden md:block flex-1 overflow-hidden">
              <p
                key={currentPromoIndex}
                className="animate-[slideIn_0.5s_ease-in-out]"
              >
                {promoMessages[currentPromoIndex]}
              </p>
            </div>

            <p className="md:ml-auto text-white/90">
              24/7 Customer Support 🎧
            </p>

          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src={logoImage}
              alt="NAASHYOL"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products, brands, and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 h-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle - Hidden on mobile */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Wishlist - Hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted text-foreground hidden md:flex"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="size-5 text-muted-foreground hover:text-foreground" />
                {wishlistCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-inverse text-xs font-bold"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Cart - Hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted text-foreground hidden md:flex"
              onClick={openDrawer}
            >
              <ShoppingCart className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
              {cartItemsCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-inverse text-xs font-bold"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>

            {/* User Menu - Hidden on mobile */}
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-muted text-foreground"
                    >
                      <User className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-3 p-2">
                      <div className="size-10 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-full flex items-center justify-center text-inverse font-semibold">
                        {(user.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <User className="size-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer">
                        <Package className="size-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/rewards" className="cursor-pointer">
                        <Gift className="size-4 mr-2" />
                        Rewards & Coupons
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 cursor-pointer"
                      onClick={() => { logout(); navigate.push("/"); }}
                    >
                      <LogOut className="size-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>

            {/* Mobile Hamburger Menu - Visible ONLY on mobile */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-muted text-foreground active:scale-95 transition-transform touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                    touchAction: 'manipulation',
                  }}
                >
                  <Menu className="size-5 text-muted-foreground hover:text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader className="sr-only">
                  <SheetTitle>Mobile Menu</SheetTitle>
                  <SheetDescription>Navigate through NAASHYOL marketplace</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Link
                      href="/"
                      className="flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <img
                        src={logoImage}
                        alt="NAASHYOL"
                        className="h-10 w-auto object-contain dark:brightness-0 dark:invert"
                      />
                    </Link>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 p-4 glass-card rounded-xl mb-4">
                    {user ? (
                      <>
                        <div className="size-12 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-full flex items-center justify-center text-inverse font-semibold">
                          {(user.name || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm dark:text-inverse">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center gap-3 w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="size-12 bg-muted rounded-full flex items-center justify-center">
                          <User className="size-6 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-sm text-muted-foreground">Sign In</span>
                      </Link>
                    )}
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                      <Link
                        href="/"
                        className="block px-4 py-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors active:scale-95 touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                          touchAction: 'manipulation',
                        }}
                      >
                        Home
                      </Link>
                      <Link
                        href="/products"
                        className="block px-4 py-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors active:scale-95 touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                          touchAction: 'manipulation',
                        }}
                      >
                        All Products
                      </Link>
                      <div className="px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Categories
                        </span>
                        <Link
                          href="/category"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs font-semibold text-[var(--primary-color)] hover:underline"
                        >
                          All Categories
                        </Link>
                      </div>

                      <div className="space-y-1">
                        {navCategories.map((cat) => {
                          const isExpanded = mobileExpandedCat === (cat.slug || cat.name);
                          const hasSubs = Array.isArray(cat.subCategories) && cat.subCategories.length > 0;

                          return (
                            <div key={cat._id || cat.slug || cat.name} className="rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted">
                                <Link
                                  href={`/category?category=${encodeURIComponent(cat.name)}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center gap-2 flex-1 font-medium text-sm text-foreground"
                                >
                                  <span>{cat.icon || "📦"}</span>
                                  <span>{cat.name}</span>
                                </Link>
                                {hasSubs && (
                                  <button
                                    type="button"
                                    onClick={() => setMobileExpandedCat(isExpanded ? null : (cat.slug || cat.name))}
                                    className="p-1 rounded-lg hover:bg-muted-foreground/10 text-muted-foreground"
                                    aria-label="Toggle subcategories"
                                  >
                                    <ChevronDown className={`size-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                  </button>
                                )}
                              </div>

                              {isExpanded && hasSubs && (
                                <div className="pl-6 pr-2 py-1 space-y-0.5 bg-muted/40 rounded-xl mb-1">
                                  {cat.subCategories.map((sub: any) => {
                                    const subName = typeof sub === "string" ? sub : sub.name;
                                    const subCount = sub.productCount || 0;
                                    return (
                                      <Link
                                        key={sub._id || sub.slug || subName}
                                        href={`/category?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(subName)}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center justify-between py-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                                      >
                                        <span className="truncate">{subName}</span>
                                        {subCount > 0 && (
                                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                            {subCount}
                                          </span>
                                        )}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="h-px bg-border my-3" />

                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors active:scale-95 touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Heart className="size-5" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <Badge className="ml-auto bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-inverse">
                            {wishlistCount}
                          </Badge>
                        )}
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors active:scale-95 touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Package className="size-5" />
                        My Orders
                      </Link>

                      <Link
                        href="/rewards"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted font-medium text-foreground transition-colors active:scale-95 touch-manipulation"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                          WebkitTapHighlightColor: 'rgba(247, 147, 26, 0.2)',
                          touchAction: 'manipulation',
                        }}
                      >
                        <Gift className="size-5" />
                        Rewards & Coupons
                      </Link>

                      <div className="h-px bg-border my-3" />

                      <div className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                        Theme
                      </div>
                      <div className="px-4 py-2">
                        <ThemeToggle />
                      </div>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar - Below logo on mobile only */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 h-11 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-full touch-manipulation"
              style={{
                WebkitUserSelect: 'text',
                userSelect: 'text',
                touchAction: 'manipulation',
              }}
              autoComplete="off"
            />
          </form>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="border-t border-border bg-background/95 backdrop-blur hidden md:block relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 h-12 overflow-visible">
            <Link
              href="/products"
              className="text-sm font-semibold text-foreground hover:text-[var(--primary-color)] transition-colors py-3 whitespace-nowrap"
            >
              All Products
            </Link>

            {navCategories.map((cat) => {
              const hasSubs = Array.isArray(cat.subCategories) && cat.subCategories.length > 0;
              const catTarget = `/category?category=${encodeURIComponent(cat.name)}`;

              return (
                <div
                  key={cat._id || cat.slug || cat.name}
                  className="relative group py-3"
                  onMouseEnter={() => setHoveredCatSlug(cat.slug || cat.name)}
                  onMouseLeave={() => setHoveredCatSlug(null)}
                >
                  <Link
                    href={catTarget}
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground/85 hover:text-[var(--primary-color)] transition-colors whitespace-nowrap"
                  >
                    <span className="text-base">{cat.icon || "📦"}</span>
                    <span>{cat.name}</span>
                    {hasSubs && (
                      <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-[var(--primary-color)] transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Hover Mega Dropdown */}
                  {hasSubs && (
                    <div className="absolute top-full left-0 w-[540px] max-w-[90vw] pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-background/95 dark:bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-5 overflow-hidden">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{cat.icon || "📦"}</span>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{cat.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{cat.description || "Browse top categories"}</p>
                            </div>
                          </div>
                          <Link
                            href={catTarget}
                            className="text-xs font-semibold text-[var(--primary-color)] hover:underline shrink-0 flex items-center gap-1"
                          >
                            View All
                            <span>→</span>
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {cat.subCategories.slice(0, 10).map((sub: any) => {
                            const subName = typeof sub === "string" ? sub : sub.name;
                            const subCount = sub.productCount || 0;
                            const subIcon = sub.icon || "📁";
                            return (
                              <Link
                                key={sub._id || sub.slug || subName}
                                href={`/category?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(subName)}`}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/70 transition-colors group/item"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm shrink-0">{subIcon}</span>
                                  <span className="text-xs font-medium text-foreground group-hover/item:text-[var(--primary-color)] truncate transition-colors">
                                    {subName}
                                  </span>
                                </div>
                                {subCount > 0 && (
                                  <span className="ml-2 text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0 group-hover/item:bg-[var(--primary-color)]/10 group-hover/item:text-[var(--primary-color)]">
                                    {subCount}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/category"
              className="ml-auto text-xs font-bold text-[var(--primary-color)] hover:underline whitespace-nowrap transition-colors"
            >
              Explore Categories →
            </Link>
          </nav>
        </div>
      </div>

    </header>
  );
}


