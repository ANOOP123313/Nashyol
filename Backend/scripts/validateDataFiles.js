import { electronicsProducts } from "./data/electronicsProducts.js";
import { fashionProducts } from "./data/fashionProducts.js";
import { homeGardenProducts } from "./data/homeGardenProducts.js";
import { sportsProducts } from "./data/sportsProducts.js";
import { beautyProducts } from "./data/beautyProducts.js";
import { booksProducts } from "./data/booksProducts.js";

const allSets = [
  { name: "Electronics", items: electronicsProducts },
  { name: "Fashion", items: fashionProducts },
  { name: "Home & Garden", items: homeGardenProducts },
  { name: "Sports & Outdoors", items: sportsProducts },
  { name: "Beauty & Personal Care", items: beautyProducts },
  { name: "Books & Media", items: booksProducts },
];

console.log("=== Validating Data Sets ===");
let total = 0;
for (const set of allSets) {
  console.log(`\nCategory: ${set.name} (${set.items.length} products)`);
  total += set.items.length;
  for (const p of set.items) {
    const hasSpecs = p.specifications && p.specifications.length > 0;
    const hasVariants = p.variants && p.variants.length > 0;
    const hasReviews = p.reviews && p.reviews.length > 0;
    const hasImages = p.images && p.images.length > 0;
    if (!hasSpecs || !hasVariants || !hasReviews || !hasImages) {
      console.error(`  ⚠️ INCOMPLETE: ${p.title} (subCat: ${p.subCategory})`);
    } else {
      console.log(`  ✓ [${p.subCategory}] ${p.title} | Specs: ${p.specifications.length} | Reviews: ${p.reviews.length}`);
    }
  }
}

console.log(`\nTotal real products ready to seed: ${total}`);
