import asyncHandler from "express-async-handler";
import HomePageSection from "../models/HomePageSection.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Newsletter from "../models/Newsletter.js";

// Helper: Seed default home page sections matching current design and content 1:1
export const getInitialSectionsData = async () => {
  // Attempt to resolve real category IDs where possible
  const [elecCat, fashionCat, homeCat, sportsCat, beautyCat, booksCat] = await Promise.all([
    Category.findOne({ name: { $regex: /electronics/i } }),
    Category.findOne({ name: { $regex: /fashion/i } }),
    Category.findOne({ name: { $regex: /home/i } }),
    Category.findOne({ name: { $regex: /sports/i } }),
    Category.findOne({ name: { $regex: /beauty/i } }),
    Category.findOne({ name: { $regex: /books/i } }),
  ]);

  return [
    {
      sectionKey: "hero_banner",
      sectionType: "hero_banner",
      title: "Hero Banner",
      subtitle: "Main hero banner carousel",
      isActive: true,
      displayOrder: 1,
      settings: {},
      items: [],
    },
    {
      sectionKey: "service_features",
      sectionType: "service_features",
      title: "Why Choose Us",
      subtitle: "Features with Glass Cards",
      isActive: true,
      displayOrder: 2,
      settings: {},
      items: [
        {
          title: "Free Shipping",
          description: "On orders over $50",
          icon: "Truck",
          displayOrder: 1,
        },
        {
          title: "30-Day Returns",
          description: "Money back guarantee",
          icon: "RotateCcw",
          displayOrder: 2,
        },
        {
          title: "Secure Payment",
          description: "100% protected",
          icon: "Shield",
          displayOrder: 3,
        },
        {
          title: "24/7 Support",
          description: "Dedicated support",
          icon: "Headphones",
          displayOrder: 4,
        },
      ],
    },
    {
      sectionKey: "promo_carousel",
      sectionType: "promo_carousel",
      title: "Flash Deals & Offers",
      subtitle: "Exclusive discounts and limited-time promotions",
      isActive: true,
      displayOrder: 3,
      settings: {},
      items: [
        {
          title: "Latest Smartphones",
          description: "Upgrade to the newest models with exclusive discounts",
          badge: "Tech Deals",
          emoji: "📱",
          buttonText: "Shop Now",
          buttonLink: "/products?category=Electronics",
          offer: "20% OFF",
          gradient: "from-purple-600 to-purple-800",
          badgeColor: "text-purple-600",
          displayOrder: 1,
        },
        {
          title: "Spring Collection",
          description: "Fresh styles for the new season - Limited stock!",
          badge: "Fashion",
          emoji: "👗",
          buttonText: "Discover",
          buttonLink: "/products?category=Fashion",
          offer: "Buy 2 Get 1",
          gradient: "from-pink-500 to-rose-600",
          badgeColor: "text-pink-600",
          displayOrder: 2,
        },
        {
          title: "Home Essentials",
          description: "Upgrade your living space with quality items",
          badge: "Home",
          emoji: "🏡",
          buttonText: "Browse",
          buttonLink: "/products?category=Home",
          offer: "Free Ship",
          gradient: "from-emerald-600 to-teal-700",
          badgeColor: "text-emerald-600",
          displayOrder: 3,
        },
        {
          title: "Fitness Gear Sale",
          description: "Get fit with premium sports equipment at great prices",
          badge: "Sports",
          emoji: "⚽",
          buttonText: "Shop",
          buttonLink: "/products?category=Sports",
          offer: "30% OFF",
          gradient: "from-orange-600 to-red-600",
          badgeColor: "text-orange-600",
          displayOrder: 4,
        },
        {
          title: "Beauty Essentials",
          description: "Premium skincare and cosmetics for glowing skin",
          badge: "Beauty",
          emoji: "💄",
          buttonText: "Explore",
          buttonLink: "/products?category=Beauty",
          offer: "15% OFF",
          gradient: "from-rose-500 to-pink-600",
          badgeColor: "text-rose-600",
          displayOrder: 5,
        },
      ],
    },
    {
      sectionKey: "quick_categories",
      sectionType: "quick_categories",
      title: "Popular Categories",
      subtitle: "Explore our most sought-after collections",
      isActive: true,
      displayOrder: 4,
      settings: {},
      items: [
        { name: "EID", image: "https://images.unsplash.com/photo-1767775498862-d4740ce574ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWQlMjBmZXN0aXZhbCUyMGNsb3RoaW5nfGVufDF8fHx8MTc3MTUwMDM5OHww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=EID", displayOrder: 1 },
        { name: "Tshirts, Shirts", image: "https://images.unsplash.com/photo-1516442443906-71605254b628?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwdHNoaXJ0cyUyMHNoaXJ0c3xlbnwxfHx8fDE3NzE1MDAzOTh8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Tshirts%2C%20Shirts", displayOrder: 2 },
        { name: "Jeans", image: "https://images.unsplash.com/photo-1713880442898-0f151fba5e16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwamVhbnMlMjBkZW5pbXxlbnwxfHx8fDE3NzE0MzI2Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Jeans", displayOrder: 3 },
        { name: "Sports Shoes", image: "https://images.unsplash.com/photo-1695459468644-717c8ae17eed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzaG9lcyUyMHNuZWFrZXJzfGVufDF8fHx8MTc3MTQ3ODY4N3ww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Sports%20Shoes", displayOrder: 4 },
        { name: "Watches", image: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaGVzfGVufDF8fHx8MTc3MTUwMDM5OXww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Watches", displayOrder: 5 },
        { name: "Kids Clothing", image: "https://images.unsplash.com/photo-1733924304841-7320116fbe69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwY2xvdGhpbmclMjBjaGlsZHJlbnxlbnwxfHx8fDE3NzEzOTkxODd8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Kids%20Clothing", displayOrder: 6 },
        { name: "Backpacks", image: "https://images.unsplash.com/photo-1655303219938-3a771279c801?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMHNjaG9vbCUyMGJhZ3xlbnwxfHx8fDE3NzE0NTM4OTR8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Backpacks", displayOrder: 7 },
        { name: "Kurtas", image: "https://images.unsplash.com/photo-1727835523550-18478cacefa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBrdXJ0YSUyMGV0aG5pY3xlbnwxfHx8fDE3NzE1MDA0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Kurtas", displayOrder: 8 },
        { name: "Casual Wear", image: "https://images.unsplash.com/photo-1640989818014-b4363bd44443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjB3ZWFyJTIwbWVuc3xlbnwxfHx8fDE3NzE1MDA0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Casual%20Wear", displayOrder: 9 },
        { name: "Tracksuits", image: "https://images.unsplash.com/photo-1768929096095-8f379b34278b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjB0cmFja3N1aXQlMjBhY3RpdmV3ZWFyfGVufDF8fHx8MTc3MTUwMDQwMHww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Tracksuits", displayOrder: 10 },
        { name: "Trendy street", image: "https://images.unsplash.com/photo-1768610284447-2ec9e61bd63b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBmYXNoaW9uJTIwdHJlbmR5fGVufDF8fHx8MTc3MTUwMDQwMXww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Trendy%20street", displayOrder: 11 },
        { name: "Kurta Sets", image: "https://images.unsplash.com/photo-1766994063823-ed214f883548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrdXJ0YSUyMHNldCUyMGluZGlhbnxlbnwxfHx8fDE3NzE1MDA0MDF8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Kurta%20Sets", displayOrder: 12 },
        { name: "Dresses, tops", image: "https://images.unsplash.com/photo-1730952756912-9a3ac64c5491?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbnMlMjBkcmVzc2VzJTIwdG9wc3xlbnwxfHx8fDE3NzE1MDA0MDF8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Dresses%2C%20tops", displayOrder: 13 },
        { name: "Casual shoes", image: "https://images.unsplash.com/photo-1559744463-b288e9628d92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzaG9lcyUyMGZvb3R3ZWFyfGVufDF8fHx8MTc3MTUwMDQwMXww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Casual%20shoes", displayOrder: 14 },
        { name: "Trolley Bags", image: "https://images.unsplash.com/photo-1760648311436-d18d39f499bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9sbGV5JTIwbHVnZ2FnZSUyMGJhZ3xlbnwxfHx8fDE3NzE1MDA0MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Trolley%20Bags", displayOrder: 15 },
        { name: "Jewellery", image: "https://images.unsplash.com/photo-1718871186381-6d59524a64f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwYWNjZXNzb3JpZXMlMjBnb2xkfGVufDF8fHx8MTc3MTQ0ODY1OHww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Jewellery", displayOrder: 16 },
        { name: "Sarees", image: "https://images.unsplash.com/photo-1758120221788-d576fa58f520?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYXJlZSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MTQ4MDEwNnww&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Sarees", displayOrder: 17 },
        { name: "Jackets, Sweaters", image: "https://images.unsplash.com/photo-1740442535747-6c292f995539?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYWNrZXRzJTIwc3dlYXRlcnMlMjB3aW50ZXJ8ZW58MXx8fHwxNzcxNTAwNDAyfDA&ixlib=rb-4.1.0&q=80&w=1080", link: "/category?category=Fashion&subcategory=Jackets%2C%20Sweaters", displayOrder: 18 },
      ],
    },
    {
      sectionKey: "loved_ones",
      sectionType: "loved_ones",
      title: "Shop for Loved Ones",
      subtitle: "Curated collections for everyone in your life",
      isActive: true,
      displayOrder: 5,
      settings: {},
      items: [
        {
          title: "Men",
          subtitle: "Discover men's collection",
          image: "https://images.unsplash.com/photo-1635913906376-53130718255a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc3MTUwMDQwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&gender=men",
          gradient: "from-blue-400 to-blue-500",
          displayOrder: 1,
        },
        {
          title: "Women",
          subtitle: "Explore women's collection",
          image: "https://images.unsplash.com/photo-1655026950620-b39ab24e9b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbnMlMjBmYXNoaW9uJTIwbW9kZWx8ZW58MXx8fHwxNzcxNTAwNDAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&gender=women",
          gradient: "from-pink-400 to-pink-500",
          displayOrder: 2,
        },
        {
          title: "Gen Z Drips",
          subtitle: "Trending Gen Z styles",
          badge: "spoyl",
          image: "https://images.unsplash.com/photo-1610738572401-5dfeeb660c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW4lMjB6JTIweY91dGglMjBmYXNoaW9ufGVufDF8fHx8MTc3MTUwMDQwM3ww&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&collection=genz",
          gradient: "from-green-400 to-emerald-500",
          displayOrder: 3,
        },
      ],
    },
    {
      sectionKey: "panchami_specials",
      sectionType: "promotional_cards",
      title: "🌸 Basant Panchami Specials",
      subtitle: "Festival specials and traditional collections",
      isActive: true,
      displayOrder: 6,
      settings: {},
      items: [
        {
          name: "Kurtas",
          price: "From ₹299",
          image: "https://images.unsplash.com/photo-1759720887988-3bb77456cb26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBrdXJ0YSUyMHllbGxvdyUyMGdvbGQlMjBldGhuaWN8ZW58MXx8fHwxNzcxNTAwNTUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-yellow-200 to-yellow-300",
          link: "/category?category=Fashion&subcategory=Kurtas",
          displayOrder: 1,
        },
        {
          name: "Dress, co-ords",
          price: "Min. 70% Off",
          image: "https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZWxsb3clMjBkcmVzcyUyMGluZGlhbiUyMGV0aG5pY3xlbnwxfHx8fDE3NzE1MDA1NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-yellow-200 to-orange-200",
          link: "/category?category=Fashion&subcategory=Dress%2C%20co-ords",
          displayOrder: 2,
        },
        {
          name: "Floral Kurtas",
          price: "From ₹299",
          image: "https://images.unsplash.com/photo-1764583473839-63a1afa95667?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBrdXJ0YSUyMHRyYWRpdGlvbmFsfGVufDF8fHx8MTc3MTUwMDU1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-yellow-300 to-amber-300",
          link: "/category?category=Fashion&subcategory=Floral%20Kurtas",
          displayOrder: 3,
        },
        {
          name: "Ethnic sets",
          price: "Min. 70% Off",
          image: "https://images.unsplash.com/photo-1576830951169-82f94b1db5a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZXRobmljJTIwd2VhciUyMHllbGxvd3xlbnwxfHx8fDE3NzE1MDA1NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-yellow-200 to-yellow-400",
          link: "/category?category=Fashion&subcategory=Ethnic%20sets",
          displayOrder: 4,
        },
        {
          name: "Jhumkas",
          price: "From ₹99",
          image: "https://images.unsplash.com/photo-1714733831162-0a6e849141be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwamh1bWthJTIwZWFycmluZ3N8ZW58MXx8fHwxNzcxNTAwNTU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-amber-200 to-yellow-300",
          link: "/category?category=Fashion&subcategory=Jhumkas",
          displayOrder: 5,
        },
      ],
    },
    {
      sectionKey: "clearance_offers",
      sectionType: "clearance_offers",
      title: "🔥 Clearance offers",
      subtitle: "Unbeatable discounts on top categories",
      isActive: true,
      displayOrder: 7,
      settings: {},
      items: [
        {
          name: "Kurta sets",
          price: "Min. 60% Off",
          image: "https://images.unsplash.com/photo-1734588866324-d7ed73b1f08b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0ZWwlMjBrdXJ0YSUyMHNldCUyMHdvbWVufGVufDF8fHx8MTc3MTUwMDU1NHww&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&subcategory=Kurta%20sets",
          displayOrder: 1,
        },
        {
          name: "Killer, Spykar...",
          price: "Min. 70% Off",
          image: "https://images.unsplash.com/photo-1763609973511-77f5caecd0f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW5zJTIwamVhbnMlMjBkZW5pbSUyMGNhc3VhbHxlbnwxfHx8fDE3NzE1MDA1NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&subcategory=Killer%2C%20Spykar...",
          displayOrder: 2,
        },
        {
          name: "Allen Solly, USPA...",
          price: "Min. 60% Off",
          image: "https://images.unsplash.com/photo-1557503800-1bdcd9acdc67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwY2xvdGhpbmclMjBjb2xvcmZ1bCUyMGNoaWxkcmVufGVufDF8fHx8MTc3MTUwMDU1NXww&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&subcategory=Allen%20Solly%2C%20USPA...",
          displayOrder: 3,
        },
        {
          name: "Abros & Action",
          price: "Min. 65% Off",
          image: "https://images.unsplash.com/photo-1735313476767-86ed2718f97f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzbmVha2VycyUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MTUwMDU1NXww&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&subcategory=Abros%20%26%20Action",
          displayOrder: 4,
        },
        {
          name: "Campus",
          price: "Min. 50% Off",
          image: "https://images.unsplash.com/photo-1758646483134-1a5cbc9aa349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMGNhbnZhcyUyMHNob2VzJTIwY2FzdWFsfGVufDF8fHx8MTc3MTUwMDU1NXww&ixlib=rb-4.1.0&q=80&w=1080",
          link: "/category?category=Fashion&subcategory=Campus",
          displayOrder: 5,
        },
      ],
    },
    {
      sectionKey: "shop_by_category",
      sectionType: "shop_by_category",
      title: "Shop by Category",
      subtitle: "Find exactly what you're looking for",
      isActive: true,
      displayOrder: 8,
      settings: {
        viewAllLink: "/category",
      },
      items: [
        {
          name: "Electronics",
          count: "Explore Tech",
          image: "https://images.unsplash.com/photo-1757168120889-4317e57a4849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBoZWFkcGhvbmVzJTIwcHJvZHVjdCUyMGJsYWNrfGVufDF8fHx8MTc3MTMxNzE4OXww&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-blue-500 to-blue-600",
          link: "/category?category=Electronics",
          category: elecCat?._id || null,
          displayOrder: 1,
        },
        {
          name: "Fashion",
          count: "Explore Apparel",
          image: "https://images.unsplash.com/photo-1524282745852-a463fa495a7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxfYXNoaW9uJTIwY2xvdGhpbmclMjBzdG9yZSUyMG1pbmltYWx8ZW58MXx8fHwxNzcxMzE3MTg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-pink-500 to-pink-600",
          link: "/category?category=Fashion",
          category: fashionCat?._id || null,
          displayOrder: 2,
        },
        {
          name: "Home & Garden",
          count: "Explore Decor",
          image: "https://images.unsplash.com/photo-1567016546367-c27a0d56712e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwZGVjb3IlMjBtb2Rlcm4lMjBmdXJuaXR1cmV8ZW58MXx8fHwxNzcxMzE3MTg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-green-500 to-green-600",
          link: "/category?category=Home%20%26%20Garden",
          category: homeCat?._id || null,
          displayOrder: 3,
        },
        {
          name: "Sports",
          count: "Explore Gear",
          image: "https://images.unsplash.com/photo-1767714453328-ca5f4b0ffcd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBlcXVpcG1lbnQlMjBmaXRuZXNzJTIwZ2VhcnxlbnwxfHx8fDE3NzEzMTcxOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-orange-500 to-orange-600",
          link: "/category?category=Sports",
          category: sportsCat?._id || null,
          displayOrder: 4,
        },
        {
          name: "Beauty",
          count: "Explore Cosmetics",
          image: "https://images.unsplash.com/photo-1665625771491-a9c97a52c927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBjb3NtZXRpY3MlMjBtYWtldXAlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NzEzMTcxOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-purple-500 to-purple-600",
          link: "/category?category=Beauty",
          category: beautyCat?._id || null,
          displayOrder: 5,
        },
        {
          name: "Books",
          count: "Explore Reading",
          image: "https://images.unsplash.com/photo-1524282745852-a463fa495a7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxfYXNoaW9uJTIwY2xvdGhpbmclMjBzdG9yZSUyMG1pbmltYWx8ZW58MXx8fHwxNzcxMzE3MTg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
          gradient: "from-amber-500 to-amber-600",
          link: "/category?category=Books",
          category: booksCat?._id || null,
          displayOrder: 6,
        },
      ],
    },
    {
      sectionKey: "special_offers",
      sectionType: "special_offers",
      title: "Special Offers & Promotions",
      subtitle: "Don't miss out on our exclusive deals and limited-time offers. Save big on your favorite products today!",
      badge: "🔥 Limited Time Offers",
      isActive: true,
      displayOrder: 9,
      settings: {},
      items: [
        {
          title: "Summer Sale Extravaganza",
          description: "Get up to 70% off on premium fashion items and trending apparel.",
          discount: "70% OFF",
          image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=600&fit=crop",
          buttonText: "Shop Now",
          buttonLink: "/products?category=Fashion&sale=true",
          type: "hero",
          backgroundColor: "bg-gradient-to-r from-[var(--primary-color)] to-orange-600",
          displayOrder: 1,
        },
        {
          title: "Tech Gadgets Bonanza",
          description: "Latest electronics and cutting-edge accessories at unbeatable prices.",
          discount: "50% OFF",
          image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=600&fit=crop",
          buttonText: "Explore Deals",
          buttonLink: "/products?category=Electronics&sale=true",
          type: "banner",
          backgroundColor: "bg-gradient-to-r from-purple-600 to-pink-600",
          displayOrder: 2,
        },
      ],
    },
    {
      sectionKey: "electronics_products",
      sectionType: "category_products",
      title: "Electronics Products",
      subtitle: "Smartphones, Audio Gear, Laptops & Smart Tech",
      isActive: true,
      displayOrder: 10,
      settings: {
        sourceType: "category",
        category: elecCat?._id || null,
        categoryName: "Electronics",
        productLimit: 16,
        sort: "-createdAt",
        viewAllLink: "/category?category=Electronics",
      },
      items: [
        { name: "Smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", link: "/category?category=Electronics&subcategory=Smartphones" },
        { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", link: "/category?category=Electronics&subcategory=Laptops" },
        { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", link: "/category?category=Electronics&subcategory=Headphones" },
        { name: "Cameras", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", link: "/category?category=Electronics&subcategory=Cameras" },
        { name: "Smartwatches", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400", link: "/category?category=Electronics&subcategory=Smartwatches" },
        { name: "Tablets", image: "https://images.unsplash.com/photo-1585790050230-5dd28404f8f3?w=400", link: "/category?category=Electronics&subcategory=Tablets" },
        { name: "TVs", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400", link: "/category?category=Electronics&subcategory=TVs" },
        { name: "Speakers", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", link: "/category?category=Electronics&subcategory=Speakers" },
      ],
    },
    {
      sectionKey: "fashion_products",
      sectionType: "category_products",
      title: "Fashion Products",
      subtitle: "Trending Apparel, Footwear & Accessories",
      isActive: true,
      displayOrder: 11,
      settings: {
        sourceType: "category",
        category: fashionCat?._id || null,
        categoryName: "Fashion",
        productLimit: 16,
        sort: "-createdAt",
        viewAllLink: "/category?category=Fashion",
      },
      items: [
        { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", link: "/category?category=Fashion&subcategory=T-Shirts" },
        { name: "Jeans", image: "https://images.unsplash.com/photo-1542272454315-7ad9f9f0d7b5?w=400", link: "/category?category=Fashion&subcategory=Jeans" },
        { name: "Dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", link: "/category?category=Fashion&subcategory=Dresses" },
        { name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", link: "/category?category=Fashion&subcategory=Jackets" },
        { name: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", link: "/category?category=Fashion&subcategory=Shoes" },
        { name: "Bags", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", link: "/category?category=Fashion&subcategory=Bags" },
        { name: "Watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", link: "/category?category=Fashion&subcategory=Watches" },
        { name: "Sunglasses", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", link: "/category?category=Fashion&subcategory=Sunglasses" },
      ],
    },
    {
      sectionKey: "home_garden_products",
      sectionType: "category_products",
      title: "Home & Garden",
      subtitle: "Furniture, Decor & Kitchen Essentials",
      isActive: true,
      displayOrder: 12,
      settings: {
        sourceType: "category",
        category: homeCat?._id || null,
        categoryName: "Home & Garden",
        productLimit: 16,
        sort: "-createdAt",
        viewAllLink: "/category?category=Home+%26+Garden",
      },
      items: [
        { name: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", link: "/category?category=Home+%26+Garden&subcategory=Furniture" },
        { name: "Bedding", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", link: "/category?category=Home+%26+Garden&subcategory=Bedding" },
        { name: "Lighting", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400", link: "/category?category=Home+%26+Garden&subcategory=Lighting" },
        { name: "Decor", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400", link: "/category?category=Home+%26+Garden&subcategory=Decor" },
        { name: "Kitchen", image: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=400", link: "/category?category=Home+%26+Garden&subcategory=Kitchen" },
        { name: "Storage", image: "https://images.unsplash.com/photo-1595428773653-30a35a1c7a1b?w=400", link: "/category?category=Home+%26+Garden&subcategory=Storage" },
        { name: "Rugs", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", link: "/category?category=Home+%26+Garden&subcategory=Rugs" },
        { name: "Curtains", image: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400", link: "/category?category=Home+%26+Garden&subcategory=Curtains" },
      ],
    },
    {
      sectionKey: "sports_products",
      sectionType: "category_products",
      title: "Sports Products",
      subtitle: "Fitness Trackers, Sports Gear & Outdoor Equipment",
      isActive: true,
      displayOrder: 13,
      settings: {
        sourceType: "category",
        category: sportsCat?._id || null,
        categoryName: "Sports",
        productLimit: 16,
        sort: "-createdAt",
        viewAllLink: "/category?category=Sports",
      },
      items: [
        { name: "Running Shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", link: "/category?category=Sports&subcategory=Running%20Shoes" },
        { name: "Yoga Mats", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400", link: "/category?category=Sports&subcategory=Yoga%20Mats" },
        { name: "Dumbbells", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400", link: "/category?category=Sports&subcategory=Dumbbells" },
        { name: "Sports Wear", image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400", link: "/category?category=Sports&subcategory=Sports%20Wear" },
        { name: "Bicycles", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", link: "/category?category=Sports&subcategory=Bicycles" },
        { name: "Basketballs", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400", link: "/category?category=Sports&subcategory=Basketballs" },
      ],
    },
    {
      sectionKey: "beauty_products",
      sectionType: "category_products",
      title: "Beauty Products",
      subtitle: "Skincare, Makeup & Fragrances",
      isActive: true,
      displayOrder: 14,
      settings: {
        sourceType: "category",
        category: beautyCat?._id || null,
        categoryName: "Beauty",
        productLimit: 16,
        sort: "-createdAt",
        viewAllLink: "/category?category=Beauty",
      },
      items: [
        { name: "Skincare", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", link: "/category?category=Beauty&subcategory=Skincare" },
        { name: "Makeup", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400", link: "/category?category=Beauty&subcategory=Makeup" },
        { name: "Perfumes", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", link: "/category?category=Beauty&subcategory=Perfumes" },
        { name: "Hair Care", image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400", link: "/category?category=Beauty&subcategory=Hair%20Care" },
      ],
    },
    {
      sectionKey: "books_products",
      sectionType: "category_products",
      title: "Books",
      subtitle: "Bestselling Fiction, Non-Fiction & Tech",
      isActive: true,
      displayOrder: 15,
      settings: {
        sourceType: "category",
        category: booksCat?._id || null,
        categoryName: "Books",
        productLimit: 16,
        sort: "-createdAt",
        viewAllLink: "/category?category=Books",
      },
      items: [
        { name: "Fiction", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", link: "/category?category=Books&subcategory=Fiction" },
        { name: "Non-Fiction", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400", link: "/category?category=Books&subcategory=Non-Fiction" },
        { name: "Self-Help", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", link: "/category?category=Books&subcategory=Self-Help" },
        { name: "Biographies", image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400", link: "/category?category=Books&subcategory=Biographies" },
      ],
    },
    {
      sectionKey: "featured_products",
      sectionType: "featured_products",
      title: "⭐ Featured Products",
      subtitle: "Hand-picked items just for you",
      isActive: true,
      displayOrder: 16,
      settings: {
        productLimit: 12,
        viewAllLink: "/category",
      },
      items: [],
    },
    {
      sectionKey: "rewards",
      sectionType: "rewards",
      title: "Join Our Rewards Program",
      description: "Earn points with every purchase and get exclusive discounts. Refer friends and get even more rewards!",
      isActive: true,
      displayOrder: 17,
      settings: {
        buttonText: "Learn More",
        buttonLink: "/rewards",
      },
      items: [],
    },
    {
      sectionKey: "newsletter",
      sectionType: "newsletter",
      title: "📧 Subscribe to Our Newsletter",
      description: "Get the latest deals and exclusive offers delivered to your inbox",
      isActive: true,
      displayOrder: 18,
      settings: {
        placeholder: "Enter your email",
        buttonText: "Subscribe",
      },
      items: [],
    },
  ];
};

// ── GET PUBLIC HOME PAGE ──
export const getPublicHomePage = asyncHandler(async (req, res) => {
  let sections = await HomePageSection.find({ isActive: true })
    .sort({ displayOrder: 1 })
    .populate("settings.category", "name slug image")
    .populate("items.category", "name slug image")
    .populate("items.product", "title name price offerPrice images variants category")
    .lean();

  // If no sections in DB, seed defaults automatically so home page never renders blank
  if (!sections || sections.length === 0) {
    const defaultData = await getInitialSectionsData();
    await HomePageSection.insertMany(defaultData);
    sections = await HomePageSection.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .populate("settings.category", "name slug image")
      .populate("items.category", "name slug image")
      .populate("items.product", "title name price offerPrice images variants category")
      .lean();
  }

  // Populate dynamic product data for category/product sections without N+1 overhead
  const enrichedSections = await Promise.all(
    sections.map(async (sec) => {
      if (sec.sectionType === "category_products" || sec.sectionType === "product_grid") {
        const { sourceType, category, productLimit = 8, sort = "-createdAt" } = sec.settings || {};
        let query = { isActive: true };

        if (sourceType === "category" && category) {
          query.category = category._id || category;
        } else if (sourceType === "featured") {
          query.featured = true;
        } else if (sourceType === "offers") {
          query.offerPrice = { $gt: 0 };
        } else if (sourceType === "manual" && sec.settings?.products?.length) {
          query._id = { $in: sec.settings.products };
        }

        try {
          const products = await Product.find(query)
            .populate("category", "name")
            .sort(sort)
            .limit(Number(productLimit))
            .lean();

          return {
            ...sec,
            dynamicProducts: products.map((p) => {
              const firstVariant = p.variants?.[0] || {};
              return {
                id: p._id,
                name: p.title || p.name,
                category: p.category?.name || sec.title || "",
                price: firstVariant.sellingPrice || p.offerPrice || 0,
                originalPrice: p.offerPrice != null ? firstVariant.sellingPrice : undefined,
                image: firstVariant.image || p.images?.[0] || "",
                badge: p.offerPrice != null ? "Sale" : undefined,
                rating: 4.8,
                reviews: p.reviews?.length || 0,
                inStock: (firstVariant.currentStock ?? 1) > 0,
              };
            }),
          };
        } catch (err) {
          console.error(`Error resolving products for section ${sec.sectionKey}:`, err);
          return { ...sec, dynamicProducts: [] };
        }
      }
      return sec;
    })
  );

  res.json({
    success: true,
    sections: enrichedSections,
  });
});

// ── GET ADMIN SECTIONS (ALL) ──
export const getAdminSections = asyncHandler(async (req, res) => {
  let sections = await HomePageSection.find()
    .sort({ displayOrder: 1 })
    .populate("settings.category", "name slug")
    .populate("settings.products", "title images variants");

  if (!sections || sections.length === 0) {
    const defaultData = await getInitialSectionsData();
    await HomePageSection.insertMany(defaultData);
    sections = await HomePageSection.find()
      .sort({ displayOrder: 1 })
      .populate("settings.category", "name slug")
      .populate("settings.products", "title images variants");
  }

  res.json(sections);
});

// ── GET SINGLE SECTION BY ID ──
export const getSectionById = asyncHandler(async (req, res) => {
  const section = await HomePageSection.findById(req.params.id)
    .populate("settings.category", "name slug")
    .populate("settings.products", "title images variants");

  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }

  res.json(section);
});

// ── CREATE SECTION ──
export const createSection = asyncHandler(async (req, res) => {
  const {
    sectionKey,
    sectionType,
    title,
    subtitle,
    description,
    badge,
    isActive = true,
    displayOrder,
    settings = {},
    items = [],
  } = req.body;

  if (!sectionKey || !sectionType) {
    res.status(400);
    throw new Error("sectionKey and sectionType are required");
  }

  const existing = await HomePageSection.findOne({ sectionKey });
  if (existing) {
    res.status(400);
    throw new Error(`Section with key '${sectionKey}' already exists`);
  }

  let finalOrder = displayOrder;
  if (finalOrder == null) {
    const maxOrderSec = await HomePageSection.findOne().sort({ displayOrder: -1 });
    finalOrder = maxOrderSec ? (maxOrderSec.displayOrder || 0) + 1 : 1;
  }

  const section = await HomePageSection.create({
    sectionKey,
    sectionType,
    title: title || "",
    subtitle: subtitle || "",
    description: description || "",
    badge: badge || "",
    isActive: isActive !== false,
    displayOrder: finalOrder,
    settings,
    items,
  });

  res.status(201).json(section);
});

// ── UPDATE SECTION ──
export const updateSection = asyncHandler(async (req, res) => {
  const section = await HomePageSection.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }

  const {
    title,
    subtitle,
    description,
    badge,
    isActive,
    displayOrder,
    settings,
    items,
    sectionType,
  } = req.body;

  if (title !== undefined) section.title = title;
  if (subtitle !== undefined) section.subtitle = subtitle;
  if (description !== undefined) section.description = description;
  if (badge !== undefined) section.badge = badge;
  if (isActive !== undefined) section.isActive = isActive;
  if (displayOrder !== undefined) section.displayOrder = displayOrder;
  if (sectionType !== undefined) section.sectionType = sectionType;
  if (settings !== undefined) section.settings = { ...section.settings, ...settings };
  if (items !== undefined) section.items = items;

  const updated = await section.save();
  res.json(updated);
});

// ── DELETE SECTION ──
export const deleteSection = asyncHandler(async (req, res) => {
  const section = await HomePageSection.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }

  await section.deleteOne();
  res.json({ message: "Section deleted successfully" });
});

// ── TOGGLE SECTION STATUS ──
export const toggleSectionStatus = asyncHandler(async (req, res) => {
  const section = await HomePageSection.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }

  section.isActive = req.body.isActive !== undefined ? req.body.isActive : !section.isActive;
  await section.save();
  res.json({ message: "Status updated", section });
});

// ── REORDER SECTIONS ──
export const reorderSections = asyncHandler(async (req, res) => {
  const { orders } = req.body; // Array of { id: string, displayOrder: number }

  if (!Array.isArray(orders)) {
    res.status(400);
    throw new Error("Orders must be an array of { id, displayOrder }");
  }

  const bulkOps = orders.map(({ id, displayOrder }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { displayOrder: Number(displayOrder) } },
    },
  }));

  if (bulkOps.length > 0) {
    await HomePageSection.bulkWrite(bulkOps);
  }

  const updatedSections = await HomePageSection.find().sort({ displayOrder: 1 });
  res.json({ message: "Sections reordered successfully", sections: updatedSections });
});

// ── SEED / RESET DEFAULT SECTIONS ──
export const seedDefaultSections = asyncHandler(async (req, res) => {
  const defaultData = await getInitialSectionsData();
  await HomePageSection.deleteMany({});
  const seeded = await HomePageSection.insertMany(defaultData);
  res.json({
    message: "Default home page sections successfully seeded",
    count: seeded.length,
    sections: seeded,
  });
});

// ── NEWSLETTER SUBSCRIPTION ──
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await Newsletter.findOne({ email: normalizedEmail });

  if (existing) {
    return res.json({
      success: true,
      message: "You are already subscribed to our newsletter!",
    });
  }

  await Newsletter.create({ email: normalizedEmail });

  res.status(201).json({
    success: true,
    message: "Thank you for subscribing! You'll receive our latest updates and offers.",
  });
});
