"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Star,
  Heart,
  SlidersHorizontal,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";


// ─── Category Metadata ───────────────────────────────────────────────────────

const categoryMeta: Record<
  string,
  {
    title: string;
    subtitle: string;
    gradient: string;
    accentColor: string;
  }
> = {
  Fashion: {
    title: "Fashion",
    subtitle: "Discover the latest trends in clothing, footwear & accessories",
    gradient: "from-pink-600 via-rose-500 to-orange-400",
    accentColor: "#F43F5E",
  },
  Electronics: {
    title: "Electronics",
    subtitle: "Cutting-edge gadgets, devices & tech accessories",
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    accentColor: "#06B6D4",
  },
  "Home & Garden": {
    title: "Home & Garden",
    subtitle: "Everything you need to make your space beautiful",
    gradient: "from-green-600 via-emerald-500 to-teal-400",
    accentColor: "#10B981",
  },
  Sports: {
    title: "Sports",
    subtitle: "Premium gear for every sport & fitness goal",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    accentColor: "#F59E0B",
  },
  Beauty: {
    title: "Beauty",
    subtitle: "Skincare, makeup & wellness essentials",
    gradient: "from-purple-600 via-pink-500 to-rose-400",
    accentColor: "#A855F7",
  },
  Books: {
    title: "Books",
    subtitle: "Explore worlds through fiction, knowledge & inspiration",
    gradient: "from-indigo-600 via-blue-500 to-sky-400",
    accentColor: "#6366F1",
  },
};



// ─── Inner Page Component ─────────────────────────────────────────────────────

import { productsApi } from "@/services/api";
import { useEffect } from "react";
import { useCategorySubcategories } from "@/services/categorySubcategories";

function mapBackendProduct(p: any) {
  const v = p.variants?.[0] || {};
  return {
    id: p._id,
    _id: p._id,
    name: p.title || p.name,
    category: p.category?.name || p.category || "",
    subcategory: p.subCategory || p.subcategory || "",
    price: p.offerPrice || v.sellingPrice || p.price || 0,
    originalPrice: p.offerPrice ? p.price : undefined,
    image: v.image || p.images?.[0] || "https://placehold.co/400x400?text=No+Image",
    rating: 4.8,
    reviewsCount: p.reviews?.length || 12,
    badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
    inStock: (v.currentStock ?? 1) > 0,
  };
}

