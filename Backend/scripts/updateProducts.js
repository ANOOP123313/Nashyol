import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const mongoUri = process.env.MONGODB_URI.includes("/nashyol")
  ? process.env.MONGODB_URI
  : process.env.MONGODB_URI.replace(/\/+$/, "") + "/nashyol?retryWrites=true&w=majority";

async function updateDb() {
  await mongoose.connect(mongoUri, { dbName: "nashyol" });

  const cats = await Category.find({});
  const catMap = {};
  cats.forEach(c => {
    catMap[c.slug] = c._id;
    catMap[c.name.toLowerCase()] = c._id;
  });

  const electronicsId = catMap["electronics"];
  const fashionId = catMap["fashion"];
  const beautyId = catMap["beauty"] || catMap["beauty & personal care"];
  const homeGardenId = catMap["home-garden"] || catMap["home & garden"];
  const sportsId = catMap["sports-outdoors"] || catMap["sports & outdoors"];
  let booksId = catMap["books"];

  if (!booksId) {
    const newBookCat = await Category.create({
      name: "Books",
      slug: "books",
      description: "Books and literature",
      isActive: true,
    });
    booksId = newBookCat._id;
  }

  // 1. Activate and fix existing products
  await Product.updateMany(
    { title: "Heritage Genuine Leather Biker Jacket" },
    { $set: { isActive: true, category: fashionId } }
  );

  await Product.updateMany(
    { title: "The Tech Visionary Hardcover Edition" },
    { $set: { isActive: true, category: booksId } }
  );

  await Product.updateMany(
    { title: "Lakme Face Cream" },
    { $set: { isActive: true, category: beautyId } }
  );

  await Product.updateMany(
    { title: "Mamaearth Ubtan Face Wash" },
    { $set: { isActive: true, category: beautyId } }
  );

  await Product.updateMany(
    { title: "shirt" },
    { $set: { isActive: true, category: fashionId } }
  );

  // 2. Add rich products for each category
  const adminUser = (await Product.findOne({}))?.createdBy || new mongoose.Types.ObjectId();

  const sampleProducts = [
    // Fashion
    {
      title: "Men Classic Slim-Fit Oxford Shirt",
      brand: "Zara Man",
      category: fashionId,
      description: "Premium 100% breathable cotton slim-fit shirt perfect for casual or formal occasions.",
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"],
      variants: [{
        sku: "FASH-SHT-001",
        sellingPrice: 79,
        currentStock: 45,
        isActive: true,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },
    {
      title: "Italian Designer Leather Crossbody Bag",
      brand: "Milano Luxe",
      category: fashionId,
      description: "Handcrafted genuine leather handbag featuring gold-tone hardware and adjustable strap.",
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"],
      variants: [{
        sku: "FASH-BAG-002",
        sellingPrice: 189,
        currentStock: 25,
        isActive: true,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },
    {
      title: "Women Summer Floral Chiffon Dress",
      brand: "Zara Trend",
      category: fashionId,
      description: "Elegant flowy maxi dress in vibrant seasonal floral prints.",
      images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"],
      variants: [{
        sku: "FASH-DRS-003",
        sellingPrice: 99,
        currentStock: 30,
        isActive: true,
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },

    // Beauty
    {
      title: "Pure Organic Rosewater Facial Mist Toner 150ml",
      brand: "Botanica",
      category: beautyId,
      description: "100% steam-distilled organic Bulgarian rosewater to refresh and hydrate skin.",
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"],
      variants: [{
        sku: "BEAUTY-ROSE-001",
        sellingPrice: 35,
        currentStock: 60,
        isActive: true,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },
    {
      title: "Luxury Matte Velvet Long-Wear Lipstick",
      brand: "Velour Noir",
      category: beautyId,
      description: "Ultra-pigmented lightweight matte formula enriched with Vitamin E.",
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800"],
      variants: [{
        sku: "BEAUTY-LIP-002",
        sellingPrice: 42,
        currentStock: 80,
        isActive: true,
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },

    // Home & Garden
    {
      title: "Ceramic Artisan Plant Pot Set of 3",
      brand: "Terra Living",
      category: homeGardenId,
      description: "Modern handcrafted glazed ceramic planters with drainage holes and bamboo saucers.",
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"],
      variants: [{
        sku: "HOME-POT-001",
        sellingPrice: 59,
        currentStock: 40,
        isActive: true,
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },
    {
      title: "Minimalist Nordic Warm Arc Floor Lamp",
      brand: "Nordic Light",
      category: homeGardenId,
      description: "Sleek brushed brass floor lamp with adjustable fabric shade and warm LED.",
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"],
      variants: [{
        sku: "HOME-LAMP-002",
        sellingPrice: 189,
        currentStock: 20,
        isActive: true,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },

    // Sports & Outdoors
    {
      title: "Adjustable Quick-Select Dumbbell Pair 24kg",
      brand: "PowerFit Pro",
      category: sportsId,
      description: "Compact adjustable dumbbell set ranging from 2.5kg to 24kg per dumbbell.",
      images: ["https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800"],
      variants: [{
        sku: "SPORT-DB-001",
        sellingPrice: 289,
        currentStock: 15,
        isActive: true,
        image: "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },
    {
      title: "All-Terrain Hiking and Camping Backpack 45L",
      brand: "Peak Trail",
      category: sportsId,
      description: "Waterproof ripstop nylon backpack with ergonomic lumbar support and rain cover.",
      images: ["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"],
      variants: [{
        sku: "SPORT-BP-002",
        sellingPrice: 139,
        currentStock: 35,
        isActive: true,
        image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },

    // Books
    {
      title: "Mastering Modern Web Architecture and Microservices",
      brand: "TechPress Publishing",
      category: booksId,
      description: "Comprehensive guide to building scalable, resilient modern cloud-native systems.",
      images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"],
      variants: [{
        sku: "BOOK-WEB-001",
        sellingPrice: 49.99,
        currentStock: 50,
        isActive: true,
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    },
    {
      title: "The Mindful Leader: Strategies for High-Performance Teams",
      brand: "Crown Business",
      category: booksId,
      description: "Bestselling leadership guide combining psychological research with executive insights.",
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800"],
      variants: [{
        sku: "BOOK-LDR-002",
        sellingPrice: 28.50,
        currentStock: 40,
        isActive: true,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800"
      }],
      isActive: true,
      featured: true,
      createdBy: adminUser
    }
  ];

  for (const prod of sampleProducts) {
    const exists = await Product.findOne({ title: prod.title });
    if (!exists) {
      await Product.create(prod);
      console.log("Created product:", prod.title);
    } else {
      await Product.updateOne({ _id: exists._id }, { $set: { isActive: true, category: prod.category } });
      console.log("Updated product:", prod.title);
    }
  }

  console.log("Database product update complete!");
  process.exit(0);
}

updateDb();
