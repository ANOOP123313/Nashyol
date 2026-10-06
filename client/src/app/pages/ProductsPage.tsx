"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Star,
  Heart,
  Flame,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";
import { productsApi, categoriesApi } from "@/services/api";

function mapBackendProduct(p: any) {
  const v = p.variants?.[0] || {};
  const revs = Array.isArray(p.reviews) ? p.reviews : [];
  const avgRating =
    revs.length > 0
      ? revs.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0) / revs.length
      : Number(p.rating) || 0;

  return {
    id: p._id,
    _id: p._id,
    sku: v.sku || p._id,
    name: p.title || p.name || "",
    category: p.category?.name || p.category || "",
    subcategory: p.subCategory || "",
    price: p.offerPrice || v.sellingPrice || p.price || 0,
    originalPrice: p.offerPrice ? (v.sellingPrice || p.price) : undefined,
    image: v.image || p.images?.[0] || "https://placehold.co/400x400?text=No+Image",
    rating: Number(avgRating.toFixed(1)),
    reviewsCount: revs.length || Number(p.reviewsCount || 0),
    badge: p.featured ? "Best Seller" : p.offerPrice ? "Sale" : undefined,
    featured: Boolean(p.featured),
    inStock: v.isActive !== false && (v.currentStock ?? 1) > 0,
    salesCount: Number(p.salesCount || p.ordersCount || p.paidAmount || 0),
  };
}