function CategoryPageInner() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "Fashion";
  const subcategoryParam = searchParams.get("subcategory");

  const { subcategories } = useCategorySubcategories(categoryParam);

  const meta = categoryMeta[categoryParam] || {
    title: categoryParam,
    subtitle: "Explore our collection of quality products",
    gradient: "from-orange-600 via-amber-500 to-yellow-400",
    accentColor: "#F97316",
  };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    productsApi.list({
      category: categoryParam,
      subcategory: subcategoryParam || undefined,
    })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res.products || [];
        let mapped = raw.map(mapBackendProduct);
        if (subcategoryParam) {
          const normalize = (s: string) => (s || "").toLowerCase().replace(/[\s\-_&,]+/g, "");
          const subNorm = normalize(subcategoryParam);
          const subFiltered = mapped.filter((p) => {
            const prodSubNorm = normalize(p.subcategory);
            const prodNameNorm = normalize(p.name);
            return prodSubNorm.includes(subNorm) || subNorm.includes(prodSubNorm) || prodNameNorm.includes(subNorm);
          });
          if (subFiltered.length > 0) {
            mapped = subFiltered;
          }
        }
        setProducts(mapped);
      })
      .catch((err) => {
        console.error("Category products fetch error:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [categoryParam, subcategoryParam]);

  const priceRanges = [
    { label: "Under ₹1,000", value: "0-1000" },
    { label: "₹1,000 – ₹5,000", value: "1000-5000" },
    { label: "₹5,000 – ₹20,000", value: "5000-20000" },
    { label: "₹20,000 – ₹50,000", value: "20000-50000" },
    { label: "Over ₹50,000", value: "50000-999999" },
  ];


  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
        <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-foreground mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedMinRating === rating}
                onCheckedChange={() => setSelectedMinRating(selectedMinRating === rating ? null : rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`size-3.5 ${i < rating ? "fill-[var(--primary-color)] text-[var(--primary-color)]" : "text-muted"}`} />
                ))}
                <span className="ml-1 text-muted-foreground">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="font-semibold text-foreground mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="in-stock" />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer text-foreground dark:text-muted">In Stock</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="on-sale" />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer text-foreground dark:text-muted">On Sale</Label>
          </div>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={() => { setSelectedPriceRange(""); setSelectedMinRating(null); }}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-transparent relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/25 via-red-500/15 to-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/15 via-orange-500/15 to-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">

        {/* ── 1. HERO HEADER ─────────────────────────────────────────────────── */}
        <div className={`bg-gradient-to-r ${meta.gradient} relative overflow-hidden`}>
          {/* Decorative overlay pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-inverse/70 text-sm mb-4">
              <Link href="/products" className="hover:text-inverse transition-colors">All Products</Link>
              <ChevronRight className="w-4 h-4" />
              {subcategoryParam ? (
                <>
                  <Link href={`/category?category=${encodeURIComponent(categoryParam)}`} className="hover:text-inverse transition-colors">
                    {categoryParam}
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-inverse font-medium">{subcategoryParam}</span>
                </>
              ) : (
                <span className="text-inverse font-medium">{categoryParam}</span>
              )}
            </nav>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-inverse mb-3 tracking-tight">
              {subcategoryParam ?? meta.title}
            </h1>
            <p className="text-inverse/85 text-base sm:text-lg max-w-xl">
              {meta.subtitle}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-background/20 backdrop-blur-sm text-inverse text-sm font-medium px-4 py-1.5 rounded-full">
                <ShoppingBag className="w-4 h-4" />
                {products.length} products
              </span>
              <Link href="/products"
                className="inline-flex items-center gap-1.5 bg-background text-foreground text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-background/90 transition-colors"
              >
                All Products
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. SUBCATEGORY ICON GRID ────────────────────────────────────────── */}
        {subcategories.length > 0 && (
          <section className="py-8 bg-background dark:bg-transparent border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">Browse {categoryParam}</h2>
                  {subcategoryParam && (
                    <Link
                      href={`/category?category=${encodeURIComponent(categoryParam)}`}
                      className="text-xs bg-[var(--primary-color)]/20 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/30 border border-[var(--primary-color)]/30 px-3 py-1 rounded-full font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      Showing: {subcategoryParam} <span className="opacity-70">✕ Clear</span>
                    </Link>
                  )}
                </div>
                <span className="text-muted-foreground text-sm font-medium">{subcategories.length} categories</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-3">
                {subcategories.map((cat) => {
                  const isActive = subcategoryParam?.toLowerCase() === cat.name.toLowerCase();
                  const targetHref = isActive
                    ? `/category?category=${encodeURIComponent(categoryParam)}`
                    : `/category?category=${encodeURIComponent(categoryParam)}&subcategory=${encodeURIComponent(cat.name)}`;
                  return (
                    <Link
                      key={cat.name}
                      href={targetHref}
                      className="group flex flex-col items-center"
                    >
                      <div className={`relative w-full aspect-square rounded-xl overflow-hidden mb-1.5 transition-all duration-300 hover:scale-105
                        ${isActive
                          ? "ring-2 ring-[var(--primary-color)] shadow-lg shadow-orange-500/40 scale-105"
                          : "hover:shadow-lg hover:shadow-white/10"
                        }`}
                      >
                        <ImageWithFallback
                          src={cat.image}
                          alt={cat.name}
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-[var(--primary-color)]/25 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] ring-2 ring-white" />
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] sm:text-xs text-center font-medium line-clamp-2 leading-tight transition-colors
                        ${isActive ? "text-[var(--primary-color)] font-bold" : "text-muted group-hover:text-inverse"}`}
                      >
                        {cat.name}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── 7. PRODUCT GRID ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {subcategoryParam ? subcategoryParam : categoryParam} Products
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Showing {products.length} products
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Filter Sheet */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-foreground border-border bg-card hover:bg-muted"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto bg-card border-border">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">Filters</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-44 bg-card text-foreground border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid or Empty State */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn&apos;t find any products in this {subcategoryParam ? "subcategory" : "category"} yet.
              </p>
              <Link href={`/category?category=${encodeURIComponent(categoryParam)}`}>
                <Button className="bg-[var(--primary-color)] hover:bg-orange-600 border-0">
                  View All {categoryParam}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-card border border-border group overflow-hidden hover:scale-[1.03] transition-all duration-300 rounded-xl shadow-sm hover:shadow-lg"
                  style={{ animationDelay: `${(index % 10) * 0.04}s` }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="relative block aspect-square overflow-hidden bg-muted"
                  >
                    {product.badge && (
                      <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse text-[9px] px-1.5 py-0.5 border-0">
                        {product.badge}
                      </Badge>
                    )}
                    {!product.inStock && (
                      <Badge className="absolute top-2 right-2 z-10 bg-red-600 text-inverse text-[9px] px-1.5 py-0.5">
                        Out of Stock
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`absolute top-2 left-2 z-10 opacity-100 transition-all size-7 shadow-sm ${
                        isInWishlist(product.id)
                          ? "bg-red-500 text-white hover:bg-red-600 border-0"
                          : "bg-background/90 dark:bg-card text-foreground hover:bg-muted"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          image: product.image,
                          category: product.category,
                          rating: product.rating,
                          reviews: product.reviews,
                        });
                      }}
                    >
                      <Heart
                        className={`size-3.5 transition-all ${
                          isInWishlist(product.id)
                            ? "fill-white text-white"
                            : "text-muted-foreground hover:text-red-500"
                        }`}
                      />
                    </Button>
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-2.5">
                    <Badge variant="outline" className="mb-1.5 text-[9px] border-gray-600 text-muted-foreground">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-xs text-inverse mb-1.5 line-clamp-2 leading-tight">
                      <Link href={`/products/${product.id}`} className="hover:text-[var(--primary-color)] transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`size-2.5 ${i < Math.floor(product.rating) ? "fill-[var(--primary-color)] text-[var(--primary-color)]" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm font-bold text-[var(--primary-color)]">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <Button
                      className="w-full bg-[var(--primary-color)] hover:bg-orange-600 h-7 text-xs border-0"
                      disabled={!product.inStock}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (product.inStock) {
                          try {
                            await addItem(product.id, (product as any).sku || product.id, 1, {
                              id: product.id,
                              sku: (product as any).sku || product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                            });
                            toast.success(`${product.name} added to cart!`);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Failed to add to cart");
                          }
                        }
                      }}
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Export with Suspense ─────────────────────────────────────────────────────

export function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background dark:bg-transparent flex items-center justify-center">
        <div className="text-foreground text-lg animate-pulse">Loading…</div>
      </div>
    }>
      <CategoryPageInner />
    </Suspense>
  );
}
