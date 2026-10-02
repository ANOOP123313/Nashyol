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
    price: (p.offerPrice as number) ?? (firstVariant.sellingPrice as number) ?? (p.price as number) ?? 0,
    originalPrice: p.offerPrice != null ? (p.price as number) : undefined,
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
  const [apiBanners, setApiBanners] = useState<Array<{ _id?: string; image: string; title?: string; subtitle?: string; link?: string; linkText?: string; type?: string; isActive?: boolean }>>([]);
  const [apiFeatured, setApiFeatured] = useState<Array<{ id: string; name: string; category: string; price: number; originalPrice?: number; image: string; badge?: string; rating: number; reviews: number; inStock?: boolean }>>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupTriggered, setPopupTriggered] = useState(false);

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
      });
  }, []);

  // Trigger popup ad when page is scrolled halfway down
  useEffect(() => {
    if (popupTriggered) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight;
      if (totalHeight > 0 && scrollPosition >= totalHeight * 0.45) {
        setShowPopup(true);
        setPopupTriggered(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [popupTriggered]);

  const cardBanners = apiBanners.filter((b) => b.type !== "popup");
  const activePopupBanner = apiBanners.find((b) => b.type === "popup" && b.isActive !== false);

  const heroSlides: HeroSlide[] = cardBanners.map((b, i) => ({
    id: b._id || String(i),
    bannerId: b._id,
    image: b.image,
    title: b.title ?? "",
    description: b.subtitle ?? "",
    buttonText: b.linkText ?? "Shop Now",
    buttonLink: b.link ?? "/category",
    textPosition: "center" as const,
  }));

  const featuredProducts = apiFeatured;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background dark:bg-transparent">
      {/* Background blur accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-stone-300/80 via-orange-200/60 to-transparent blur-3xl dark:opacity-10" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-orange-300/50 via-amber-200/30 to-transparent blur-3xl dark:opacity-10" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-stone-200/75 via-orange-100/60 to-transparent blur-3xl dark:opacity-10" />
      </div>

      {/* Dynamic Content rendered via CMS Section Renderer or Mobile View */}
      <div className="relative z-10">
        {isMobile ? (
          <MobileHomeView
            sections={sections}
            featuredProducts={apiFeatured}
            heroSlides={heroSlides}
          />
        ) : (
          <HomePageSectionRenderer
            sections={sections}
            heroSlides={heroSlides}
            featuredProducts={featuredProducts}
          />
        )}
      </div>

      {/* Popup Ad Modal */}
      {showPopup && activePopupBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full border border-orange-100 dark:border-stone-800">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-700 dark:text-stone-200 hover:bg-orange-500 hover:text-white flex items-center justify-center font-bold text-lg shadow transition-all"
            >
              ×
            </button>
            <div className="relative h-48 w-full bg-stone-100 dark:bg-stone-800">
              <img
                src={activePopupBanner.image}
                alt={activePopupBanner.title || "Special Offer"}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Special Offer
              </span>
            </div>
            <div className="p-6 text-center">
              {activePopupBanner.title && (
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                  {activePopupBanner.title}
                </h3>
              )}
              {activePopupBanner.subtitle && (
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-6 line-clamp-3">
                  {activePopupBanner.subtitle}
                </p>
              )}
              <a
                href={activePopupBanner.link || "/category"}
                onClick={() => {
                  if (activePopupBanner._id) {
                    bannersApi.click(activePopupBanner._id).catch(() => {});
                  }
                  setShowPopup(false);
                }}
                className="inline-block w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
              >
                {activePopupBanner.linkText || "Shop Now"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