export function ProductsPage() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const [productList, setProductList] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.list({ limit: 100 }).catch(() => ({ products: [] })),
      categoriesApi.list(true).catch(() => []),
    ])
      .then(([prodsRes, catsRes]) => {
        const rawProds = Array.isArray(prodsRes)
          ? prodsRes
          : prodsRes?.products || [];
        setProductList(rawProds.map(mapBackendProduct));

        const rawCats = Array.isArray(catsRes)
          ? catsRes
          : (catsRes as any)?.data || [];
        if (Array.isArray(rawCats)) {
          setDbCategories(
            rawCats.filter(
              (c: any) => c.isActive !== false && Array.isArray(c.subCategories) && c.subCategories.length > 0
            )
          );
        }
      })
      .catch((err) => console.error("Products page fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter products by search if query parameter exists
  const searchResults = useMemo(() => {
    if (!searchParam.trim()) return [];
    const q = searchParam.toLowerCase().trim();
    return productList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    );
  }, [productList, searchParam]);

  // Most Purchased products (featured, best sellers, and sales)
  const mostPurchasedProducts = useMemo(() => {
    return [...productList]
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (b.salesCount !== a.salesCount) return b.salesCount - a.salesCount;
        if (a.originalPrice && !b.originalPrice) return -1;
        if (!a.originalPrice && b.originalPrice) return 1;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      })
      .slice(0, 8);
  }, [productList]);

  // Most Rated products (sorted by reviews count and rating)
  const mostRatedProducts = useMemo(() => {
    return [...productList]
      .sort((a, b) => {
        if (b.reviewsCount !== a.reviewsCount) return b.reviewsCount - a.reviewsCount;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return 0;
      })
      .slice(0, 8);
  }, [productList]);

  const renderProductCard = (product: any, index: number) => (
    <div
      key={product.id}
      className="bg-card border border-border group overflow-hidden hover:scale-[1.03] transition-all duration-300 rounded-xl shadow-sm hover:shadow-lg flex flex-col justify-between"
      style={{ animationDelay: `${(index % 8) * 0.05}s` }}
    >
      <div>
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
            <Badge className="absolute top-2 right-2 z-10 bg-red-600 text-inverse text-[9px] px-1.5 py-0.5 border-0">
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
              e.stopPropagation();
              toggleWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.image,
                category: product.category,
                rating: product.rating,
                reviews: product.reviewsCount,
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

        <div className="p-3">
          <Badge variant="outline" className="mb-1 text-[9px] text-muted-foreground border-border">
            {product.category}
          </Badge>
          <h3 className="font-semibold text-xs text-foreground mb-1.5 line-clamp-2 leading-tight">
            <Link href={`/products/${product.id}`} className="hover:text-[var(--primary-color)] transition-colors">
              {product.name}
            </Link>
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-2.5 ${
                    i < Math.floor(product.rating)
                      ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">({product.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-bold text-[var(--primary-color)]">AED {product.price}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through">AED {product.originalPrice}</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 pt-0">
        <Button
          className="w-full bg-[var(--primary-color)] hover:bg-orange-600 h-7 text-xs border-0 text-white font-semibold"
          disabled={!product.inStock}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (product.inStock) {
              try {
                await addItem(product.id, product.sku || product.id, 1, {
                  id: product.id,
                  sku: product.sku || product.id,
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
  );

  return (
    <div className="min-h-screen bg-background dark:bg-transparent relative overflow-hidden">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/25 via-red-500/15 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/15 via-orange-500/15 to-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header Bar */}
        <div className="glass-navbar border-b border-border/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              All Products
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Explore all available categories, subcategories, and top-rated customer favorites
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {loading ? (
            <div className="space-y-12 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-muted/60" />
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-muted/60 rounded" />
                      <div className="h-4 w-64 bg-muted/40 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="p-2 rounded-2xl bg-card/60 border border-border/40 flex flex-col items-center">
                        <div className="w-full aspect-square rounded-xl bg-muted/60 mb-2" />
                        <div className="h-3 w-16 bg-muted/60 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : searchParam ? (
            /* SEARCH RESULTS VIEW */
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Search Results for &quot;{searchParam}&quot;
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Found {searchResults.length} matching products
                  </p>
                </div>
                <Link href="/products">
                  <Button variant="outline" size="sm" className="text-xs">
                    View All Categories
                  </Button>
                </Link>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="size-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No products found</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Try searching for another keyword or browse our categories
                  </p>
                  <Link href="/products">
                    <Button className="bg-[var(--primary-color)] text-white">
                      Browse All Categories
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {searchResults.map((product, idx) => renderProductCard(product, idx))}
                </div>
              )}
            </div>
          ) : (
            /* ALL AVAILABLE CATEGORIES & SUBCATEGORIES */
            <div>
              {/* Categories Container */}
              <div className="space-y-12 sm:space-y-16">
                {dbCategories.map((cat) => {
                  const activeSubs = Array.isArray(cat.subCategories)
                    ? cat.subCategories.filter((s: any) => s && s.isActive !== false && s.name)
                    : [];
                  if (activeSubs.length === 0) return null;

                  const sectionAnchor = (cat.slug || cat.name).toLowerCase().replace(/[\s&]+/g, "-");

                  return (
                    <section
                      key={cat._id || cat.name}
                      id={`cat-${sectionAnchor}`}
                      className="scroll-mt-24"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4 sm:mb-5 pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-3">
                          <div className="size-10 sm:size-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-xl sm:text-2xl shadow-sm shrink-0">
                            {cat.icon || "📦"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                                {cat.name} Products
                              </h2>
                              <span className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full font-medium hidden sm:inline-block">
                                {activeSubs.length} subcategories
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/category?category=${encodeURIComponent(cat.name)}`}
                          className="text-xs sm:text-sm font-semibold text-[var(--primary-color)] hover:text-orange-600 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <span>Explore All {activeSubs.length > 8 ? `(${activeSubs.length})` : ""}</span>
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>

                      {/* Real Subcategories Grid (Single line limit: 8 items) */}
                      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
                        {activeSubs.slice(0, 8).map((sub: any) => (
                          <Link
                            key={sub._id || sub.name}
                            href={`/category?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                            className="group flex flex-col items-center text-center p-2 rounded-2xl bg-card border border-border hover:border-[var(--primary-color)] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10"
                          >
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-muted/80 flex items-center justify-center">
                              {sub.image ? (
                                <ImageWithFallback
                                  src={sub.image}
                                  alt={sub.name}
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <span className="text-2xl">{sub.icon || "📦"}</span>
                              )}
                            </div>
                            <p className="text-[11px] sm:text-xs font-semibold text-foreground group-hover:text-[var(--primary-color)] line-clamp-2 leading-tight transition-colors">
                              {sub.name}
                            </p>
                            {(sub.productCount ?? 0) > 0 && (
                              <span className="text-[9px] text-muted-foreground mt-1 bg-muted px-1.5 py-0.5 rounded-full">
                                {sub.productCount} items
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* ── BOTTOM CONTAINER: MOST PURCHASED & MOST RATED PRODUCTS ── */}
              <div className="mt-16 sm:mt-20 pt-12 border-t border-border/80 space-y-16">
                {/* 1. Most Purchased by Customers */}
                {mostPurchasedProducts.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-[var(--primary-color)] px-3 py-1 rounded-full text-xs font-bold mb-2">
                          <Flame className="size-3.5" />
                          <span>Customer Best Sellers</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                          Most Purchased by Customers
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Our highest volume and most purchased products across all categories
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {mostPurchasedProducts.map((product, idx) => renderProductCard(product, idx))}
                    </div>
                  </section>
                )}

                {/* 2. Most Rated Products */}
                {mostRatedProducts.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold mb-2">
                          <Star className="size-3.5 fill-current" />
                          <span>Top Reviewed</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                          Most Rated Products
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Highest rated products reviewed by verified customers
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {mostRatedProducts.map((product, idx) => renderProductCard(product, idx))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
