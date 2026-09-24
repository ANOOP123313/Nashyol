"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  Heart,
  ArrowRight,
  Truck,
  RotateCcw,
  Shield,
  Headphones,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { HeroCarousel } from "./HeroCarousel";
import { AdBanner, Ad } from "./AdBanner";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";

// Icon mapping helper for service features
const ICON_MAP: Record<string, React.ElementType> = {
  Truck: Truck,
  RotateCcw: RotateCcw,
  Shield: Shield,
  Headphones: Headphones,
  ShoppingBag: ShoppingBag,
  Sparkles: Sparkles,
};

interface HomePageSectionRendererProps {
  sections: any[];
  heroSlides?: any[];
  featuredProducts?: any[];
}

export function HomePageSectionRenderer({
  sections = [],
  heroSlides = [],
  featuredProducts = [],
}: HomePageSectionRendererProps) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section, index) => {
        if (section.isActive === false) return null;

        try {
          switch (section.sectionType) {
            case "hero_banner":
              return (
                <section key={section._id || section.sectionKey || index} className="relative overflow-hidden">
                  <HeroCarousel slides={heroSlides} autoPlayInterval={5000} />
                </section>
              );

            case "service_features":
              return (
                <ServiceFeaturesSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "promo_carousel":
              return (
                <PromoCarouselSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "quick_categories":
              return (
                <QuickCategoriesSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "loved_ones":
              return (
                <LovedOnesSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "promotional_cards":
              return (
                <PromotionalCardsSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "clearance_offers":
              return (
                <ClearanceOffersSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "shop_by_category":
              return (
                <ShopByCategorySection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "special_offers":
              return (
                <SpecialOffersSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "category_products":
            case "product_grid":
              return (
                <CategoryProductsSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "featured_products":
              return (
                <FeaturedProductsSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                  featuredProducts={featuredProducts}
                />
              );

            case "rewards":
              return (
                <RewardsSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            case "newsletter":
              return (
                <NewsletterSection
                  key={section._id || section.sectionKey || index}
                  section={section}
                />
              );

            default:
              return null;
          }
        } catch (err) {
          console.error(`Error rendering section ${section?.sectionKey}:`, err);
          return null;
        }
      })}
    </>
  );
}

// ── 1. SERVICE FEATURES SECTION ──
function ServiceFeaturesSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((feature: any, index: number) => {
            const IconComp = ICON_MAP[feature.icon] || Truck;
            return (
              <div
                key={feature._id || index}
                className="glass-card p-4 rounded-xl flex items-center gap-3 hover:scale-105 transition-all scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-lg text-white shadow-lg">
                  <IconComp className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{feature.title || feature.name}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description || feature.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── 2. PROMO CAROUSEL / FLASH DEALS ──
function PromoCarouselSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  const settings = {
    dots: false,
    infinite: items.length > 3,
    speed: 800,
    slidesToShow: Math.min(3, items.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    pauseOnHover: true,
    arrows: false,
    rtl: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, items.length),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="promo-carousel-container flash-deals-carousel w-full overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Slider {...settings}>
          {items.map((card: any, idx: number) => (
            <div key={card._id || idx} className="px-2 sm:px-3 py-2">
              <Card
                className={`relative overflow-hidden group hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-br ${
                  card.gradient || "from-purple-600 to-purple-800"
                } border-0 shadow-lg h-full`}
              >
                <div className="p-5 sm:p-6 lg:p-8 flex flex-col min-h-[260px] sm:min-h-[280px] lg:min-h-[300px]">
                  <div className="flex-1 space-y-2 sm:space-y-3 lg:space-y-4">
                    {card.badge && (
                      <Badge
                        className={`w-fit bg-background ${
                          card.badgeColor || "text-purple-600"
                        } hover:bg-background border-0 font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm`}
                      >
                        {card.emoji} {card.badge}
                      </Badge>
                    )}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-inverse leading-tight">
                      {card.title || card.name}
                    </h3>
                    <p className="text-sm sm:text-base text-inverse/90 leading-relaxed line-clamp-2">
                      {card.description || card.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/20">
                    <Button
                      size="sm"
                      className="bg-background text-foreground hover:bg-muted shadow-lg font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base flex-shrink-0"
                      asChild
                    >
                      <Link href={card.buttonLink || card.link || "/category"}>
                        {card.buttonText || "Shop Now"}
                      </Link>
                    </Button>
                    {(card.offer || card.discount || card.price) && (
                      <div className="text-inverse font-bold text-lg sm:text-xl lg:text-2xl whitespace-nowrap flex-shrink-0">
                        {card.offer || card.discount || card.price}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

// ── 3. QUICK CATEGORIES GRID ──
function QuickCategoriesSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-8 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {items.map((cat: any, index: number) => (
            <Link
              key={cat._id || index}
              href={cat.link || `/category?category=Fashion&subcategory=${encodeURIComponent(cat.name || cat.title)}`}
              className="group flex flex-col items-center"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-muted hover:shadow-xl transition-all duration-300 hover:scale-105">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name || cat.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-center text-foreground font-medium line-clamp-2">
                {cat.name || cat.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 4. SHOP FOR LOVED ONES ──
function LovedOnesSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">
          {section.title || "Shop for Loved Ones"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any, index: number) => (
            <Link
              key={item._id || index}
              href={item.link || `/category?category=Fashion`}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${
                item.gradient || "from-blue-400 to-blue-500"
              } aspect-[4/3] hover:shadow-2xl transition-all duration-300 hover:scale-105`}
            >
              <ImageWithFallback
                src={item.image}
                alt={item.title || item.name}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                {item.badge && (
                  <div className="inline-block bg-green-400 text-foreground font-bold px-3 py-1 rounded-full text-sm mb-2">
                    {item.badge}
                  </div>
                )}
                <h3 className="text-3xl font-bold text-inverse mb-1">{item.title || item.name}</h3>
                <p className="text-inverse/90 text-sm">{item.subtitle || item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 5. PROMOTIONAL CARDS (Basant Panchami Specials) ──
function PromotionalCardsSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          {section.title || "🌸 Basant Panchami Specials"}
        </h2>
        <div className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-dark">
          {items.map((item: any, index: number) => (
            <Link
              key={item._id || index}
              href={item.link || `/category?category=Fashion`}
              className="group flex-shrink-0 w-64 snap-start"
            >
              <div
                className={`${
                  item.gradient ? `bg-gradient-to-br ${item.gradient}` : "bg-gradient-to-br from-yellow-200 to-yellow-300"
                } rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105`}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name || item.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center justify-between text-inverse">
                      <div>
                        <h3 className="font-bold text-lg">{item.name || item.title}</h3>
                        <p className="text-sm font-semibold">{item.price || item.discount}</p>
                      </div>
                      <div className="text-4xl">{item.emoji || "🌸"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 6. CLEARANCE OFFERS ──
function ClearanceOffersSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">
          {section.title || "🔥 Clearance offers"}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {items.map((item: any, index: number) => (
            <Link
              key={item._id || index}
              href={item.link || `/category?category=Fashion`}
              className="group flex-shrink-0 w-56 snap-start"
            >
              <div className="bg-muted rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-400">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name || item.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base text-foreground mb-1 line-clamp-1">
                    {item.name || item.title}
                  </h3>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {item.price || item.discount}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 7. SHOP BY CATEGORY ──
function ShopByCategorySection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {section.title || "Shop by Category"}
            </h2>
            <p className="text-muted-foreground">
              {section.subtitle || "Find exactly what you're looking for"}
            </p>
          </div>
          <Button variant="ghost" className="text-[var(--primary-color)]" asChild>
            <Link href={section.settings?.viewAllLink || "/category"}>
              View All
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {items.map((cat: any, index: number) => (
            <Link
              key={cat._id || index}
              href={cat.link || `/category?category=${encodeURIComponent(cat.name || cat.title)}`}
              className="group flex flex-col items-center"
            >
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-muted hover:shadow-xl transition-all duration-300 hover:scale-105">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name || cat.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-center text-foreground font-medium line-clamp-2">
                {cat.name || cat.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 8. SPECIAL OFFERS & PROMOTIONS (AdBanner) ──
function SpecialOffersSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  const ads: Ad[] = items.map((it: any, i: number) => ({
    id: it._id || String(i),
    title: it.title || it.name || "",
    description: it.description || it.subtitle || "",
    image: it.image || "",
    buttonText: it.buttonText || "Shop Now",
    buttonLink: it.buttonLink || it.link || "/category",
    discount: it.discount || it.offer,
    type: it.type || "hero",
    backgroundColor: it.backgroundColor || it.gradient,
    textColor: it.textColor,
  }));

  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {section.badge && (
            <Badge className="bg-[var(--primary-color)] text-white hover:bg-orange-600 mb-6 text-base px-6 py-2 font-bold shadow-lg border-0">
              {section.badge}
            </Badge>
          )}
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {section.title || "Special Offers & Promotions"}
          </h2>
          {section.subtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>
        <AdBanner ads={ads} />
      </div>
    </section>
  );
}

// ── 9. CATEGORY PRODUCTS SECTION (Electronics, Fashion, etc.) ──
function CategoryProductsSection({ section }: { section: any }) {
  const items = Array.isArray(section.items) && section.items.length > 0 ? section.items : [];
  const dynamicProducts = Array.isArray(section.dynamicProducts) ? section.dynamicProducts : [];
  const viewAll = section.settings?.viewAllLink || `/category?category=${encodeURIComponent(section.settings?.categoryName || section.title)}`;

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
            {section.subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{section.subtitle}</p>
            )}
          </div>
          <Link
            href={viewAll}
            className="text-[var(--primary-color)] hover:text-orange-600 font-semibold text-sm"
          >
            View All →
          </Link>
        </div>

        {/* If subcategory/icon cards are present, display them */}
        {items.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-6">
            {items.map((prod: any, idx: number) => (
              <Link
                key={prod._id || idx}
                href={prod.link || `${viewAll}&subcategory=${encodeURIComponent(prod.name || prod.title)}`}
                className="group flex flex-col items-center"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-muted hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <ImageWithFallback
                    src={prod.image}
                    alt={prod.name || prod.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs text-center text-foreground font-medium line-clamp-2">
                  {prod.name || prod.title}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Dynamic product cards from this category */}
        {dynamicProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {dynamicProducts.map((p: any) => (
              <div key={p.id} className="glass-card rounded-2xl p-3 sm:p-4 flex flex-col justify-between group hover:shadow-xl transition-all">
                <Link href={`/products/${p.id}`} className="block aspect-square relative overflow-hidden rounded-xl mb-3 bg-muted">
                  <ImageWithFallback src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  {p.badge && (
                    <Badge className="absolute top-2 left-2 bg-[var(--primary-color)] text-white text-[10px] font-bold px-2 py-0.5 border-0 shadow">
                      {p.badge}
                    </Badge>
                  )}
                </Link>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{p.category}</p>
                  <Link href={`/products/${p.id}`}>
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1 hover:text-[var(--primary-color)] transition-colors mt-0.5">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm sm:text-base font-bold text-[var(--primary-color)]">₹{Number(p.price || 0).toLocaleString()}</span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-xs text-muted-foreground line-through">₹{Number(p.originalPrice).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── 10. FEATURED PRODUCTS SECTION ──
function FeaturedProductsSection({ section, featuredProducts = [] }: { section: any; featuredProducts: any[] }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!featuredProducts || featuredProducts.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 md:py-16 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {section.title || "⭐ Featured Products"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {section.subtitle || "Hand-picked items just for you"}
            </p>
          </div>
          <Button
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--primary-color)] text-white hover:bg-orange-600 shadow-md hover:shadow-lg border-0"
            asChild
          >
            <Link href={section.settings?.viewAllLink || "/category"}>
              View All
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="glass-card group overflow-hidden hover:scale-102 sm:hover:scale-105 transition-all duration-300 rounded-lg sm:rounded-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link
                href={`/products/${product.id}`}
                className="relative block aspect-square overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
              >
                {product.badge && (
                  <Badge className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse hover:from-[var(--primary-color)] hover:to-orange-600 pulse-glow text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 border-0">
                    {product.badge}
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
                  onClick={async (e) => {
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
              <div className="p-2 sm:p-3">
                <Badge variant="outline" className="mb-1 sm:mb-1.5 text-[9px] sm:text-[10px] glass-sm">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-1 sm:mb-1.5 line-clamp-2">
                  <Link href={`/products/${product.id}`} className="hover:text-[var(--primary-color)] transition-colors">
                    {product.name}
                  </Link>
                </h3>
                <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-2.5 sm:size-3 ${
                          i < Math.floor(product.rating)
                            ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                            : "text-muted dark:text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <span className="text-sm sm:text-lg font-bold text-[var(--primary-color)]">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                <Button
                  className="w-full bg-[var(--primary-color)] text-white hover:bg-orange-600 h-7 sm:h-8 text-xs sm:text-sm font-semibold transition-all duration-200 border-0"
                  disabled={product.inStock === false}
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
                  {product.inStock === false ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 11. REWARDS SECTION ──
function RewardsSection({ section }: { section: any }) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-8 md:p-12 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {section.title || "Join Our Rewards Program"}
            </h2>
            <p className="text-lg text-white/90 mb-8">
              {section.description ||
                "Earn points with every purchase and get exclusive discounts. Refer friends and get even more rewards!"}
            </p>
            <Button
              size="lg"
              className="bg-white text-[var(--primary-color)] hover:bg-gray-100 text-lg h-14 font-semibold shadow-md border-0"
              asChild
            >
              <Link href={section.settings?.buttonLink || "/rewards"}>
                {section.settings?.buttonText || "Learn More"}
                <ArrowRight className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ── 12. NEWSLETTER SECTION ──
function NewsletterSection({ section }: { section: any }) {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/cms/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to subscribe");
      toast.success(data.message || "Thank you for subscribing!");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Subscription failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 gradient-bg-orange relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold text-inverse mb-2">
              {section.title || "📧 Subscribe to Our Newsletter"}
            </h3>
            <p className="text-inverse/90">
              {section.description || "Get the latest deals and exclusive offers delivered to your inbox"}
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={section.settings?.placeholder || "Enter your email"}
              className="glass-input bg-background/90 h-12 border-white/30 rounded-lg px-4 flex-1 text-sm text-foreground focus:outline-none"
            />
            <Button
              type="submit"
              disabled={submitting}
              className="glass-button text-inverse px-8 h-12 transition-all hover:scale-105 border border-white/20"
            >
              {submitting ? "..." : section.settings?.buttonText || "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
