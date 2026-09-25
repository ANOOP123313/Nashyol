"use client";

import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Link from "next/link";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { productsApi } from "@/services/api";
import { useCategorySubcategories } from "@/services/categorySubcategories";

function mapBackendProduct(p: any) {
  const v = p.variants?.[0] || {};
  return {
    id: p._id,
    _id: p._id,
    name: p.title || p.name,
    category: "Home & Garden",
    subcategory: p.subcategory || "Furniture",
    price: p.offerPrice || v.sellingPrice || p.price || 0,
    originalPrice: p.offerPrice ? p.price : undefined,
    rating: 4.8,
    reviews: p.reviews?.length || 15,
    image: v.image || p.images?.[0] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
    badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
    inStock: (v.currentStock ?? 1) > 0,
  };
}

export function HomeGardenPage() {
  const [products, setProducts] = useState<any[]>([]);
  const { subcategories } = useCategorySubcategories("Home & Garden");
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    productsApi.list({ category: "Home & Garden" })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res.products || [];
        const mapped = raw.map(mapBackendProduct);
        setProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:bg-transparent dark:from-transparent dark:via-transparent dark:to-transparent">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-inverse mb-4">
              Home & Garden Essentials
            </h1>
            <p className="text-xl text-inverse/90 mb-8">
              Transform your space with our curated collection
            </p>
            <Button
              size="lg"
              className="bg-background text-green-600 hover:bg-muted rounded-2xl"
              asChild
            >
              <Link href="/products?category=Home & Garden">
                Shop All Home & Garden
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <section className="py-16 bg-background dark:bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Shop by Category
                </h2>
                <p className="text-muted-foreground">
                  Find exactly what you're looking for
                </p>
              </div>
              <Button variant="ghost" className="text-[var(--primary-color)]" asChild>
                <Link href="/category?category=Home%20%26%20Garden">
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {subcategories.map((item) => (
                <Link key={item.name}
                  href={`/category?category=${encodeURIComponent('Home & Garden')}&subcategory=${encodeURIComponent(item.name)}`}
                  className="group flex flex-col items-center"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-muted hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs text-center text-foreground font-medium line-clamp-2">
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Home & Garden Products */}
      <section className="py-12 bg-background dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Featured Home & Garden Products
              </h2>
              <p className="text-muted-foreground">
                Discover our curated collection of {products.length} premium items
              </p>
            </div>
            <Link href="/products?category=Home & Garden">
              <Button variant="outline" className="rounded-xl">
                View All Products
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Link key={product.id}
                href={`/products/${product.id}`}
                className="group relative bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 border border-border"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.badge && (
                    <Badge className="absolute top-2 left-2 bg-[var(--primary-color)] text-inverse rounded-full z-10 border-0">
                      {product.badge}
                    </Badge>
                  )}
                  {product.originalPrice && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-inverse rounded-full z-10">
                      Sale
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await addItem(product.id, (product as any).sku || product.id, 1, {
                            id: product.id,
                            sku: (product as any).sku || product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          });
                          toast.success("Added to cart!");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Failed to add to cart");
                        }
                      }}
                      className="p-2 bg-[var(--primary-color)] hover:bg-orange-600 text-inverse rounded-full shadow-lg transition-colors border-0"
                    >
                      <ShoppingCart className="size-4" />
                    </button>
                    <button
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
                          reviews: product.reviews,
                        });
                      }}
                      className="p-2 bg-background dark:bg-card text-foreground hover:bg-muted rounded-full shadow-lg transition-colors"
                    >
                      <Heart
                        className="size-4 text-muted-foreground"
                        fill={isInWishlist(product.id) ? "var(--primary-color)" : "none"}
                      />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {product.subcategory}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 sm:size-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                              : "fill-gray-300 text-muted dark:fill-gray-600 dark:text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg sm:text-xl font-bold text-[var(--primary-color)]">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="ml-2 text-xs sm:text-sm text-muted-foreground line-through">
                          ₹{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.inStock ? (
                      <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 rounded-full">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 rounded-full">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
