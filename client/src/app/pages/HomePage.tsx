import { useState, useEffect } from "react";
import { bannersApi, productsApi, homePageApi } from "@/services/api";
import { MobileHomeView } from "../components/MobileHomeView";
import { HomePageSectionRenderer } from "../components/HomePageSectionRenderer";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  textPosition: string;
}

function mapApiProduct(p: Record<string, unknown>) {
  const cat = p.category as Record<string, unknown> | undefined;
  const images = (p.images as string[] | undefined) || [];
  const variants = (p.variants as Array<Record<string, unknown>> | undefined) || [];
  const firstVariant = variants[0] || {};

  return {
    id: (p._id as string) ?? "",
    name: (p.title as string) ?? (p.name as string) ?? "",
    category: (cat?.name as string) ?? "",
    price: (firstVariant.sellingPrice as number) ?? (p.offerPrice as number) ?? (p.price as number) ?? 0,
    originalPrice: p.offerPrice != null ? (firstVariant.sellingPrice as number) : undefined,
    image: (firstVariant.image as string) || images[0] || "",
    badge: p.offerPrice != null ? "Sale" : undefined,
    rating: 4.8,
    reviews: Array.isArray(p.reviews) ? p.reviews.length : 0,
    inStock: ((firstVariant.currentStock as number) ?? (p.stock as number) ?? 1) > 0,
  };
}

export function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [apiBanners, setApiBanners] = useState<Array<{ image: string; title?: string; subtitle?: string; link?: string; linkText?: string }>>([]);
  const [apiFeatured, setApiFeatured] = useState<Array<{ id: string; name: string; category: string; price: number; originalPrice?: number; image: string; badge?: string; rating: number; reviews: number; inStock?: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    Promise.all([
      homePageApi.getHomePage().catch(() => ({ success: false, sections: [] })),
      bannersApi.list().catch(() => []),
      productsApi.featured(12).catch(() => []),
    ])
      .then(([homeData, banners, featured]) => {
        if (homeData && Array.isArray(homeData.sections) && homeData.sections.length > 0) {
          setSections(homeData.sections);
        }
        setApiBanners(Array.isArray(banners) ? banners : []);
        setApiFeatured((Array.isArray(featured) ? featured : []).map(mapApiProduct));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const heroSlides: HeroSlide[] = apiBanners.map((b, i) => ({
    id: String(i),
    image: b.image,
    title: b.title ?? "",
    description: b.subtitle ?? "",
    buttonText: b.linkText ?? "Shop Now",
    buttonLink: b.link ?? "/category",
    textPosition: "center" as const,
  }));

  // Show mobile view on small screens (below 640px)
  if (isMobile) {
    return (
      <MobileHomeView
        sections={sections}
        featuredProducts={apiFeatured}
        heroSlides={heroSlides}
      />
    );
  }

  const featuredProducts = apiFeatured;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Background blur accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-stone-300/80 via-orange-200/60 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-orange-300/50 via-amber-200/30 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-stone-200/75 via-orange-100/60 to-transparent blur-3xl" />
      </div>

      {/* Dynamic Content rendered via CMS Section Renderer */}
      <div className="relative z-10">
        <HomePageSectionRenderer
          sections={sections}
          heroSlides={heroSlides}
          featuredProducts={featuredProducts}
        />
      </div>
    </div>
  );
}
