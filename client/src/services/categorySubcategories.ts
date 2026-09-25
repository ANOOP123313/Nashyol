import { useEffect, useState } from "react";
import { categoriesApi } from "./api";

export interface SubcategoryItem {
  name: string;
  image: string;
  link?: string;
}

export const FALLBACK_SUBCATEGORIES: Record<string, SubcategoryItem[]> = {};

/**
 * Robust category matching: handles variations like
 * 'Electronics' <-> 'Electronics Products'
 * 'Sports' <-> 'Sports & Outdoors' <-> 'Sports Products'
 * 'Beauty' <-> 'Beauty & Personal Care' <-> 'Beauty Products'
 * 'Home & Garden' <-> 'Home' <-> 'Home & Garden Products'
 */
export function matchesCategory(target: string, candidate: string): boolean {
  if (!target || !candidate) return false;
  const t = target.toLowerCase().trim();
  const c = candidate.toLowerCase().trim();
  if (t === c) return true;

  const tClean = t.replace(/products|items|category/gi, "").trim();
  const cClean = c.replace(/products|items|category/gi, "").trim();
  if (tClean && cClean && (tClean === cClean || tClean.includes(cClean) || cClean.includes(tClean))) {
    return true;
  }

  const keyWords = ["electronics", "fashion", "sports", "beauty", "books", "home", "garden"];
  for (const kw of keyWords) {
    if (t.includes(kw) && c.includes(kw)) return true;
  }
  return false;
}

export function getCanonicalCategoryName(name: string): string {
  if (!name) return "Fashion";
  const n = name.toLowerCase();
  if (n.includes("electr")) return "Electronics";
  if (n.includes("fash")) return "Fashion";
  if (n.includes("home") || n.includes("garden")) return "Home & Garden";
  if (n.includes("sport")) return "Sports";
  if (n.includes("beaut")) return "Beauty";
  if (n.includes("book")) return "Books";
  return name;
}

let cachedCatsPromise: Promise<any> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 20000; // 20s

function getCachedCategories() {
  const now = Date.now();
  if (!cachedCatsPromise || now - lastCacheTime > CACHE_TTL_MS) {
    lastCacheTime = now;
    cachedCatsPromise = categoriesApi.list().catch(() => []);
  }
  return cachedCatsPromise;
}

/**
 * Fetch and assemble only real subcategories from the database Category document.
 */
export async function getCategorySubcategories(categoryName: string): Promise<SubcategoryItem[]> {
  const canonical = getCanonicalCategoryName(categoryName);

  try {
    const liveCategories = await getCachedCategories();
    const categoriesList = Array.isArray(liveCategories) ? liveCategories : [];

    const foundLiveCat = categoriesList.find((c: any) =>
      c.isActive !== false &&
      (matchesCategory(canonical, c.name || "") || matchesCategory(canonical, c.slug || "") || matchesCategory(categoryName, c.name || ""))
    );

    if (foundLiveCat && Array.isArray(foundLiveCat.subCategories)) {
      const activeSubs = foundLiveCat.subCategories
        .filter((sc: any) => sc && sc.isActive !== false && sc.name)
        .map((sc: any) => ({
          name: sc.name.trim(),
          image: sc.image || "",
          link: `/category?category=${encodeURIComponent(foundLiveCat.name || canonical)}&subcategory=${encodeURIComponent(sc.name.trim())}`,
        }));
      return activeSubs;
    }

    return [];
  } catch (err) {
    console.error("Failed to resolve category subcategories:", err);
    return [];
  }
}

/**
 * Custom React Hook to load only real subcategories for a given category name from the database.
 */
export function useCategorySubcategories(categoryName: string) {
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getCategorySubcategories(categoryName)
      .then((items) => {
        if (isMounted) {
          setSubcategories(items);
        }
      })
      .catch((err) => {
        console.error("useCategorySubcategories error:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [categoryName]);

  return { subcategories, loading };
}
