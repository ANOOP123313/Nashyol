export const homeGardenProducts = [
  {
    title: "Herman Miller Aeron Ergonomic Office Chair",
    brand: "Herman Miller",
    subCategory: "Furniture",
    description: "The gold standard of ergonomic seating. Designed with Pellicle breathable elastomer suspension that dissipates body heat, PostureFit SL adjustable sacral and lumbar pads, fully adjustable arms, and harmonic tilt mechanism for effortless reclining.",
    price: 119999,
    offerPrice: 104999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1580481077197-0b1a207b7b12?w=800",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    ],
    specifications: [
      { key: "Ergonomics", value: "PostureFit SL lumbar support and forward tilt angle" },
      { key: "Mesh", value: "8Z Pellicle breathable suspension weave across 8 tension zones" },
      { key: "Adjustability", value: "Height, tilt tension, tilt limiter, 3D armrests (height, depth, angle)" },
      { key: "Size", value: "Size B (Medium - Fits 5'3\" to 6'2\" up to 350 lbs)" },
      { key: "Warranty", value: "12-Year 3-shift manufacturer warranty" },
    ],
    variants: [
      {
        sku: "HM-AERON-SIZE-B",
        attributes: [
          { name: "Size", value: "B (Medium)" },
          { name: "Color", value: "Mineral / Satin Aluminum" },
        ],
        sellingPrice: 104999,
        currentVendorPrice: 92000,
        currentStock: 15,
        weight: 18.0,
      },
    ],
    reviews: [
      {
        customerName: "Karthik Menon",
        rating: 5,
        comment: "Completely eliminated my lower back stiffness after 10-hour coding sessions. The Pellicle mesh keeps your back cool throughout humid afternoons.",
      },
      {
        customerName: "David Wilson",
        rating: 5,
        comment: "Worth every penny for posture and spinal health. Forward-tilt mode is fantastic for intensive drafting work.",
      },
    ],
  },
  {
    title: "Serta Perfect Sleeper 12-inch Gel Memory Foam Mattress",
    brand: "Serta",
    subCategory: "Bedding & Mattresses",
    description: "Engineered to solve the 5 most common sleep problems: tossing and turning, lack of support, sleeping too hot, partner movement, and mattress roll-off. Features Cool Twist gel memory foam and 825 Custom Support individually wrapped coils.",
    price: 49999,
    offerPrice: 42999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
    ],
    specifications: [
      { key: "Mattress Type", value: "Hybrid Gel Memory Foam + Pocketed Innerspring Coils" },
      { key: "Comfort Level", value: "Medium Plush" },
      { key: "Thickness", value: "12 inches (30.5 cm)" },
      { key: "Cooling Tech", value: "Cool Twist Gel Infused Memory Foam" },
      { key: "Edge Support", value: "BestEdge Foam Encasement to prevent roll-off" },
    ],
    variants: [
      {
        sku: "SERTA-PS-QUEEN",
        attributes: [
          { name: "Size", value: "Queen (78 x 60 inches)" },
          { name: "Profile", value: "12-inch" },
        ],
        sellingPrice: 42999,
        currentVendorPrice: 36000,
        currentStock: 20,
        weight: 35.0,
      },
    ],
    reviews: [
      {
        customerName: "Sunita Rao",
        rating: 5,
        comment: "Motion isolation is miraculous—my husband tosses and turns and I don't feel a ripple. Gel memory foam layer maintains a neutral temperature all night.",
      },
      {
        customerName: "Priya Sharma",
        rating: 5,
        comment: "Firm supportive core with just enough plush cloud cushioning on top for shoulder and hip relief.",
      },
    ],
  },
  {
    title: "Artemide Tolomeo Tavolo Italian Designer Desk Lamp",
    brand: "Artemide",
    subCategory: "Lighting",
    description: "Designed in Italy by Michele De Lucchi and Giancarlo Fassina. An icon of industrial design in the permanent collection of MoMA. Features fully articulating arms with spring-balancing system and 360-degree swiveling matte anodized aluminum shade.",
    price: 24900,
    offerPrice: 21500,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    ],
    specifications: [
      { key: "Designers", value: "Michele De Lucchi & Giancarlo Fassina (Compasso d'Oro Award winner)" },
      { key: "Material", value: "Polished aluminum arms and matte anodized aluminum diffuser" },
      { key: "Socket", value: "E27 (compatible with smart LED bulbs up to 75W)" },
      { key: "Reach", value: "Extends up to 51 inches height with 48 inches horizontal reach" },
      { key: "Origin", value: "Made in Italy" },
    ],
    variants: [
      {
        sku: "ARTM-TOLO-TAV-SIL",
        attributes: [
          { name: "Finish", value: "Silver / Polished Aluminum" },
        ],
        sellingPrice: 21500,
        currentVendorPrice: 18500,
        currentStock: 25,
        weight: 4.8,
      },
    ],
    reviews: [
      {
        customerName: "David Wilson",
        rating: 5,
        comment: "The precision cable tension system allows you to position the light at any point in space with one fingertip and it holds solidly. Sculptural beauty on an executive desk.",
      },
      {
        customerName: "Ananya Iyer",
        rating: 5,
        comment: "Classic Italian architecture piece. Directs glare-free task lighting precisely onto reading materials.",
      },
    ],
  },
  {
    title: "CB2 Large Fluted Ceramic Architectural Floor Vase",
    brand: "CB2",
    subCategory: "Home Decor",
    description: "Sculptural fluting brings organic depth and Scandinavian modernism to any corner. Handcrafted by master ceramic artisans with a tactile chalky matte white finish and organic curved silhouette. Perfect for dried eucalyptus or pampas grass.",
    price: 8990,
    offerPrice: 7490,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800",
    ],
    specifications: [
      { key: "Dimensions", value: "14 inches diameter x 28 inches height" },
      { key: "Material", value: "100% High-fire stoneware ceramic with unglazed matte finish" },
      { key: "Craft", value: "Hand-thrown and fluted by ceramic craftspeople" },
      { key: "Waterproof", value: "Water-tight interior glazing allows fresh botanical arrangements" },
    ],
    variants: [
      {
        sku: "CB2-FLUT-VASE-WHT",
        attributes: [
          { name: "Finish", value: "Matte Chalk White" },
          { name: "Height", value: '28"' },
        ],
        sellingPrice: 7490,
        currentVendorPrice: 6000,
        currentStock: 35,
        weight: 8.5,
      },
    ],
    reviews: [
      {
        customerName: "Priya Sharma",
        rating: 5,
        comment: "Anchors our entryway console table with stunning presence. The fluted grooves create gorgeous shadows in ambient evening lighting.",
      },
      {
        customerName: "Emily Watson",
        rating: 5,
        comment: "Substantial, heavy weight prevents tipping over. Looks identical to luxury showroom pieces.",
      },
    ],
  },
  {
    title: "Le Creuset Enameled Cast Iron Dutch Oven 5.5 Qt",
    brand: "Le Creuset",
    subCategory: "Kitchen & Dining",
    description: "Handcrafted in Fresnoy-le-Grand, France since 1925. The premier choice for slow-cooking, braising, baking artisan sourdough bread, and simmering soups. Superior heat distribution and retention with chip-resistant vibrant enamel exterior.",
    price: 34999,
    offerPrice: 29999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=800",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800",
    ],
    specifications: [
      { key: "Capacity", value: "5.5 Quarts (Serves 5-6 people)" },
      { key: "Material", value: "Enameled cast iron with sand-colored smooth interior" },
      { key: "Heat Source", value: "Compatible with Gas, Electric, Ceramic, Halogen, Induction & Ovens up to 500°F" },
      { key: "Knob", value: "Ergonomic stainless steel knob safe at any oven temperature" },
      { key: "Origin", value: "Handcrafted in France with Lifetime Warranty" },
    ],
    variants: [
      {
        sku: "LECR-DO-55-CER",
        attributes: [
          { name: "Color", value: "Cerise Red" },
          { name: "Capacity", value: "5.5 Qt" },
        ],
        sellingPrice: 29999,
        currentVendorPrice: 26000,
        currentStock: 25,
        weight: 5.1,
      },
    ],
    reviews: [
      {
        customerName: "Sophia Carter",
        rating: 5,
        comment: "Baked sourdough bread with blistering artisan crust and oven spring. Braised beef short ribs turned spoon-tender in 3 hours.",
      },
      {
        customerName: "Aarav Mehta",
        rating: 5,
        comment: "Enamel cleans up effortlessly with warm water and sponge without burnt seasoning scrubbing. An heirloom kitchen piece.",
      },
    ],
  },
  {
    title: "Songmics 6-Tier Heavy Duty Commercial Wire Shelving",
    brand: "Songmics",
    subCategory: "Storage & Organization",
    description: "Maximize pantry, garage, or kitchen vertical storage. Heavy-duty carbon steel shelving unit with rust-resistant chrome plating. Each shelf supports up to 350 lbs (2,100 lbs total capacity). Includes optional heavy-duty lockable caster wheels.",
    price: 11499,
    offerPrice: 9499,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1595428773653-30a35a1c7a1b?w=800",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    ],
    specifications: [
      { key: "Dimensions", value: "48\" Wide x 18\" Deep x 72\" High (76\" with wheels)" },
      { key: "Weight Capacity", value: "350 lbs per shelf on leveling feet (2,100 lbs total capacity)" },
      { key: "Material", value: "Commercial grade carbon steel with protective chrome plating" },
      { key: "Adjustability", value: "Shelves adjust in 1-inch increments without tools" },
      { key: "Mobility", value: "Includes 4x 3-inch heavy duty wheels (2 locking) and 4 leveling feet" },
    ],
    variants: [
      {
        sku: "SONG-6TIER-CHRM",
        attributes: [
          { name: "Finish", value: "Chrome Plated" },
          { name: "Tiers", value: "6-Tier" },
        ],
        sellingPrice: 9499,
        currentVendorPrice: 7800,
        currentStock: 40,
        weight: 22.0,
      },
    ],
    reviews: [
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "Assembled in 20 minutes without needing a wrench. Holds all our heavy Instant Pots, Dutch ovens, and dry food storage containers without bowing.",
      },
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "Smooth rolling wheels make it easy to clean behind the pantry shelves. Incredibly sturdy industrial grade quality.",
      },
    ],
  },
  {
    title: "nuLOOM Rigo Hand Woven Natural Jute Area Rug 8x10",
    brand: "nuLOOM",
    subCategory: "Rugs & Carpets",
    description: "Bring earthy warmth and artisan texture to your living room or dining area. Handcrafted by skilled artisans from 100% sustainably harvested natural jute fibers. Chunky woven ribbed loop pile feels surprisingly soft underfoot.",
    price: 16999,
    offerPrice: 14499,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800",
    ],
    specifications: [
      { key: "Size", value: "8 Feet x 10 Feet (244 cm x 305 cm)" },
      { key: "Material", value: "100% Biodegradable Natural Farm-Grown Jute Fibers" },
      { key: "Weave", value: "Hand Woven Chunky Boucle Loop Pile (0.35-inch thickness)" },
      { key: "Texture", value: "Soft, durable, pet-friendly and reversible design" },
    ],
    variants: [
      {
        sku: "NUL-JUTE-8X10-NAT",
        attributes: [
          { name: "Color", value: "Natural Tan" },
          { name: "Size", value: "8' x 10'" },
        ],
        sellingPrice: 14499,
        currentVendorPrice: 12200,
        currentStock: 30,
        weight: 16.5,
      },
    ],
    reviews: [
      {
        customerName: "Sunita Rao",
        rating: 5,
        comment: "Lies flat right out of the roll with zero curl at the corners. The neutral golden-tan shade ties together our modern Scandinavian living room.",
      },
      {
        customerName: "Emily Watson",
        rating: 4,
        comment: "Does not shed excessively like wool rugs. Highly recommend using a non-slip rug pad underneath for wooden floors.",
      },
    ],
  },
  {
    title: "Deconovo 100% Blackout Thermal Insulated Grommet Curtains",
    brand: "Deconovo",
    subCategory: "Curtains & Blinds",
    description: "Engineered with triple-weave blackout fabric with back coating that completely blocks 100% of sunlight and streetlights. Thermal insulation reduces summer heat gain and winter drafts while dampening exterior noise for restful sleep.",
    price: 4999,
    offerPrice: 4199,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=800",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
    ],
    specifications: [
      { key: "Package", value: "Set of 2 Panels (Each panel 52\" Wide x 84\" Length)" },
      { key: "Blackout Rating", value: "100% Total Blackout (Blocks all daylight and UV rays)" },
      { key: "Fabric", value: "Heavyweight 260 GSM polyester with silky drape and thermal lining" },
      { key: "Header", value: "8 anti-rust silver grommets per panel (1.6-inch inner diameter)" },
    ],
    variants: [
      {
        sku: "DEC-BO-CURT-GRY-84",
        attributes: [
          { name: "Color", value: "Slate Dark Gray" },
          { name: "Dimensions", value: "52\"W x 84\"L (Pair)" },
        ],
        sellingPrice: 4199,
        currentVendorPrice: 3400,
        currentStock: 50,
        weight: 2.2,
      },
    ],
    reviews: [
      {
        customerName: "Sneha Patel",
        rating: 5,
        comment: "Turns midday bedroom lighting into complete midnight pitch black. Noticeably lowered our afternoon AC power bill during hot heatwaves.",
      },
      {
        customerName: "Karthik Menon",
        rating: 5,
        comment: "Drapes hang straight with elegant deep folds. No chemical odor upon unboxing.",
      },
    ],
  },
  {
    title: "Live Fiddle Leaf Fig Tree (Ficus Lyrata) in Ceramic Pot",
    brand: "Costa Farms",
    subCategory: "Plants & Garden",
    description: "The premier statement houseplant with huge, violin-shaped glossy green leaves that purify indoor air. Grown by horticultural experts, shipped directly in a modern 10-inch fluted ceramic decorative planter with saucer.",
    price: 5499,
    offerPrice: 4699,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800",
      "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800",
    ],
    specifications: [
      { key: "Plant Height", value: "3 to 4 Feet tall (36-48 inches from pot base)" },
      { key: "Light Requirements", value: "Bright, filtered indirect sunlight" },
      { key: "Watering", value: "Water once every 7-10 days when top 2 inches of soil feel dry" },
      { key: "Planter", value: "Includes 10-inch premium ceramic pot with drainage hole and saucer" },
      { key: "Air Quality", value: "Natural indoor air purifier removing airborne toxins" },
    ],
    variants: [
      {
        sku: "PLNT-FLF-4FT-POT",
        attributes: [
          { name: "Pot Color", value: "Matte White Ceramic" },
          { name: "Height", value: "3-4 Ft" },
        ],
        sellingPrice: 4699,
        currentVendorPrice: 3800,
        currentStock: 35,
        weight: 12.0,
      },
    ],
    reviews: [
      {
        customerName: "Ananya Iyer",
        rating: 5,
        comment: "Arrived in flawless packaging with moist soil and zero leaf drop. The deep green violin leaves bring fresh life to my home office corner.",
      },
      {
        customerName: "Priya Sharma",
        rating: 5,
        comment: "Sprouted two large new leaves within the first 3 weeks. The included ceramic planter is heavy and chic.",
      },
    ],
  },
  {
    title: "Brooklinen Super-Plush Turkish Cotton Bath Towel 4-Piece Set",
    brand: "Brooklinen",
    subCategory: "Bathroom Essentials",
    description: "Indulge in five-star luxury spa softness. Woven from 100% long-staple Turkish cotton at an ultra-dense 820 GSM weight. Delivers cloud-like absorbency, ribbed borders, and OEKO-TEX certified skin safety.",
    price: 8499,
    offerPrice: 7199,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
    ],
    specifications: [
      { key: "Material", value: "100% Long-Staple Combed Turkish Cotton" },
      { key: "Density", value: "Ultra-heavyweight 820 GSM for maximum plush absorbency" },
      { key: "Set Includes", value: "4x Generous Bath Towels (30\" x 58\" each)" },
      { key: "Certification", value: "OEKO-TEX Standard 100 certified free of harmful chemicals" },
    ],
    variants: [
      {
        sku: "BRK-TOWL-4PK-WHT",
        attributes: [
          { name: "Color", value: "Classic Crisp White" },
          { name: "Set", value: "4-Pack Bath Towels" },
        ],
        sellingPrice: 7199,
        currentVendorPrice: 5900,
        currentStock: 45,
        weight: 3.2,
      },
    ],
    reviews: [
      {
        customerName: "Sophia Carter",
        rating: 5,
        comment: "Thickest, most absorbent bath towels I've ever experienced. They absorb water instantly after a hot shower without getting soggy.",
      },
      {
        customerName: "Mohammed Al-Fassi",
        rating: 5,
        comment: "Retained their fluffiness after multiple machine washes without thread unraveling. Spa-grade luxury.",
      },
    ],
  },
];
