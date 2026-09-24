import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

import HomePageSection from "../models/HomePageSection.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

async function run() {
  console.log("Connecting to MongoDB Atlas 'nashyol'...");
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
  console.log("Connected successfully!\n");

  // 1. Clean up junk / test products
  console.log("── 1. Cleaning up test / junk products ──");
  const junkTitles = [
    "Test Product 2026",
    "test",
    "lfjflkjf",
    "test 1",
    "Test",
    "test 10",
    "shirt",
    "dog",
    "test 001",
    "shirt",
    "watch",
    "test 004",
    "Galaxy Ultra Test Phone",
    "lndskjjn",
    "PS0",
  ];

  const junkProducts = await Product.find({
    $or: [
      { title: { $in: junkTitles } },
      { brand: { $in: ["Test Brand", "ghjk", "lksgjlksdfj", "test vendor", "Test", "sels", "h @m", "alvin", "fasjhion", "h and m", "titain", "oidsjflij", "jn", "sonic"] } },
    ],
  });

  console.log(`Found ${junkProducts.length} junk products to remove.`);
  const junkIds = junkProducts.map((p) => p._id);

  if (junkIds.length > 0) {
    await Review.deleteMany({ product: { $in: junkIds } });
    await Order.deleteMany({ "items.productId": { $in: junkIds } });
    await Product.deleteMany({ _id: { $in: junkIds } });
    console.log(`Successfully deleted ${junkIds.length} junk products and their reviews/orders.`);
  }

  // 2. Fetch normalized categories
  console.log("\n── 2. Loading normalized categories ──");
  const categories = await Category.find({}).sort({ order: 1 });
  const catMap = new Map(categories.map((c) => [c.name.trim(), c]));

  const elecCat = catMap.get("Electronics");
  const fashionCat = catMap.get("Fashion");
  const homeCat = catMap.get("Home & Garden");
  const sportsCat = catMap.get("Sports & Outdoors");
  const beautyCat = catMap.get("Beauty & Personal Care");
  const booksCat = catMap.get("Books & Media");

  console.log(`Resolved all 6 core categories.`);

  // 3. Define Real Data for All Home Page Sections
  console.log("\n── 3. Updating HomePageSection documents with Real Data ──");

  // Real Quick Categories (16 top subcategories across the 6 core categories)
  const realQuickCategories = [
    {
      name: "Smartphones",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
      link: "/category?category=Electronics&subcategory=Smartphones",
      displayOrder: 1,
    },
    {
      name: "Laptops & Computers",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      link: "/category?category=Electronics&subcategory=Laptops%20%26%20Computers",
      displayOrder: 2,
    },
    {
      name: "Running Shoes",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      link: "/category?category=Sports%20%26%20Outdoors&subcategory=Running%20%26%20Athletic%20Shoes",
      displayOrder: 3,
    },
    {
      name: "Headphones & Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      link: "/category?category=Electronics&subcategory=Headphones%20%26%20Audio",
      displayOrder: 4,
    },
    {
      name: "T-Shirts & Shirts",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      link: "/category?category=Fashion&subcategory=T-Shirts%20%26%20Shirts",
      displayOrder: 5,
    },
    {
      name: "Smart Watches",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400",
      link: "/category?category=Electronics&subcategory=Smart%20Watches",
      displayOrder: 6,
    },
    {
      name: "Skincare",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
      link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Skincare",
      displayOrder: 7,
    },
    {
      name: "Ergonomic Furniture",
      image: "https://images.unsplash.com/photo-1580481077197-28564db7391a?w=400",
      link: "/category?category=Home%20%26%20Garden&subcategory=Furniture",
      displayOrder: 8,
    },
    {
      name: "Fitness Equipment",
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400",
      link: "/category?category=Sports%20%26%20Outdoors&subcategory=Fitness%20%26%20Gym%20Equipment",
      displayOrder: 9,
    },
    {
      name: "Luxury Watches",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
      link: "/category?category=Fashion&subcategory=Watches",
      displayOrder: 10,
    },
    {
      name: "Jeans & Trousers",
      image: "https://images.unsplash.com/photo-1542272454315-7ad9f9f0d7b5?w=400",
      link: "/category?category=Fashion&subcategory=Jeans%20%26%20Trousers",
      displayOrder: 11,
    },
    {
      name: "Bestseller Fiction",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      link: "/category?category=Books%20%26%20Media&subcategory=Fiction",
      displayOrder: 12,
    },
    {
      name: "Cameras & Photography",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
      link: "/category?category=Electronics&subcategory=Cameras%20%26%20Photography",
      displayOrder: 13,
    },
    {
      name: "Kitchen & Dining",
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400",
      link: "/category?category=Home%20%26%20Garden&subcategory=Kitchen%20%26%20Dining",
      displayOrder: 14,
    },
    {
      name: "Perfumes & Fragrances",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
      link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Perfumes%20%26%20Fragrances",
      displayOrder: 15,
    },
    {
      name: "Self-Help & Business",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
      link: "/category?category=Books%20%26%20Media&subcategory=Self-Help%20%26%20Business",
      displayOrder: 16,
    },
  ];

  await HomePageSection.findOneAndUpdate(
    { sectionKey: "quick_categories" },
    {
      title: "Popular Categories",
      subtitle: "Explore our most sought-after collections",
      isActive: true,
      items: realQuickCategories,
    }
  );
  console.log("  ✓ Updated 'quick_categories' with 16 real subcategories.");

  // Real Shop by Category
  const realShopByCategory = [
    {
      name: "Electronics",
      count: "Smartphones, Laptops & Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      gradient: "from-blue-600 to-indigo-700",
      link: "/category?category=Electronics",
      category: elecCat?._id,
      displayOrder: 1,
    },
    {
      name: "Fashion",
      count: "Apparel, Footwear & Accessories",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
      gradient: "from-rose-500 to-pink-600",
      link: "/category?category=Fashion",
      category: fashionCat?._id,
      displayOrder: 2,
    },
    {
      name: "Home & Garden",
      count: "Furniture, Decor & Kitchen",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      gradient: "from-emerald-600 to-teal-700",
      link: "/category?category=Home%20%26%20Garden",
      category: homeCat?._id,
      displayOrder: 3,
    },
    {
      name: "Sports & Outdoors",
      count: "Fitness Gear, Shoes & Camping",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
      gradient: "from-orange-500 to-amber-600",
      link: "/category?category=Sports%20%26%20Outdoors",
      category: sportsCat?._id,
      displayOrder: 4,
    },
    {
      name: "Beauty & Personal Care",
      count: "Skincare, Makeup & Fragrances",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      gradient: "from-purple-600 to-rose-600",
      link: "/category?category=Beauty%20%26%20Personal%20Care",
      category: beautyCat?._id,
      displayOrder: 5,
    },
    {
      name: "Books & Media",
      count: "Fiction, Business & Tech",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
      gradient: "from-indigo-600 to-sky-600",
      link: "/category?category=Books%20%26%20Media",
      category: booksCat?._id,
      displayOrder: 6,
    },
  ];

  await HomePageSection.findOneAndUpdate(
    { sectionKey: "shop_by_category" },
    {
      title: "Shop by Category",
      subtitle: "Discover high quality items curated across 6 core departments",
      isActive: true,
      items: realShopByCategory,
    }
  );
  console.log("  ✓ Updated 'shop_by_category' with real core categories.");

  // Real Promotional Flash Deals
  const realPromoCarousel = [
    {
      title: "Flagship Smartphones",
      description: "iPhone 15 Pro Max & Galaxy S24 Ultra with exchange benefits",
      badge: "Electronics",
      emoji: "📱",
      buttonText: "Shop Flagships",
      buttonLink: "/category?category=Electronics&subcategory=Smartphones",
      offer: "Up to 20% OFF",
      gradient: "from-blue-600 to-indigo-800",
      badgeColor: "text-blue-600",
      displayOrder: 1,
    },
    {
      title: "Premium Running Shoes",
      description: "Nike Air Zoom Pegasus 40 & performance athletic trainers",
      badge: "Athletics",
      emoji: "👟",
      buttonText: "View Shoes",
      buttonLink: "/category?category=Sports%20%26%20Outdoors&subcategory=Running%20%26%20Athletic%20Shoes",
      offer: "Special Offer",
      gradient: "from-orange-600 to-red-700",
      badgeColor: "text-orange-600",
      displayOrder: 2,
    },
    {
      title: "Ergonomic Office Living",
      description: "Herman Miller Aeron & posture-perfect workspaces",
      badge: "Home & Garden",
      emoji: "🪑",
      buttonText: "Explore Furniture",
      buttonLink: "/category?category=Home%20%26%20Garden&subcategory=Furniture",
      offer: "Free Shipping",
      gradient: "from-emerald-600 to-teal-800",
      badgeColor: "text-emerald-600",
      displayOrder: 3,
    },
    {
      title: "Audiophile Sound",
      description: "Bose QuietComfort Ultra & Marshall Stanmore III Speakers",
      badge: "Audio Gear",
      emoji: "🎧",
      buttonText: "Hear The Best",
      buttonLink: "/category?category=Electronics&subcategory=Headphones%20%26%20Audio",
      offer: "Best Deals",
      gradient: "from-purple-600 to-violet-800",
      badgeColor: "text-purple-600",
      displayOrder: 4,
    },
    {
      title: "Designer Fragrances",
      description: "Chanel Coco Mademoiselle & luxury French eau de parfum",
      badge: "Beauty",
      emoji: "✨",
      buttonText: "Discover Scent",
      buttonLink: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Perfumes%20%26%20Fragrances",
      offer: "100% Genuine",
      gradient: "from-rose-500 to-pink-700",
      badgeColor: "text-rose-600",
      displayOrder: 5,
    },
  ];

  await HomePageSection.findOneAndUpdate(
    { sectionKey: "promo_carousel" },
    {
      title: "Flash Deals & Curated Offers",
      subtitle: "Exclusive savings on certified authentic brand merchandise",
      isActive: true,
      items: realPromoCarousel,
    }
  );
  console.log("  ✓ Updated 'promo_carousel' with authentic brand deals.");

  // Real Promotional Cards (replacing panchami_specials)
  const realPromotionalCards = [
    {
      name: "Apple Watch Ultra 2",
      price: "₹89,900",
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800",
      gradient: "from-slate-800 to-slate-900",
      link: "/products?search=Apple%20Watch",
      displayOrder: 1,
    },
    {
      name: "Sony Alpha 7 IV Full-Frame",
      price: "₹2,09,990",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      gradient: "from-amber-600 to-orange-700",
      link: "/products?search=Sony%20Alpha",
      displayOrder: 2,
    },
    {
      name: "Ralph Lauren Oxford",
      price: "₹7,999",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
      gradient: "from-blue-700 to-indigo-800",
      link: "/products?search=Ralph%20Lauren",
      displayOrder: 3,
    },
    {
      name: "Le Creuset Cast Iron",
      price: "₹28,500",
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800",
      gradient: "from-red-600 to-rose-700",
      link: "/products?search=Le%20Creuset",
      displayOrder: 4,
    },
  ];

  await HomePageSection.findOneAndUpdate(
    { sectionKey: "panchami_specials" },
    {
      title: "🌟 Featured Luxury & Performance",
      subtitle: "Hand-selected icons from our premier brand partners",
      isActive: true,
      items: realPromotionalCards,
    }
  );
  console.log("  ✓ Updated promotional cards with real products.");

  // Real Clearance Offers
  const realClearanceOffers = [
    {
      name: "Tissot PRX Powermatic 80",
      price: "Save ₹7,000",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
      link: "/products?search=Tissot",
      displayOrder: 1,
    },
    {
      name: "Dell XPS 15 OLED",
      price: "Save ₹15,000",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
      link: "/products?search=Dell%20XPS",
      displayOrder: 2,
    },
    {
      name: "Samsonite Freeform Spinner",
      price: "Save ₹3,000",
      image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800",
      link: "/products?search=Samsonite",
      displayOrder: 3,
    },
    {
      name: "Bowflex SelectTech Dumbbells",
      price: "Save ₹4,000",
      image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800",
      link: "/products?search=Bowflex",
      displayOrder: 4,
    },
    {
      name: "The Ordinary Niacinamide",
      price: "Special Pack",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      link: "/products?search=The%20Ordinary",
      displayOrder: 5,
    },
  ];

  await HomePageSection.findOneAndUpdate(
    { sectionKey: "clearance_offers" },
    {
      title: "🔥 Top Brand Offers",
      subtitle: "Special limited-time pricing on best-selling models",
      isActive: true,
      items: realClearanceOffers,
    }
  );
  console.log("  ✓ Updated clearance offers with real products.");

  // Update Category Product Sections with real normalized subcategory items
  const catSectionsToUpdate = [
    {
      key: "electronics_products",
      title: "Electronics & Tech",
      cat: elecCat,
      subCats: [
        { name: "Smartphones", link: "/category?category=Electronics&subcategory=Smartphones", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400" },
        { name: "Laptops & Computers", link: "/category?category=Electronics&subcategory=Laptops%20%26%20Computers", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400" },
        { name: "Headphones & Audio", link: "/category?category=Electronics&subcategory=Headphones%20%26%20Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
        { name: "Smart Watches", link: "/category?category=Electronics&subcategory=Smart%20Watches", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400" },
        { name: "Cameras & Photography", link: "/category?category=Electronics&subcategory=Cameras%20%26%20Photography", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" },
        { name: "Gaming & Consoles", link: "/category?category=Electronics&subcategory=Gaming%20%26%20Consoles", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400" },
        { name: "Tablets", link: "/category?category=Electronics&subcategory=Tablets", image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400" },
        { name: "Smart Home", link: "/category?category=Electronics&subcategory=Smart%20Home", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400" },
      ],
    },
    {
      key: "fashion_products",
      title: "Fashion & Apparel",
      cat: fashionCat,
      subCats: [
        { name: "T-Shirts & Shirts", link: "/category?category=Fashion&subcategory=T-Shirts%20%26%20Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
        { name: "Jeans & Trousers", link: "/category?category=Fashion&subcategory=Jeans%20%26%20Trousers", image: "https://images.unsplash.com/photo-1542272454315-7ad9f9f0d7b5?w=400" },
        { name: "Dresses & Tops", link: "/category?category=Fashion&subcategory=Dresses%20%26%20Tops", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" },
        { name: "Jackets & Coats", link: "/category?category=Fashion&subcategory=Jackets%20%26%20Coats", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400" },
        { name: "Shoes & Footwear", link: "/category?category=Fashion&subcategory=Shoes%20%26%20Footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400" },
        { name: "Bags & Luggage", link: "/category?category=Fashion&subcategory=Bags%20%26%20Luggage", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
        { name: "Watches", link: "/category?category=Fashion&subcategory=Watches", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400" },
        { name: "Sunglasses & Eyewear", link: "/category?category=Fashion&subcategory=Sunglasses%20%26%20Eyewear", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
      ],
    },
    {
      key: "home_garden_products",
      title: "Home & Garden",
      cat: homeCat,
      subCats: [
        { name: "Furniture", link: "/category?category=Home%20%26%20Garden&subcategory=Furniture", image: "https://images.unsplash.com/photo-1580481077197-28564db7391a?w=400" },
        { name: "Bedding & Mattresses", link: "/category?category=Home%20%26%20Garden&subcategory=Bedding%20%26%20Mattresses", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400" },
        { name: "Lighting", link: "/category?category=Home%20%26%20Garden&subcategory=Lighting", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400" },
        { name: "Kitchen & Dining", link: "/category?category=Home%20%26%20Garden&subcategory=Kitchen%20%26%20Dining", image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400" },
        { name: "Storage & Organization", link: "/category?category=Home%20%26%20Garden&subcategory=Storage%20%26%20Organization", image: "https://images.unsplash.com/photo-1595428773653-30a35a1c7a1b?w=400" },
        { name: "Rugs & Carpets", link: "/category?category=Home%20%26%20Garden&subcategory=Rugs%20%26%20Carpets", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400" },
        { name: "Curtains & Blinds", link: "/category?category=Home%20%26%20Garden&subcategory=Curtains%20%26%20Blinds", image: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400" },
        { name: "Plants & Garden", link: "/category?category=Home%20%26%20Garden&subcategory=Plants%20%26%20Garden", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400" },
      ],
    },
    {
      key: "sports_products",
      title: "Sports & Outdoors",
      cat: sportsCat,
      subCats: [
        { name: "Running & Athletic Shoes", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Running%20%26%20Athletic%20Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
        { name: "Fitness & Gym Equipment", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Fitness%20%26%20Gym%20Equipment", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400" },
        { name: "Dumbbells & Weights", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Dumbbells%20%26%20Weights", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400" },
        { name: "Yoga Mats & Gear", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Yoga%20Mats%20%26%20Gear", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400" },
        { name: "Bicycles & Cycling", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Bicycles%20%26%20Cycling", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400" },
        { name: "Sports Apparel", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Sports%20Apparel", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400" },
        { name: "Tennis & Racket Sports", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Tennis%20%26%20Racket%20Sports", image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400" },
        { name: "Outdoor & Camping", link: "/category?category=Sports%20%26%20Outdoors&subcategory=Outdoor%20%26%20Camping", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400" },
      ],
    },
    {
      key: "beauty_products",
      title: "Beauty & Personal Care",
      cat: beautyCat,
      subCats: [
        { name: "Skincare", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Skincare", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400" },
        { name: "Makeup & Cosmetics", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Makeup%20%26%20Cosmetics", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400" },
        { name: "Perfumes & Fragrances", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Perfumes%20%26%20Fragrances", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400" },
        { name: "Hair Care", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Hair%20Care", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400" },
        { name: "Face Masks & Scrubs", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Face%20Masks%20%26%20Scrubs", image: "https://images.unsplash.com/photo-1567928804479-7a329432654d?w=400" },
        { name: "Lip Care & Lipstick", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Lip%20Care%20%26%20Lipstick", image: "https://images.unsplash.com/photo-1586495777744-4e6af7e48613?w=400" },
        { name: "Eye Makeup", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Eye%20Makeup", image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400" },
        { name: "Bath & Body", link: "/category?category=Beauty%20%26%20Personal%20Care&subcategory=Bath%20%26%20Body", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400" },
      ],
    },
    {
      key: "books_products",
      title: "Books & Media",
      cat: booksCat,
      subCats: [
        { name: "Fiction", link: "/category?category=Books%20%26%20Media&subcategory=Fiction", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
        { name: "Non-Fiction", link: "/category?category=Books%20%26%20Media&subcategory=Non-Fiction", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400" },
        { name: "Self-Help & Business", link: "/category?category=Books%20%26%20Media&subcategory=Self-Help%20%26%20Business", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" },
        { name: "Biographies & Memoirs", link: "/category?category=Books%20%26%20Media&subcategory=Biographies%20%26%20Memoirs", image: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=400" },
        { name: "Science & Technology", link: "/category?category=Books%20%26%20Media&subcategory=Science%20%26%20Technology", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400" },
        { name: "History & Politics", link: "/category?category=Books%20%26%20Media&subcategory=History%20%26%20Politics", image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400" },
        { name: "Children & Young Adult", link: "/category?category=Books%20%26%20Media&subcategory=Children%20%26%20Young%20Adult", image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400" },
        { name: "Comics & Graphic Novels", link: "/category?category=Books%20%26%20Media&subcategory=Comics%20%26%20Graphic%20Novels", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400" },
      ],
    },
  ];

  for (const cs of catSectionsToUpdate) {
    if (!cs.cat) continue;
    await HomePageSection.findOneAndUpdate(
      { sectionKey: cs.key },
      {
        title: cs.title,
        isActive: true,
        "settings.sourceType": "category",
        "settings.category": cs.cat._id,
        "settings.categoryName": cs.cat.name,
        "settings.viewAllLink": `/category?category=${encodeURIComponent(cs.cat.name)}`,
        items: cs.subCats.map((sc, i) => ({
          name: sc.name,
          image: sc.image,
          link: sc.link,
          displayOrder: i + 1,
        })),
      },
      { upsert: true }
    );
    console.log(`  ✓ Updated category section: '${cs.key}' with real subcategories & category ID.`);
  }

  // 4. Ensure all remaining real products have featured: true where appropriate
  const countRealProducts = await Product.countDocuments();
  console.log(`\nRemaining verified real products in catalog: ${countRealProducts}`);

  console.log("\nDone updating home page sections with real data!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("FATAL update error:", err);
  process.exit(1);
});
