import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Star, Heart, SlidersHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";
import { useFilter } from "../contexts/FilterContext";
import { productsApi, categoriesApi } from "@/services/api";

const defaultCategories = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Books & Media",
];

const priceRanges = [
  { label: "Under ₹1,000", value: "0-1000" },
  { label: "₹1,000 – ₹5,000", value: "1000-5000" },
  { label: "₹5,000 – ₹20,000", value: "5000-20000" },
  { label: "₹20,000 – ₹50,000", value: "20000-50000" },
  { label: "Over ₹50,000", value: "50000-999999" },
];

function mapBackendProduct(p: any) {
  const v = p.variants?.[0] || {};
  return {
    id: p._id,
    _id: p._id,
    sku: v.sku,
    name: p.title || p.name,
    category: p.category?.name || p.category || "",
    price: p.offerPrice || v.sellingPrice || p.price || 0,
    originalPrice: p.offerPrice ? p.price : undefined,
    image: v.image || p.images?.[0] || "https://placehold.co/400x400?text=No+Image",
    rating: 4.8,
    reviewsCount: p.reviews?.length || 12,
    badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
    inStock: v.isActive !== false && (v.currentStock ?? 0) > 0,
  };
}

export function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const [productList, setProductList] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange("");
    setSelectedMinRating(null);
  };
  const [sortBy, setSortBy] = useState("featured");
  const { isFilterOpen, closeFilter } = useFilter();
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.list().catch(() => []),
      categoriesApi.list().catch(() => []),
    ])
      .then(([res, catsRes]) => {
        const raw = Array.isArray(res) ? res : res.products || [];
        const mapped = raw.map(mapBackendProduct);
        setProductList(mapped);

        const rawCats = Array.isArray(catsRes) ? catsRes : (catsRes as any)?.data || [];
        if (rawCats.length > 0) {
          setCategories(rawCats.map((c: any) => c.name));
        }
      })
      .catch((err) => console.error("Products page fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  let products = productList;

  // Filter by category: URL categoryParam or selectedCategories checkbox
  const activeCategories = selectedCategories.length > 0 
    ? selectedCategories 
    : (categoryParam ? [categoryParam] : []);

  if (activeCategories.length > 0) {
    products = products.filter(product => {
      const prodCat = (product.category || "").toLowerCase();
      return activeCategories.some(cat => {
        const c = cat.toLowerCase();
        const firstWord = c.split(/[\s&]+/)[0];
        return prodCat.includes(c) || prodCat.includes(firstWord);
      });
    });
  }

  // Filter by subcategory
  if (subcategoryParam) {
    const subLower = subcategoryParam.toLowerCase();
    products = products.filter(product => 
      product.subcategory?.toLowerCase().includes(subLower) ||
      product.name?.toLowerCase().includes(subLower)
    );
  }

  // Filter by price range
  if (selectedPriceRange) {
    const [min, max] = selectedPriceRange.split("-").map(Number);
    products = products.filter(product => {
      const price = product.price || 0;
      return price >= min && (max ? price <= max : true);
    });
  }

  // Filter by min rating
  if (selectedMinRating != null) {
    products = products.filter(product => (product.rating || 0) >= selectedMinRating);
  }

  // Sort products
  if (sortBy === "price-low") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    products = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "newest") {
    products = [...products].reverse();
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer text-foreground dark:text-muted"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Price Range</h3>
        <div className="space-y-4">
          <Select
            value={selectedPriceRange}
            onValueChange={setSelectedPriceRange}
          >
            <SelectTrigger className="w-full glass-input">
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent className="glass-lg">
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedMinRating === rating}
                onCheckedChange={() => setSelectedMinRating(rating)}
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < rating
                        ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                        : "text-muted"
                      }`}
                  />
                ))}
                <span className="ml-1">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Availability</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="in-stock" />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer text-foreground dark:text-muted">
              In Stock
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="on-sale" />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer text-foreground dark:text-muted">
              On Sale
            </Label>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={clearFilters}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-transparent relative overflow-hidden">
      {/* Animated Background Gradients - macOS style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/25 via-red-500/15 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/15 via-orange-500/15 to-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Glass Effect */}
        <div className="glass-navbar border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {categoryParam ? `${categoryParam} Products` : "All Products"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover our complete collection of premium products
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            {/* Products Grid */}
            <div className="flex-1 w-full">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm text-foreground font-medium">
                    Showing {products.length} products
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Filter Button */}
                  <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="glass-input flex items-center gap-2 text-foreground border-gray-300 dark:border-gray-600">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">Filters</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="glass-lg w-80 overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="text-foreground">Filters</SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                          Refine your product search
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 glass-input bg-background dark:bg-transparent text-foreground border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="glass-lg">
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-card border border-border group overflow-hidden hover:scale-102 sm:hover:scale-105 transition-all duration-300 rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg"
                    style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                  >
                    <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      {product.badge && (
                        <Badge className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 bg-gradient-to-r from-[var(--primary-color)] to-orange-600 text-inverse hover:from-[var(--primary-color)] hover:to-orange-600 pulse-glow text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 border-0">
                          {product.badge}
                        </Badge>
                      )}
                      {!product.inStock && (
                        <Badge className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 bg-red-600 text-inverse hover:bg-red-600 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5">
                          Out of Stock
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className={`absolute top-1 left-1 sm:top-2 sm:left-2 z-10 opacity-100 transition-all size-6 sm:size-7 shadow-sm ${
                          isInWishlist(product.id)
                            ? "bg-red-500 text-white hover:bg-red-600 border-0"
                            : "bg-background/90 dark:bg-card text-foreground hover:bg-muted"
                        }`}
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
                          className={`size-3 sm:size-3.5 transition-all ${
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
                    <div className="p-2 sm:p-3 bg-card">
                      <Badge variant="outline" className="mb-1 sm:mb-1.5 text-[9px] sm:text-[10px] border-gray-300 dark:border-gray-600">
                        {product.category}
                      </Badge>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-1 sm:mb-1.5 line-clamp-2">
                        <Link
                          href={`/products/${product.id}`}
                          className="hover:text-[var(--primary-color)] transition-colors"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-1 mb-1 sm:mb-2">
                        <div className="flex">{[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-2.5 sm:size-3 ${i < Math.floor(product.rating)
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
  className="w-full bg-[var(--primary-color)] text-white hover:bg-orange-600 h-9 text-sm font-semibold transition-all duration-200 border-0"
  disabled={!product.inStock}
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) {
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
    }
  }}
>
  {product.inStock ? "Add to Cart" : "Out of Stock"}
</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Sheet (Modal) */}
        <Sheet open={isFilterOpen} onOpenChange={(open) => !open && closeFilter()}>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your product search</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
