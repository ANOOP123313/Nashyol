import { useEffect, useState } from "react";
import { homePageApi, categoriesApi } from "./api";

export interface SubcategoryItem {
  name: string;
  image: string;
  link?: string;
}

// ─── Default Rich Subcategories with High-Resolution Curated Images ──────────

export const FALLBACK_SUBCATEGORIES: Record<string, SubcategoryItem[]> = {
  Electronics: [
    { name: "Smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
    { name: "Laptops & Computers", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
    { name: "Headphones & Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { name: "Smart Watches", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400" },
    { name: "Cameras & Photography", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400" },
    { name: "Gaming & Consoles", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400" },
    { name: "Tablets", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400" },
    { name: "Smart Home", image: "https://images.unsplash.com/photo-1558089687-e5c0c58d7c49?w=400" },
    { name: "TV & Video", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400" },
    { name: "Computer Accessories", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" },
    { name: "Audio & Speakers", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { name: "Power Banks & Storage", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400" },
  ],
  Fashion: [
    { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" },
    { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
    { name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400" },
    { name: "Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { name: "Sunglasses", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    { name: "EID", image: "https://images.unsplash.com/photo-1767775498862-d4740ce574ce?w=400" },
    { name: "Tshirts, Shirts", image: "https://images.unsplash.com/photo-1516442443906-71605254b628?w=400" },
    { name: "Sports Shoes", image: "https://images.unsplash.com/photo-1695459468644-717c8ae17eed?w=400" },
    { name: "Kids Clothing", image: "https://images.unsplash.com/photo-1733924304841-7320116fbe69?w=400" },
    { name: "Backpacks", image: "https://images.unsplash.com/photo-1655303219938-3a771279c801?w=400" },
    { name: "Kurtas", image: "https://images.unsplash.com/photo-1727835523550-18478cacefa2?w=400" },
    { name: "Casual Wear", image: "https://images.unsplash.com/photo-1640989818014-b4363bd44443?w=400" },
    { name: "Tracksuits", image: "https://images.unsplash.com/photo-1768929096095-8f379b34278b?w=400" },
    { name: "Trendy Street", image: "https://images.unsplash.com/photo-1768610284447-2ec9e61bd63b?w=400" },
    { name: "Kurta Sets", image: "https://images.unsplash.com/photo-1766994063823-ed214f883548?w=400" },
  ],
  "Home & Garden": [
    { name: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400" },
    { name: "Bedding", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
    { name: "Lighting", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400" },
    { name: "Decor", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400" },
    { name: "Kitchen", image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400" },
    { name: "Storage", image: "https://images.unsplash.com/photo-1595428773653-30a35a1c7a1b?w=400" },
    { name: "Rugs", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400" },
    { name: "Curtains", image: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400" },
    { name: "Plants", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400" },
    { name: "Garden Tools", image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400" },
    { name: "Outdoor", image: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400" },
    { name: "Bathroom", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400" },
    { name: "Tableware", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400" },
    { name: "Mirrors", image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400" },
    { name: "Wall Art", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400" },
    { name: "Cushions", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400" },
  ],
  Sports: [
    { name: "Running Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { name: "Yoga Mats", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400" },
    { name: "Dumbbells", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400" },
    { name: "Sports Wear", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400" },
    { name: "Bicycles", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400" },
    { name: "Basketballs", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400" },
    { name: "Fitness Trackers", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400" },
    { name: "Protein Shakes", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400" },
    { name: "Gym Bags", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
    { name: "Resistance Bands", image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400" },
    { name: "Tennis Rackets", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400" },
    { name: "Swimming Gear", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400" },
    { name: "Boxing Gloves", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400" },
    { name: "Skateboards", image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=400" },
    { name: "Golf Clubs", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400" },
    { name: "Water Bottles", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400" },
  ],
  Beauty: [
    { name: "Skincare", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
    { name: "Makeup", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400" },
    { name: "Perfumes", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400" },
    { name: "Hair Care", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400" },
    { name: "Nail Polish", image: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400" },
    { name: "Face Masks", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400" },
    { name: "Lip Balm", image: "https://images.unsplash.com/photo-1590156206916-ab87dc6b5ea0?w=400" },
    { name: "Eye Shadow", image: "https://images.unsplash.com/photo-1631214524020-7e18db7f0796?w=400" },
    { name: "Foundation", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400" },
    { name: "Brushes", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400" },
    { name: "Moisturizers", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400" },
    { name: "Serums", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400" },
    { name: "Lipstick", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400" },
    { name: "Blush", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
    { name: "Mascara", image: "https://images.unsplash.com/photo-1631730486572-226d1f595b97?w=400" },
    { name: "Body Lotion", image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400" },
  ],
  Books: [
    { name: "Fiction", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
    { name: "Non-Fiction", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400" },
    { name: "Self-Help", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { name: "Biographies", image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400" },
    { name: "Science", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
    { name: "History", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400" },
    { name: "Children", image: "https://images.unsplash.com/photo-1503455637927-730bce8583c0?w=400" },
    { name: "Comics", image: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=400" },
    { name: "Poetry", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400" },
    { name: "Mystery", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400" },
    { name: "Romance", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400" },
    { name: "Thriller", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" },
    { name: "Fantasy", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400" },
    { name: "Horror", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400" },
    { name: "Cookbooks", image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400" },
    { name: "Travel", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400" },
  ],
};

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

// Cached API responses to prevent multiple network roundtrips across components
let cachedHomePromise: Promise<any> | null = null;
let cachedCatsPromise: Promise<any> | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 20000; // 20s

function getCachedHomePage() {
  const now = Date.now();
  if (!cachedHomePromise || now - lastCacheTime > CACHE_TTL_MS) {
    lastCacheTime = now;
    cachedHomePromise = homePageApi.getHomePage().catch(() => ({ success: false, sections: [] }));
  }
  return cachedHomePromise;
}

function getCachedCategories() {
  const now = Date.now();
  if (!cachedCatsPromise || now - lastCacheTime > CACHE_TTL_MS) {
    cachedCatsPromise = categoriesApi.list().catch(() => []);
  }
  return cachedCatsPromise;
}

/**
 * Fetch and assemble all subcategories shown in the Home Page for a specific category,
 * combined with any database category subcategories and curated fallback items.
 */
export async function getCategorySubcategories(categoryName: string): Promise<SubcategoryItem[]> {
  const canonical = getCanonicalCategoryName(categoryName);
  const fallbacks = FALLBACK_SUBCATEGORIES[canonical] || [];

  try {
    const [homeData, liveCategories] = await Promise.all([
      getCachedHomePage(),
      getCachedCategories(),
    ]);

    const sections = Array.isArray(homeData?.sections) ? homeData.sections : [];
    const categoriesList = Array.isArray(liveCategories) ? liveCategories : [];

    const result: SubcategoryItem[] = [];
    const seenNames = new Set<string>();

    const addSub = (name: string, image?: string, link?: string) => {
      if (!name) return;
      const cleanName = name.trim();
      const lower = cleanName.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        // Find matching image from fallbacks if image is missing/broken
        const fallbackImg = fallbacks.find(
          f => f.name.toLowerCase() === lower || f.name.toLowerCase().includes(lower) || lower.includes(f.name.toLowerCase())
        )?.image;
        result.push({
          name: cleanName,
          image: image || fallbackImg || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          link: link || `/category?category=${encodeURIComponent(canonical)}&subcategory=${encodeURIComponent(cleanName)}`,
        });
      }
    };

    // 1. First Priority: Items from the Home Page CMS "category_products" section for this category
    const matchingSections = sections.filter((s: any) =>
      s.isActive !== false &&
      (s.sectionType === "category_products" || s.sectionType === "product_grid") &&
      matchesCategory(canonical, s.settings?.categoryName || s.title || "")
    );

    for (const sec of matchingSections) {
      if (Array.isArray(sec.items)) {
        for (const item of sec.items) {
          const itemName = item.title || item.name;
          if (itemName) {
            addSub(itemName, item.image, item.link);
          }
        }
      }
    }

    // 2. If category is Fashion, also pull from Home Page "quick_categories" (Popular Categories)
    if (canonical === "Fashion") {
      const quickCatSec = sections.find((s: any) =>
        s.isActive !== false && s.sectionType === "quick_categories"
      );
      if (quickCatSec && Array.isArray(quickCatSec.items)) {
        for (const item of quickCatSec.items) {
          const itemName = item.title || item.name;
          if (itemName) {
            addSub(itemName, item.image, item.link);
          }
        }
      }
    }

    // 3. Second Priority: Subcategories from the database Category document
    const foundLiveCat = categoriesList.find((c: any) =>
      matchesCategory(canonical, c.name || "") || matchesCategory(canonical, c.slug || "")
    );
    if (foundLiveCat && Array.isArray(foundLiveCat.subCategories)) {
      for (const sc of foundLiveCat.subCategories) {
        if (sc?.name) {
          addSub(sc.name, sc.image);
        }
      }
    }

    // 4. Third Priority: Merge all curated fallback items for this category so nothing is missing
    for (const fb of fallbacks) {
      addSub(fb.name, fb.image, fb.link);
    }

    return result.length > 0 ? result : fallbacks;
  } catch (err) {
    console.error("Failed to resolve category subcategories:", err);
    return fallbacks;
  }
}

/**
 * Custom React Hook to load all subcategories for a given category name,
 * dynamically synchronized with the Home Page CMS sections.
 */
export function useCategorySubcategories(categoryName: string) {
  const canonical = getCanonicalCategoryName(categoryName);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>(
    () => FALLBACK_SUBCATEGORIES[canonical] || []
  );
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
