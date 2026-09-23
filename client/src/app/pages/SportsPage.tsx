"use client";

import { Star, Heart, ShoppingCart, Dumbbell, Home, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Link from "next/link";
import {   } from "next/navigation";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";
import { FlashDealsSection } from "../components/FlashDealsSection";
import { ShopByCategorySection } from "../components/ShopByCategorySection";
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
    category: "Sports",
    price: v.sellingPrice || p.offerPrice || p.price || 0,
    originalPrice: p.offerPrice ? v.sellingPrice : undefined,
    rating: 4.8,
    reviews: p.reviews?.length || 14,
    image: v.image || p.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
  };
}

export function SportsPage() {
  const categoryName = "Sports";
  const [products, setProducts] = useState<any[]>([]);
  const { subcategories } = useCategorySubcategories("Sports");
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    productsApi.list({ category: "Sports" })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res.products || [];
        const mapped = raw.map(mapBackendProduct);
        setProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-950 dark:via-red-950/20 dark:to-orange-950/20">
      {/* Sports Products Section */}
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
              <Link href="/category?category=Sports">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {subcategories.map((product) => (
              <Link key={product.name}
                href={`/category?category=Sports&subcategory=${encodeURIComponent(product.name)}`}
                className="group flex flex-col items-center"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-muted hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-center text-foreground font-medium line-clamp-2">
                  {product.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 dark:from-orange-900 dark:via-red-900 dark:to-pink-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-inverse mb-4">
              Sports & Fitness
            </h1>
            <p className="text-xl text-inverse/90 mb-8">
              Elevate your fitness journey with premium gear
            </p>
            <Button
              size="lg"
              className="bg-background text-orange-600 hover:bg-muted rounded-2xl"
              asChild
            >
              <Link href="/products?category=Sports">Shop All Sports</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Flash Deals & Offers Section */}
      <FlashDealsSection />

      {/* Featured Sports & Outdoors Products Section */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Featured Sports & Outdoors Products
              </h2>
              <p className="text-muted-foreground mt-1">
                Gear up for performance with our curated collection of {products.length} sports essentials
              </p>
            </div>
            <Link href="/products?category=Sports">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative bg-card text-card-foreground rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 border border-border"
              >
                {product.badge && (
                  <Badge className="absolute top-4 left-4 z-10 bg-[var(--primary-color)] hover:bg-orange-600 text-inverse border-0">
                    {product.badge}
                  </Badge>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 z-10 size-10 rounded-full bg-background/90 dark:bg-card/90 hover:bg-background"
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
                    className="size-5 text-muted-foreground"
                    fill={isInWishlist(product.id) ? "var(--primary-color)" : "none"}
                  />
                </Button>
                <div className="aspect-square overflow-hidden bg-muted">
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
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews || 12})
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
                        <span className="text-xs text-green-600 font-semibold">
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

      {/* Shop by Category Section */}
      <ShopByCategorySection />

      {/* Shop for Loved Ones Section */}
      <section className="py-12 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-950 dark:via-orange-950/20 dark:to-red-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Shop by Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/products?subcategory=Gym & Fitness"
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
                alt="Gym & Fitness"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-red-900/30 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-3xl font-bold text-inverse mb-1">Gym & Fitness</h3>
                <p className="text-inverse/90 text-sm">Build strength & endurance</p>
              </div>
            </Link>

            <Link href="/products?subcategory=Outdoor Sports"
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800"
                alt="Outdoor Sports"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/30 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-3xl font-bold text-inverse mb-1">Outdoor Sports</h3>
                <p className="text-inverse/90 text-sm">Adventure awaits outdoors</p>
              </div>
            </Link>

            <Link href="/products?subcategory=Yoga & Wellness"
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
                alt="Yoga & Wellness"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/30 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-3xl font-bold text-inverse mb-1">Yoga & Wellness</h3>
                <p className="text-inverse/90 text-sm">Mind, body & soul balance</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


