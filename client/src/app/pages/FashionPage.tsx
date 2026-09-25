"use client";

import {
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Link from "next/link";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { productsApi } from "@/services/api";
import { useCategorySubcategories } from "@/services/categorySubcategories";

function mapBackendProduct(p: any) {
  const v = p.variants?.[0] || {};
  return {
    id: p._id,
    _id: p._id,
    name: p.title || p.name,
    category: "Fashion",
    price: p.offerPrice || v.sellingPrice || p.price || 0,
    originalPrice: p.offerPrice ? p.price : undefined,
    rating: 4.7,
    reviews: p.reviews?.length || 12,
    image: v.image || p.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800",
    badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3 ${
            star <= Math.floor(rating)
              ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
              : star - 0.5 <= rating
              ? "fill-[var(--primary-color)]/50 text-[var(--primary-color)]"
              : "fill-gray-600 text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

interface FashionProduct {
  id: string | number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge?: string | null;
}

function ProductCard({
  product,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: {
  product: FashionProduct;
  onAddToCart: (p: FashionProduct) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: FashionProduct) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden bg-card group flex flex-col h-full border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden aspect-[4/3] bg-muted">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-inverse text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--primary-color)]">
              {product.badge}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 dark:bg-card/80 flex items-center justify-center hover:bg-background transition-colors shadow-sm"
        >
          <Heart
            className="size-4 text-foreground"
            fill={isWishlisted ? "var(--primary-color)" : "none"}
            color={isWishlisted ? "var(--primary-color)" : "currentColor"}
          />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[var(--primary-color)] text-[10px] font-semibold uppercase tracking-wide mb-1">
          {product.category}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-foreground text-sm font-semibold mb-1.5 line-clamp-1 hover:text-[var(--primary-color)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-muted-foreground text-[10px]">
            {product.rating} ({product.reviews})
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--primary-color)] font-bold text-sm">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground text-xs line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full mt-auto bg-[var(--primary-color)] hover:bg-orange-500 active:bg-orange-600 text-inverse text-xs font-semibold rounded-xl h-8 transition-colors border-0"
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

export function FashionPage() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const { subcategories } = useCategorySubcategories("Fashion");
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    productsApi.list({ category: "Fashion" })
      .then((res) => {
        const raw = Array.isArray(res) ? res : res.products || [];
        const mapped = raw.map(mapBackendProduct);
        setProductsList(mapped);
      })
      .catch(() => setProductsList([]));
  }, []);

  const handleAddToCart = async (product: FashionProduct) => {
    try {
      await addItem(String(product.id), String(product.id), 1, {
        id: String(product.id),
        sku: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-transparent text-foreground">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-rose-600 to-purple-600 dark:from-pink-900 dark:via-rose-900 dark:to-purple-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-inverse mb-4">
              Fashion & Apparel
            </h1>
            <p className="text-xl text-inverse/90 mb-8">
              Discover the latest trends and styles
            </p>
            <Button
              size="lg"
              className="bg-background text-pink-600 hover:bg-muted rounded-2xl"
              asChild
            >
              <Link href="/products?category=Fashion">Shop All Fashion</Link>
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
                <h2 className="text-3xl font-bold text-foreground mb-2">Shop by Category</h2>
                <p className="text-muted-foreground">
                  Find exactly what you're looking for
                </p>
              </div>
              <Button variant="ghost" className="text-[var(--primary-color)]" asChild>
                <Link href="/category?category=Fashion">
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {subcategories.map((item) => (
                <Link
                  key={item.name}
                  href={`/category?category=Fashion&subcategory=${encodeURIComponent(item.name)}`}
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

      {/* Featured Fashion Products */}
      <section className="py-10 bg-background dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-1">Featured Fashion Products</h2>
              <p className="text-muted-foreground text-sm">
                Showing {productsList.length} products from our latest collection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/products?category=Fashion">View All</Link>
              </Button>
            </div>
          </div>

          {productsList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No fashion products available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsList.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isWishlisted={isInWishlist(product.id)}
                  onToggleWishlist={(p) =>
                    toggleWishlist({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      originalPrice: p.originalPrice,
                      image: p.image,
                      category: p.category,
                      rating: p.rating,
                      reviews: p.reviews,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
