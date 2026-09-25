import { useState, useEffect } from "react";
import { Search, ShoppingCart, MapPin, ChevronDown, ShoppingBag, TrendingUp, Truck, Shield, Headphones, RotateCcw, Star, ArrowRight, Heart, Home, Grid3x3, User, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AdBanner } from "./AdBanner";
import { ThemeToggle } from "./ThemeToggle";
import { FeaturedProductsSection, CategoryGridSection } from "./MobileHomeSections";
import { useWishlist } from "../contexts/WishlistContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const heroBanner = null;

export function MobileHomeView({
  sections = [],
  featuredProducts: propFeaturedProducts = [],
  heroSlides: propHeroSlides = []
}: {
  sections?: any[];
  featuredProducts?: any[];
  heroSlides?: any[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Thiruvananthapuram");
  const navigate = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const featuresSection = sections.find(s => s.sectionKey === "service_features" || s.sectionType === "service_features");
  const shopByCategorySection = sections.find(s => s.sectionKey === "shop_by_category" || s.sectionType === "shop_by_category");
  const specialOffersSection = sections.find(s => s.sectionKey === "special_offers" || s.sectionType === "special_offers");
  const rewardsSection = sections.find(s => s.sectionKey === "rewards" || s.sectionType === "rewards");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearch(false);
      navigate.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const locations = [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Palakkad",
    "Alappuzha",
    "Kannur",
    "Kottayam",
    "Malappuram"
  ];

  const defaultHeroSlides = [
    {
      badge: "New Season Arrivals",
      title: "Discover Your Style with NAASHYOL",
      description: "Shop the latest trends in electronics, fashion, home decor, and more. Quality products at unbeatable prices.",
      buttons: [
        { text: "Shop Now", icon: ShoppingBag, primary: true, link: "/products" },
        { text: "View Trending", icon: TrendingUp, primary: false, link: "/products?sort=trending" },
      ],
    },
    {
      badge: "Hot Deals",
      title: "Exclusive Offers Just for You",
      description: "Get up to 50% off on selected items. Limited time offer on premium products.",
      buttons: [
        { text: "Shop Now", icon: ShoppingBag, primary: true, link: "/products?sale=true" },
        { text: "View All Deals", icon: TrendingUp, primary: false, link: "/products?deals=true" },
      ],
    },
    {
      badge: "Best Sellers",
      title: "Top Rated Products",
      description: "Explore our most popular items loved by thousands of customers worldwide.",
      buttons: [
        { text: "Shop Now", icon: ShoppingBag, primary: true, link: "/products?sort=bestsellers" },
        { text: "View Trending", icon: TrendingUp, primary: false, link: "/products?sort=rating" },
      ],
    },
  ];

  const heroSlides = (propHeroSlides && propHeroSlides.length > 0)
    ? propHeroSlides.map((s: any) => ({
      badge: s.badge || "Featured",
      title: s.title || "Exclusive Collection",
      description: s.description || "Discover premium products handpicked for you.",
      image: s.image,
      buttons: s.buttons || [
        { text: s.buttonText || "Shop Now", icon: ShoppingBag, primary: true, link: s.buttonLink || "/products" },
        { text: "View Trending", icon: TrendingUp, primary: false, link: "/products?sort=trending" },
      ],
    }))
    : defaultHeroSlides;

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over ₹500",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Contact us anytime",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "100% Protected",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-Day Return Policy",
    },
  ];


  const featuredProducts = (propFeaturedProducts && propFeaturedProducts.length > 0)
    ? propFeaturedProducts.map((p: any) => ({
      id: p._id || p.id,
      name: p.name || p.title || "Product",
      image: p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      price: typeof p.price === "number" ? p.price : 0,
      originalPrice: typeof p.originalPrice === "number" ? p.originalPrice : undefined,
      category: typeof p.category === "object" ? p.category?.name : (p.category || "General"),
      rating: typeof p.rating === "number" ? p.rating : 4.8,
      reviews: typeof p.reviews === "number" ? p.reviews : (p.reviewsCount || 0),
      badge: p.badge || (p.isFeatured ? "Featured" : undefined),
    }))
    : [];

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    swipeToSlide: true,
    centerMode: false,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[linear-gradient(45deg,#6b7280_0%,#9ca3af_20%,#d1d5db_40%,#fed7aa_70%,#ea580c_100%)] dark:bg-transparent">
      {/* Mobile Header with Glass Effect */}
      <div className="bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse px-4 py-4 sticky top-0 z-50 shadow-xl">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold tracking-wide text-inverse" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>NAASHYOL</h1>
        </div>
      </div>

      {/* Search Modal Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] bg-inverse/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card p-4 shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleSearch();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-muted border border-gray-200 dark:border-gray-700 rounded-full text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="p-3 bg-muted hover:bg-border dark:hover:bg-muted rounded-full transition-colors"
              >
                <span className="text-foreground font-medium text-sm">Cancel</span>
              </button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground px-2">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Electronics', 'Fashion', 'Home Decor', 'Sports', 'Beauty'].map((term) => (
                  <Link key={term}
                    href={`/products?category=${term}`}
                    onClick={() => setShowSearch(false)}
                    className="px-4 py-2 bg-muted hover:bg-[var(--primary-color)] hover:text-inverse dark:hover:bg-[var(--primary-color)] rounded-full text-sm font-medium text-muted-foreground transition-all"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Bar with Glass Effect */}
      <div className="px-4 py-3 bg-card border-b border-border shadow-sm">
        <button
          onClick={() => setShowLocationModal(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-muted border border-gray-200 dark:border-border rounded-full hover:bg-border/60 dark:hover:bg-muted transition-all duration-300"
        >
          <MapPin className="size-5 text-[var(--primary-color)] flex-shrink-0" />
          <span className="flex-1 text-left text-sm font-medium text-foreground">
            Deliver to {selectedLocation}
          </span>
          <ChevronDown className="size-5 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[60] bg-inverse/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="size-6 text-[var(--primary-color)]" />
                  <h3 className="text-lg font-bold text-foreground">Select Delivery Location</h3>
                </div>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-2 hover:bg-muted dark:hover:bg-muted rounded-full transition-colors"
                >
                  <span className="text-2xl text-muted-foreground">&times;</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Choose your location for accurate delivery estimates
              </p>
            </div>

            {/* Locations List */}
            <div className="overflow-y-auto max-h-[calc(70vh-120px)] px-6 py-4">
              <div className="space-y-2">
                {locations.map((location) => (
                  <button
                    key={location}
                    onClick={() => {
                      setSelectedLocation(location);
                      setShowLocationModal(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${selectedLocation === location
                        ? "bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse shadow-lg"
                        : "bg-muted hover:bg-border/60 dark:hover:bg-muted text-foreground"
                      }`}
                  >
                    <MapPin
                      className={`size-5 flex-shrink-0 ${selectedLocation === location ? "text-inverse" : "text-[var(--primary-color)]"
                        }`}
                    />
                    <span className="flex-1 text-left font-medium">{location}</span>
                    {selectedLocation === location && (
                      <svg className="size-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Carousel */}
      <div className="relative bg-gradient-to-r from-[var(--primary-color)] to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroSlides.map((slide, index) => (
              <div key={index} className="min-w-full px-4 py-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Left Content */}
                  <div className="flex-1 text-inverse">
                    <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                      <span className="text-xs font-medium">✨ {slide.badge}</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-sm md:text-base text-inverse/90 mb-6 leading-relaxed">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {slide.buttons.map((button, btnIndex) => {
                        const Icon = button.icon;
                        return (
                          <Link key={btnIndex} href={button.link}>
                            <button
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${button.primary
                                  ? "bg-background text-[var(--primary-color)] hover:bg-muted"
                                  : "bg-background/20 backdrop-blur-sm text-inverse border border-white/30 hover:bg-background/30"
                                }`}
                            >
                              <Icon className="size-4" />
                              {button.text}
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 pb-6">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${currentSlide === index
                  ? "w-8 bg-background"
                  : "w-2 bg-background/40 hover:bg-background/60"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>



      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Category Products Sections (Dynamic from Home Page Section Manager) */}
      {(() => {
        const dynamicCatSections = (sections || []).filter(
          (s: any) =>
            (s.sectionType === "category_products" || s.sectionType === "shop_by_category") &&
            s.isActive !== false &&
            Array.isArray(s.items) &&
            s.items.length > 0
        );

        if (dynamicCatSections.length > 0) {
          return dynamicCatSections.map((sec: any) => (
            <CategoryGridSection
              key={sec._id || sec.sectionKey}
              title={sec.title || sec.sectionKey}
              category={sec.settings?.categoryName || sec.title || "Category"}
              items={sec.items}
            />
          ));
        }

        return null;
      })()}

      {/* For You Section */}
      {featuredProducts.length > 0 && (
        <div className="py-6 bg-transparent">
          <div className="px-4 flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">For You</h2>
            <Link href="/products" className="text-[var(--primary-color)] text-sm font-semibold hover:underline transition-all">
              View All →
            </Link>
          </div>

          {/* Featured Badge */}
          <div className="px-4 mb-6">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse text-xs font-semibold px-6 py-2.5 rounded-full shadow-lg pulse-glow">
              ✨ Featured
            </span>
          </div>

          {/* Product Carousel */}
          <div className="featured-products-carousel">
            <Slider {...carouselSettings}>
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="px-1">
                  <Link href={`/products/${product.id}`}
                    className="block"
                  >
                    <div className="glass-card rounded-2xl p-5 mx-2 hover:shadow-2xl transition-all duration-300">
                      {/* Product Image Container */}
                      <div className="relative mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <div className="aspect-square">
                          {product.badge && (
                            <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse text-xs font-semibold px-3 py-1 shadow-lg">
                              {product.badge}
                            </Badge>
                          )}
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <button
                            className="absolute top-3 right-3 bg-background/90 dark:bg-card text-foreground p-2 rounded-full shadow-md hover:opacity-100 transition-all active:scale-95"
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
                          >
                            <Heart
                              className="size-4 text-[var(--primary-color)]"
                              fill={isInWishlist(product.id) ? "var(--primary-color)" : "none"}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-3">
                        {/* Product Name */}
                        <h3 className="text-base font-semibold text-foreground line-clamp-2 min-h-[3rem]">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3.5 ${i < Math.floor(product.rating)
                                    ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                                    : "text-muted dark:text-muted-foreground"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            ({product.reviews})
                          </span>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-end justify-between pt-2">
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-[var(--primary-color)]">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.originalPrice != null && product.originalPrice > product.price && (
                              <span className="text-sm text-muted-foreground dark:text-muted-foreground line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.originalPrice != null && product.originalPrice > product.price && (
                            <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}

      {/* Features Section */}
      {featuresSection?.isActive !== false && (
        <div className="px-4 py-6 bg-transparent">
          <Card className="p-5 bg-card border border-border shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-5">
              {featuresSection?.title || "Why Choose Us?"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(featuresSection?.items?.length
                ? featuresSection.items
                : features
              ).map((feature: any, index: number) => {
                const IconComp = feature.icon === "Truck" ? Truck : feature.icon === "RotateCcw" ? RotateCcw : feature.icon === "Shield" ? Shield : Headphones;
                return (
                  <div key={feature._id || index} className="flex flex-col items-center text-center p-3 bg-muted rounded-xl">
                    <div className="p-3 bg-gradient-to-br from-[var(--primary-color)] to-orange-600 rounded-full mb-2">
                      <IconComp className="size-5 text-inverse" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {feature.title || feature.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.description || feature.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Categories Section */}
      {shopByCategorySection?.isActive !== false && shopByCategorySection?.items?.length > 0 && (
        <div className="px-4 py-6 bg-transparent">
          <Card className="p-5 bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground">
                {shopByCategorySection?.title || "Shop by Category"}
              </h2>
              <Link href={shopByCategorySection?.settings?.viewAllLink || "/products"} className="text-[var(--primary-color)] text-sm font-semibold hover:underline">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {shopByCategorySection.items.map((category: any, index: number) => (
                <Link key={category._id || index}
                  href={category.link || `/products?category=${encodeURIComponent(category.name || category.title)}`}
                  className="group"
                >
                  <div className="relative rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-md transition-all">
                    <ImageWithFallback
                      src={category.image}
                      alt={category.name || category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient || category.color || "from-orange-500/70 to-amber-600/70"} flex flex-col items-center justify-center text-inverse`}>
                      <h3 className="text-sm font-bold mb-1 text-center px-2 line-clamp-2">
                        {category.name || category.title}
                      </h3>
                      {(category.count || category.subtitle) && (
                        <span className="text-xs opacity-90">{category.count || category.subtitle}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Ad Banner Section */}
      {specialOffersSection?.isActive !== false && specialOffersSection?.items?.length > 0 && (
        <div className="px-4 py-6 bg-transparent">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {specialOffersSection?.title || "Special Offers"}
          </h2>
          <AdBanner
            ads={specialOffersSection.items.map((it: any, i: number) => ({
              id: it._id || String(i),
              title: it.title || it.name || "",
              description: it.description || it.subtitle || "",
              discount: it.discount || it.offer,
              image: it.image,
              buttonText: it.buttonText || "Shop Now",
              buttonLink: it.buttonLink || it.link || "/category",
              type: it.type || "hero",
              backgroundColor: it.backgroundColor || it.gradient,
            }))}
          />
        </div>
      )}

      {/* CTA Banner for Rewards */}
      {rewardsSection?.isActive !== false && (
        <div className="px-4 py-6 pb-24 bg-transparent">
          <Card className="bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-background/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-background/10 rounded-full -ml-12 -mb-12" />
            <div className="relative z-10 text-center">
              <h2 className="text-2xl font-bold mb-3">
                {rewardsSection?.title || "Join Our Rewards Program"}
              </h2>
              <p className="text-sm text-orange-100 mb-6">
                {rewardsSection?.description ||
                  "Earn points with every purchase and get exclusive discounts. Refer friends and get even more rewards!"}
              </p>
              <Button
                size="lg"
                className="bg-background text-[var(--primary-color)] hover:bg-muted"
                asChild
              >
                <Link href={rewardsSection?.settings?.buttonLink || "/rewards"}>
                  {rewardsSection?.settings?.buttonText || "Learn More"}
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


