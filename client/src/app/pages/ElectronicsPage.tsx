"use client";

import { Star, Heart, ShoppingCart, Smartphone, Laptop, Headphones, Camera, Watch, Tablet, Home, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Link from "next/link";

import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";

import { productsApi } from "@/services/api";
import { useEffect, useState } from "react";
import { useCategorySubcategories } from "@/services/categorySubcategories";

function mapBackendProduct(p: any) {
  const v = p.variants?.[0] || {};
  return {
    id: p._id,
    _id: p._id,
    name: p.title || p.name,
    category: "Electronics",
    price: p.offerPrice || v.sellingPrice || p.price || 0,
    originalPrice: p.offerPrice ? p.price : undefined,
    image: v.image || p.images?.[0] || "https://placehold.co/400x400?text=No+Image",
    rating: 4.8,
    reviews: p.reviews?.length || 12,
    reviewsCount: p.reviews?.length || 12,
    badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
    inStock: (v.currentStock ?? 1) > 0,
  };
}

export function ElectronicsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const { subcategories } = useCategorySubcategories("Electronics");
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    productsApi.list({ category: "Electronics" })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res.products || [];
        const mapped = raw.map(mapBackendProduct);
        setProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:bg-transparent dark:from-transparent dark:via-transparent dark:to-transparent">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 dark:from-blue-900 dark:via-cyan-900 dark:to-indigo-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-inverse mb-4">
              Electronics & Technology
            </h1>
            <p className="text-xl text-inverse/90 mb-8">
              Discover the latest in tech innovation
            </p>
            <Button
              size="lg"
              className="bg-background text-blue-600 hover:bg-muted rounded-2xl"
              asChild
            >
              <Link href="/products?category=Electronics">Shop All Electronics</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-16 bg-background">
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
              <Link href="/category?category=Electronics">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {subcategories.map((category) => (
              <Link key={category.name}
                href={`/category?category=Electronics&subcategory=${encodeURIComponent(category.name)}`}
                className="group flex flex-col items-center"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-muted hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-center text-foreground font-medium line-clamp-2">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* Featured Products */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Featured Electronics
            </h2>
            <Link href="/products?category=Electronics">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id}
                href={`/products/${product.id}`}
                className="group relative bg-card rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 border border-border"
              >
                {product.badge && (
                  <Badge className="absolute top-4 left-4 z-10 bg-[var(--primary-color)] hover:bg-orange-600 text-inverse border-0">
                    {product.badge}
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 z-10 size-10 rounded-full bg-background/90 dark:bg-card/90 hover:bg-background dark:hover:bg-card text-foreground"
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
                    className="size-5 text-muted-foreground dark:text-muted"
                    fill={isInWishlist(product.id) ? "var(--primary-color)" : "none"}
                  />
                </Button>
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                              : "text-muted dark:text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      {product.originalPrice && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                          Save ₹{(product.originalPrice - product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      className="size-12 rounded-full bg-[var(--primary-color)] hover:bg-orange-600 text-inverse border-0"
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
                          toast.success(`${product.name} added to cart!`);
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Failed to add to cart");
                        }
                      }}
                    >
                      <ShoppingCart className="size-5" />
                    </Button>
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


