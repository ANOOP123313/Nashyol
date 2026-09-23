import { useState, useEffect } from "react";
import { ArrowRight, Star, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { productsApi } from "@/services/api";

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    productsApi.featured(6)
      .then((res) => {
        const raw = Array.isArray(res) ? res : [];
        const mapped = raw.map((p) => {
          const v = p.variants?.[0] || {};
          return {
            id: p._id,
            name: p.title || p.name,
            image: v.image || p.images?.[0] || "https://placehold.co/300x300?text=No+Image",
            price: v.sellingPrice || p.offerPrice || p.price || 0,
            originalPrice: p.offerPrice ? v.sellingPrice : undefined,
            category: p.category?.name || "Product",
            rating: 4.8,
            reviews: p.reviews?.length || 0,
            badge: p.offerPrice ? "Sale" : p.featured ? "Featured" : undefined,
            bgColor: "bg-card text-card-foreground",
          };
        });
        setProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-6 bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
        </div>
        <Link href="/products" className="text-[var(--primary-color)] text-sm font-semibold hover:underline">
          View All →
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Hand-picked items just for you</p>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {products.map((product) => (
          <Link key={product.id}
            href={`/products/${product.id}`}
            className="flex-shrink-0 w-[280px] group"
          >
            <div className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`relative ${product.bgColor} p-4 h-[200px] flex items-center justify-center`}>
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[var(--primary-color)] text-inverse text-xs font-bold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-background dark:bg-card text-card-foreground">
                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                <h3 className="font-bold text-base text-foreground mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${
                          i < Math.floor(product.rating)
                            ? "fill-[var(--primary-color)] text-[var(--primary-color)]"
                            : "text-muted dark:text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-bold text-foreground">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground line-through ml-2">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CategoryGridSection({ title, category, items }: {
  title: string;
  category: string;
  items: Array<{ name?: string; title?: string; image: string; link?: string }>;
}) {
  const viewAllLink = `/category?category=${encodeURIComponent(category)}`;

  return (
    <div className="px-4 py-6 bg-transparent">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Link href={viewAllLink} className="text-[var(--primary-color)] text-sm font-semibold hover:underline">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {items.map((item, index) => {
          const itemName = item.name || item.title || `Item ${index + 1}`;
          const itemLink = item.link || `/category?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(itemName)}`;

          return (
            <Link
              key={index}
              href={itemLink}
              className="group"
            >
              <div className="relative rounded-xl overflow-hidden aspect-square shadow-md hover:shadow-lg transition-all">
                <ImageWithFallback
                  src={item.image}
                  alt={itemName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <span className="text-inverse text-xs font-semibold p-2 w-full text-center line-clamp-1">
                    {itemName}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


