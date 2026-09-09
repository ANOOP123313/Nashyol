import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Attribute from "./models/Attribute.js";
import Product from "./models/Product.js";
import Vendor from "./models/Vendor.js";
import VendorStock from "./models/VendorStock.js";
import Banner from "./models/Banner.js";
import Coupon from "./models/Coupon.js";
import Review from "./models/Review.js";
import SupportTicket from "./models/SupportTickets.js";
import Order from "./models/Order.js";

dotenv.config();

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "nashyol" });
    console.log("✅ Connected to MongoDB database: nashyol");

    // Clear existing data
    console.log("Clearing existing database collections...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Attribute.deleteMany({}),
      Product.deleteMany({}),
      Vendor.deleteMany({}),
      VendorStock.deleteMany({}),
      Banner.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
      SupportTicket.deleteMany({}),
      Order.deleteMany({}),
    ]);

    console.log("Creating Users...");
    const adminUser = await User.create({
      name: "Naashyol Admin",
      email: "admin@naashyol.com",
      password: "admin123password",
      role: "admin",
      isVerified: true,
      referralCode: "ADMINREF",
    });

    const customerUser = await User.create({
      name: "Sophia Carter",
      email: "user@naashyol.com",
      password: "user123password",
      role: "user",
      isVerified: true,
      referralCode: "SOPHIA2026",
      walletBalance: 150,
      referralCount: 3,
    });

    const customerUser2 = await User.create({
      name: "Liam Johnson",
      email: "liam@naashyol.com",
      password: "user123password",
      role: "user",
      isVerified: true,
      referralCode: "LIAM2026",
      walletBalance: 50,
      referralCount: 1,
    });

    const vendorUser1 = await User.create({
      name: "TechSource Manager",
      email: "techsource@supplier.com",
      password: "vendor123password",
      role: "vendor",
      isVerified: true,
    });

    const vendorUser2 = await User.create({
      name: "Apex Style Supply",
      email: "apex@supplier.com",
      password: "vendor123password",
      role: "vendor",
      isVerified: true,
    });

    console.log("Creating Vendors...");
    const vendor1 = await Vendor.create({
      owner: vendorUser1._id,
      storeName: "TechSource Logistics",
      email: "techsource@supplier.com",
      phone: "+1 800 555 0199",
      address: "100 Silicon Way, San Jose, CA",
      approvalStatus: "approved",
    });

    const vendor2 = await Vendor.create({
      owner: vendorUser2._id,
      storeName: "Apex Apparel Wholesale",
      email: "apex@supplier.com",
      phone: "+1 800 555 0288",
      address: "450 Fashion Ave, New York, NY",
      approvalStatus: "approved",
    });

    console.log("Creating Categories...");
    const electronicsCat = await Category.create({
      name: "Electronics",
      slug: "electronics",
      description: "Smartphones, Laptops, Audio Gear & Smart Accessories",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
      subCategories: [
        { name: "Smartphones", slug: "smartphones" },
        { name: "Laptops & Computers", slug: "laptops" },
        { name: "Headphones & Audio", slug: "audio" },
        { name: "Smartwatches", slug: "smartwatches" },
      ],
    });

    const fashionCat = await Category.create({
      name: "Fashion",
      slug: "fashion",
      description: "Trending Men & Women Apparel, Shoes, and Accessories",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600",
      subCategories: [
        { name: "Menswear", slug: "menswear" },
        { name: "Womenswear", slug: "womenswear" },
        { name: "Footwear", slug: "footwear" },
        { name: "Accessories", slug: "accessories" },
      ],
    });

    const beautyCat = await Category.create({
      name: "Beauty & Personal Care",
      slug: "beauty",
      description: "Skincare, Cosmetics, Perfumes, & Wellness",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600",
      subCategories: [
        { name: "Skincare", slug: "skincare" },
        { name: "Makeup", slug: "makeup" },
        { name: "Fragrance", slug: "fragrance" },
      ],
    });

    const homeCat = await Category.create({
      name: "Home & Garden",
      slug: "home-garden",
      description: "Modern Living Room, Bedroom & Kitchen Essentials",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
      subCategories: [
        { name: "Living Room", slug: "living-room" },
        { name: "Bedroom", slug: "bedroom" },
        { name: "Kitchen", slug: "kitchen" },
        { name: "Furniture", slug: "furniture" },
      ],
    });

    const sportsCat = await Category.create({
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description: "Professional Sports Equipment, Activewear & Outdoor Gear",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=600",
      subCategories: [
        { name: "Fitness & Gym", slug: "fitness" },
        { name: "Outdoor Gear", slug: "outdoor-gear" },
        { name: "Sports Equipment", slug: "sports-equipment" },
      ],
    });

    const booksCat = await Category.create({
      name: "Books",
      slug: "books",
      description: "Bestselling Fiction, Non-Fiction, Tech & Architecture Hardcovers",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
      subCategories: [
        { name: "Technology & Code", slug: "tech-books" },
        { name: "Architecture & Design", slug: "design-books" },
        { name: "Fiction & Novels", slug: "fiction" },
      ],
    });

    console.log("Creating Attributes...");
    await Attribute.create([
      { name: "Color", values: ["Space Black", "Titanium Silver", "Midnight Blue", "Crimson Red", "Emerald Green"] },
      { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
      { name: "Storage", values: ["128GB", "256GB", "512GB", "1TB"] },
      { name: "RAM", values: ["8GB", "16GB", "32GB"] },
    ]);

    console.log("Creating Products & Variants...");
    const prod1 = await Product.create({
      createdBy: adminUser._id,
      title: "iPhone 15 Pro Max",
      brand: "Apple",
      description: "Forged in titanium with revolutionary A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
      category: electronicsCat._id,
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
      ],
      specifications: [
        { key: "Display", value: "6.7-inch Super Retina XDR OLED" },
        { key: "Processor", value: "A17 Pro Chip" },
        { key: "Battery", value: "Up to 29 hours video playback" },
      ],
      variants: [
        {
          sku: "IP15PM-BLK-256",
          attributes: [
            { name: "Color", value: "Space Black" },
            { name: "Storage", value: "256GB" },
          ],
          sellingPrice: 1199,
          currentVendor: vendor1._id,
          currentStock: 45,
          currentVendorPrice: 1050,
          weight: 0.22,
          isActive: true,
        },
        {
          sku: "IP15PM-SIL-512",
          attributes: [
            { name: "Color", value: "Titanium Silver" },
            { name: "Storage", value: "512GB" },
          ],
          sellingPrice: 1399,
          currentVendor: vendor1._id,
          currentStock: 30,
          currentVendorPrice: 1240,
          weight: 0.22,
          isActive: true,
        },
      ],
      featured: true,
      isActive: true,
    });

    const prod2 = await Product.create({
      createdBy: adminUser._id,
      title: 'MacBook Pro 16" M3 Max',
      brand: "Apple",
      description: "Mind-blowing M3 Max chip performance, stunning Liquid Retina XDR display, up to 22 hours of battery life, and pro ports.",
      category: electronicsCat._id,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
      ],
      specifications: [
        { key: "Chip", value: "Apple M3 Max 16-Core CPU" },
        { key: "RAM", value: "36GB Unified Memory" },
        { key: "Display", value: '16.2" Liquid Retina XDR' },
      ],
      variants: [
        {
          sku: "MBP16-M3-36-1TB",
          attributes: [
            { name: "Color", value: "Space Black" },
            { name: "RAM", value: "32GB" },
            { name: "Storage", value: "1TB" },
          ],
          sellingPrice: 3499,
          currentVendor: vendor1._id,
          currentStock: 18,
          currentVendorPrice: 3150,
          weight: 2.14,
          isActive: true,
        },
      ],
      featured: true,
      isActive: true,
    });

    const prod3 = await Product.create({
      createdBy: adminUser._id,
      title: "Sony WH-1000XM5 Wireless Headphones",
      brand: "Sony",
      description: "Industry-leading noise canceling with two processors and eight microphones for unprecedented sound purity and crystal-clear hands-free calling.",
      category: electronicsCat._id,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
      ],
      specifications: [
        { key: "Battery Life", value: "30 Hours with ANC On" },
        { key: "Weight", value: "250g" },
      ],
      variants: [
        {
          sku: "SONY-XM5-BLK",
          attributes: [{ name: "Color", value: "Space Black" }],
          sellingPrice: 399,
          currentVendor: vendor1._id,
          currentStock: 60,
          currentVendorPrice: 320,
          weight: 0.25,
          isActive: true,
        },
      ],
      featured: true,
      offerPrice: 349,
      isActive: true,
    });

    const prod4 = await Product.create({
      createdBy: adminUser._id,
      title: "Heritage Genuine Leather Biker Jacket",
      brand: "UrbanStyle",
      description: "Handcrafted top-grain lambskin leather jacket featuring classic asymmetrical zip front, quilted shoulders, and silky satin inner lining.",
      category: fashionCat._id,
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
        "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800",
      ],
      specifications: [
        { key: "Material", value: "100% Genuine Lambskin Leather" },
        { key: "Closure", value: "YKK Heavy Duty Zippers" },
      ],
      variants: [
        {
          sku: "LJ-BLK-L",
          attributes: [
            { name: "Color", value: "Space Black" },
            { name: "Size", value: "L" },
          ],
          sellingPrice: 289,
          currentVendor: vendor2._id,
          currentStock: 25,
          currentVendorPrice: 210,
          weight: 1.4,
          isActive: true,
        },
        {
          sku: "LJ-BLK-XL",
          attributes: [
            { name: "Color", value: "Space Black" },
            { name: "Size", value: "XL" },
          ],
          sellingPrice: 289,
          currentVendor: vendor2._id,
          currentStock: 20,
          currentVendorPrice: 210,
          weight: 1.5,
          isActive: true,
        },
      ],
      featured: true,
      isActive: true,
    });

    const prod5 = await Product.create({
      createdBy: adminUser._id,
      title: "Radiant Glow Hydrating Facial Serum 50ml",
      brand: "GlowLab",
      description: "Advanced formulation with multi-molecular Hyaluronic Acid, Niacinamide 10%, and Botanical Peptides for instantaneous glow and deep hydration.",
      category: beautyCat._id,
      images: [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800",
      ],
      specifications: [
        { key: "Volume", value: "50ml / 1.7 fl oz" },
        { key: "Skin Type", value: "All Skin Types, Non-Comedogenic" },
      ],
      variants: [
        {
          sku: "GLOW-SERUM-50ML",
          attributes: [],
          sellingPrice: 65,
          currentVendor: vendor2._id,
          currentStock: 120,
          currentVendorPrice: 42,
          weight: 0.15,
          isActive: true,
        },
      ],
      featured: true,
      offerPrice: 49,
      isActive: true,
    });

    const prod6 = await Product.create({
      createdBy: adminUser._id,
      title: "Modern Scandinavian Velvet Armchair",
      brand: "Artisanal Living",
      description: "Ergonomically designed Scandinavian accent chair with plush velvet upholstery, high-density foam cushioning, and solid oak legs.",
      category: homeCat._id,
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      ],
      specifications: [
        { key: "Material", value: "Premium Velvet & Solid Oak Wood" },
        { key: "Dimensions", value: "32\"W x 34\"D x 31\"H" },
      ],
      variants: [
        {
          sku: "ARM-VLV-GRN",
          attributes: [{ name: "Color", value: "Emerald Green" }],
          sellingPrice: 449,
          currentVendor: vendor2._id,
          currentStock: 15,
          currentVendorPrice: 310,
          weight: 18.5,
          isActive: true,
        },
      ],
      featured: true,
      isActive: true,
    });

    const prod7 = await Product.create({
      createdBy: adminUser._id,
      title: "Pro Carbon Fiber Tennis Racket 300g",
      brand: "Apex Athletic",
      description: "Tournament-grade 100% graphite carbon fiber frame designed for maximum power, spin control, and vibration dampening.",
      category: sportsCat._id,
      images: [
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800",
        "https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800",
      ],
      specifications: [
        { key: "Head Size", value: "100 sq inch" },
        { key: "Weight", value: "300g / 10.6 oz" },
      ],
      variants: [
        {
          sku: "RACKET-CARBON-300G",
          attributes: [],
          sellingPrice: 220,
          currentVendor: vendor1._id,
          currentStock: 40,
          currentVendorPrice: 150,
          weight: 0.3,
          isActive: true,
        },
      ],
      featured: true,
      offerPrice: 189,
      isActive: true,
    });

    const prod8 = await Product.create({
      createdBy: adminUser._id,
      title: "The Tech Visionary Hardcover Edition",
      brand: "Global Publishing",
      description: "An extraordinary masterclass on AI, modern software architecture, and the future of technological innovation.",
      category: booksCat._id,
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
      ],
      specifications: [
        { key: "Pages", value: "480 Hardcover" },
        { key: "Publisher", value: "Global Premium Press" },
      ],
      variants: [
        {
          sku: "BOOK-TECH-VISION-HC",
          attributes: [],
          sellingPrice: 34.99,
          currentVendor: vendor1._id,
          currentStock: 80,
          currentVendorPrice: 18,
          weight: 0.8,
          isActive: true,
        },
      ],
      featured: true,
      isActive: true,
    });

    console.log("Creating VendorStock records...");
    await VendorStock.create([
      {
        product: prod1._id,
        sku: "IP15PM-BLK-256",
        vendor: vendor1._id,
        stockQuantity: 45,
        vendorPrice: 1050,
      },
      {
        product: prod2._id,
        sku: "MBP16-M3-36-1TB",
        vendor: vendor1._id,
        stockQuantity: 18,
        vendorPrice: 3150,
      },
      {
        product: prod4._id,
        sku: "LJ-BLK-L",
        vendor: vendor2._id,
        stockQuantity: 25,
        vendorPrice: 210,
      },
    ]);

    console.log("Creating Banners...");
    await Banner.create([
      {
        title: "The Next-Gen Tech Summit",
        subtitle: "Upgrade to iPhone 15 Pro Max & MacBook M3 with up to $200 instant trade-in credit.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
        link: "/electronics",
        linkText: "Shop Electronics",
      },
      {
        title: "Summer High-Fashion Edit",
        subtitle: "Handcrafted genuine leather jackets & luxury designer wear.",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
        link: "/fashion",
        linkText: "Explore Collection",
      },
      {
        title: "Radiant Skincare Revolution",
        subtitle: "Clean, organic, dermatologist-tested formulas for ageless glowing skin.",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200",
        link: "/beauty",
        linkText: "Discover Beauty",
      },
    ]);

    console.log("Creating Coupons...");
    await Coupon.create([
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 100,
        expiryDate: new Date("2028-12-31"),
        isActive: true,
      },
      {
        code: "NAASHYOL50",
        discountType: "flat",
        discountValue: 50,
        minOrderAmount: 300,
        expiryDate: new Date("2028-12-31"),
        isActive: true,
      },
    ]);

    console.log("Creating Reviews...");
    await Review.create([
      {
        product: prod1._id,
        user: customerUser._id,
        rating: 5,
        comment: "Absolutely stellar smartphone! The camera zoom and titanium weight feel remarkable.",
        isApproved: true,
      },
      {
        product: prod3._id,
        user: customerUser2._id,
        rating: 5,
        comment: "The noise cancellation is unmatched. Perfect for flight travel and work calls.",
        isApproved: true,
      },
    ]);

    console.log("Creating Support Tickets...");
    await SupportTicket.create([
      {
        userId: customerUser._id,
        subject: "Order Tracking Inquiry for #ORD-9821",
        message: "Hi support team, I would like to confirm if my order will be delivered by this Friday.",
        priority: "medium",
        status: "open",
        adminReply: [
          {
            adminId: adminUser._id,
            message: "Hello Sophia! Your shipment is currently in transit with express courier. Delivery is estimated for Thursday afternoon.",
          },
        ],
      },
    ]);

    console.log("Creating Sample Orders...");
    await Order.create([
      {
        user: customerUser._id,
        items: [
          {
            productId: prod1._id,
            title: prod1.title,
            price: 1199,
            quantity: 1,
            vendorId: vendor1._id,
          },
        ],
        totalAmount: 1244.92,
        address: {
          fullName: "Sophia Carter",
          phone: "+1 555-0143",
          street: "742 Evergreen Terrace",
          city: "Springfield",
          state: "IL",
          pincode: "62704",
        },
        paymentStatus: "paid",
        orderStatus: "delivered",
        couponCode: "NAASHYOL50",
        discountAmount: 50,
      },
      {
        user: customerUser2._id,
        items: [
          {
            productId: prod3._id,
            title: prod3.title,
            price: 349,
            quantity: 1,
            vendorId: vendor1._id,
          },
        ],
        totalAmount: 391.92,
        address: {
          fullName: "Liam Johnson",
          phone: "+1 555-0988",
          street: "123 Maple Street",
          city: "Austin",
          state: "TX",
          pincode: "78701",
        },
        paymentStatus: "paid",
        orderStatus: "shipped",
      },
    ]);

    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ DB Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();
