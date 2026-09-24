"use client";

import {
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Link from "next/link";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { FlashDealsSection } from "../components/FlashDealsSection";
import { ShopByCategorySection } from "../components/ShopByCategorySection";
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



const heroSlides = [
  {
    badge: "Trending",
    label: "STYLE MEETS COMFORT",
    titleLines: ["Athleisure", "Collection"],
    description: "Perfect blend of fashion and functionality. Ideal for active lifestyles.",
    primaryCta: "Buy 2 Get 1 Free",
    primaryCtaHref: "/products?offer=buy2get1",
    secondaryCta: "Explore More",
    secondaryCtaHref: "/products?category=Fashion",
    slideLabel: "3 / 4",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=1400",
    overlayFrom: "rgba(20,120,80,0.72)",
    overlayTo: "rgba(0,180,160,0.55)",
  },
  {
    badge: "New Arrivals",
    label: "URBAN EDGE",
    titleLines: ["Street Style", "Essentials"],
    description: "Bold silhouettes and cutting-edge designs for the modern trendsetter.",
    primaryCta: "Shop Now",
    primaryCtaHref: "/products?style=street",
    secondaryCta: "Explore More",
    secondaryCtaHref: "/products?category=Fashion",
    slideLabel: "1 / 4",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400",
    overlayFrom: "rgba(30,30,80,0.78)",
    overlayTo: "rgba(80,40,120,0.58)",
  },
  {
    badge: "Sale",
    label: "SUMMER VIBES",
    titleLines: ["Summer", "Collection"],
    description: "Light fabrics, bold prints and breezy silhouettes for the season.",
    primaryCta: "Up to 40% Off",
    primaryCtaHref: "/products?sale=summer",
    secondaryCta: "Explore More",
    secondaryCtaHref: "/products?category=Fashion",
    slideLabel: "2 / 4",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400",
    overlayFrom: "rgba(180,80,20,0.70)",
    overlayTo: "rgba(240,160,0,0.52)",
  },
  {
    badge: "Exclusive",
    label: "WINTER WARMTH",
    titleLines: ["Winter", "Wardrobe"],
    description: "Stay warm and stylish with our premium winter collection.",
    primaryCta: "Shop Winter",
    primaryCtaHref: "/products?season=winter",
    secondaryCta: "Explore More",
    secondaryCtaHref: "/products?category=Fashion",
    slideLabel: "4 / 4",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1400",
    overlayFrom: "rgba(10,40,100,0.78)",
    overlayTo: "rgba(20,100,160,0.58)",
  },
];

const shopForLovedOnes = [
  {
    name: "Men",
    description: "Discover men's collection",
    image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800",
    href: "/products?gender=men",
    badge: null as string | null,
  },
  {
    name: "Women",
    description: "Explore women's collection",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
    href: "/products?gender=women",
    badge: null as string | null,
  },
  {
    name: "Gen Z Drips",
    description: "Trending Gen Z styles",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800",
    href: "/products?style=genz",
    badge: "Spoyl",
  },
];


// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

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

// Product card — uniform aspect-[4/3] image, info below, orange Add to Cart button
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
      {/* Image area */}
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

      {/* Info area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category label */}
        <p className="text-[var(--primary-color)] text-[10px] font-semibold uppercase tracking-wide mb-1">
          {product.category}
        </p>

        {/* Product name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-foreground text-sm font-semibold mb-1.5 line-clamp-1 hover:text-[var(--primary-color)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stars + review count */}
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-muted-foreground text-[10px]">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[var(--primary-color)] font-bold text-sm">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-muted-foreground text-xs line-through">
              ₹{product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart — full width orange button */}
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

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export function FashionPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const slide = heroSlides[currentSlide];

  const prevSlide = () =>
    setCurrentSlide((c) => (c === 0 ? heroSlides.length - 1 : c - 1));
  const nextSlide = () =>
    setCurrentSlide((c) => (c === heroSlides.length - 1 ? 0 : c + 1));

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

      {/* ── 1. FASHION SUBCATEGORIES ── */}
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

      {/* ── 2. HERO CAROUSEL ── */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-5 bg-background dark:bg-transparent">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ minHeight: 420 }}
        >
          {/* Background photo */}
          <div className="absolute inset-0">
            <ImageWithFallback
              src={slide.image}
              alt={slide.titleLines.join(" ")}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Coloured gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${slide.overlayFrom} 0%, ${slide.overlayTo} 100%)`,
            }}
          />

          {/* Decorative circle — right side */}
          <div
            className="absolute pointer-events-none"
            style={{
              right: "7%",
              top: "50%",
              transform: "translateY(-50%)",
              width: "clamp(180px, 28vw, 360px)",
              height: "clamp(180px, 28vw, 360px)",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.09)",
              border: "1.5px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Text content */}
          <div
            className="relative z-10 flex flex-col justify-center px-8 sm:px-12 py-12"
            style={{ minHeight: 420 }}
          >
            <div className="mb-4">
              <span
                className="inline-block text-inverse text-sm font-semibold px-5 py-1.5 rounded-full"
                style={{ background: "var(--primary-color)" }}
              >
                {slide.badge}
              </span>
            </div>

            <p
              className="text-foreground font-semibold uppercase mb-3"
              style={{ fontSize: "0.75rem", letterSpacing: "0.22em" }}
            >
              {slide.label}
            </p>

            <h1
              className="text-foreground font-black leading-[1.05] mb-5"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 5rem)" }}
            >
              {slide.titleLines.map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>

            <p
              className="text-foreground/85 mb-8 max-w-sm"
              style={{ fontSize: "0.94rem", lineHeight: 1.65 }}
            >
              {slide.description}
            </p>

            <div className="flex flex-col gap-3" style={{ width: "fit-content" }}>
              <Link
                href={slide.primaryCtaHref}
                className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold transition-all duration-200 hover:bg-background/10"
                style={{
                  border: "2px solid rgba(255,255,255,0.50)",
                  color: "var(--primary-color)",
                  fontSize: "1.05rem",
                  minWidth: 220,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {slide.primaryCta}
              </Link>

              <Link
                href={slide.secondaryCtaHref}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-full font-bold text-inverse transition-all duration-200 hover:bg-orange-500"
                style={{
                  background: "var(--primary-color)",
                  fontSize: "1rem",
                  minWidth: 220,
                }}
              >
                <ShoppingBag className="size-5" />
                {slide.secondaryCta}
              </Link>
            </div>
          </div>

          {/* Slide counter */}
          <div className="absolute top-4 right-4 z-20">
            <span
              className="text-foreground text-sm font-semibold px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(20,30,40,0.68)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {slide.slideLabel}
            </span>
          </div>

          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-inverse/60"
            style={{
              width: 38, height: 38,
              background: "rgba(20,30,40,0.65)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <ChevronLeft className="size-5 text-foreground" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-inverse/60"
            style={{
              width: 38, height: 38,
              background: "rgba(20,30,40,0.65)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <ChevronRight className="size-5 text-foreground" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentSlide ? 24 : 6,
                  background: i === currentSlide ? "var(--primary-color)" : "rgba(255,255,255,0.40)",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FLASH DEALS & OFFERS ── */}
      <FlashDealsSection />

      {/* ── 4. SHOP FOR LOVED ONES ── */}
      <section className="py-12 bg-background dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Shop for Loved Ones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {shopForLovedOnes.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02]"
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {item.badge && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[var(--primary-color)] text-inverse text-xs border-0">{item.badge}</Badge>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-foreground">{item.name}</h3>
                  <p className="text-foreground/70 text-xs mt-0.5">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SHOP BY CATEGORY ── */}
      <ShopByCategorySection />

      {/* ── 6. PRODUCTS GRID — exact match to screenshot ── */}
      {/* ── 6. PRODUCTS GRID ── */}
      <section className="py-10 bg-background dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Toolbar row */}
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

      {/* ── 7. HOT DEALS PROMO BANNER ── */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 p-12 md:p-16">
            <div className="absolute top-4 left-4">
              <Badge className="bg-background/20 border border-white/30 text-foreground text-xs">
                Hot Deal
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-background/20 border border-white/30 text-foreground text-xs">
                1 / 4
              </Badge>
            </div>
            <div className="relative z-10 max-w-xl">
              <p className="text-foreground/80 text-xs font-semibold mb-3 uppercase tracking-widest">
                FASHION COLLECTION 2026
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-foreground mb-5">
                Style Bundle Sale
              </h2>
              <p className="text-foreground/90 text-base mb-8">
                Elevate your wardrobe with our exclusive fashion collection. Limited time offer!
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-background text-orange-600 text-2xl font-black px-6 py-2">
                  50% OFF
                </Badge>
                <Button
                  size="lg"
                  className="bg-background text-orange-600 hover:bg-muted font-bold rounded-full"
                >
                  <ShoppingCart className="size-5 mr-2" />
                  Grab Deals
                </Button>
              </div>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-25 pointer-events-none">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
                alt="Fashion Sale"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. SHOP BY STYLE ── */}
      <section className="py-12 bg-background dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Shop by Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800",
                description: "Explore men's styles",
                href: "/products?gender=men",
                overlay: "from-blue-900/70",
              },
              {
                name: "Women's Fashion",
                image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800",
                description: "Discover women's trends",
                href: "/products?gender=women",
                overlay: "from-pink-900/70",
              },
              {
                name: "Kids & Baby",
                image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
                description: "Dress them in style",
                href: "/products?age=kids",
                overlay: "from-orange-900/70",
              },
            ].map((style) => (
              <Link
                key={style.name}
                href={style.href}
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <ImageWithFallback
                  src={style.image}
                  alt={style.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${style.overlay} via-black/30 to-transparent`}
                />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-foreground mb-1">{style.name}</h3>
                  <p className="text-foreground/80 text-sm">{style.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
