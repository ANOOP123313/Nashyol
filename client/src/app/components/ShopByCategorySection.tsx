import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { categoriesApi } from "@/services/api";

const categoryGradients = [
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-purple-500 to-purple-600",
  "from-amber-500 to-amber-600",
];

export function ShopByCategorySection() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    categoriesApi.list()
      .then((res) => {
        const raw = Array.isArray(res) ? res : [];
        const mapped = raw.map((cat, i) => ({
          name: cat.name,
          count: "Explore Collection",
          image: cat.image || "https://images.unsplash.com/photo-1524282745852-a463fa495a7f?w=800",
          color: categoryGradients[i % categoryGradients.length],
        }));
        setCategories(mapped);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
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
          <Button variant="ghost" className="text-[var(--primary-color)] hover:text-orange-600" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-gray-800 hover:border-[var(--primary-color)] bg-card text-card-foreground rounded-3xl">
                <div className="relative aspect-square">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-inverse text-center p-4">
                    <h3 className="font-bold text-lg mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


