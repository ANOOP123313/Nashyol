export const fashionProducts = [
  {
    title: "Ralph Lauren Custom Fit Oxford Shirt",
    brand: "Polo Ralph Lauren",
    subCategory: "T-Shirts & Shirts",
    description: "An enduring icon of preppy American style. Crafted from breathable, heavyweight cotton oxford with Ralph Lauren's signature multicolored embroidered pony on the left chest. Features a neat button-down point collar and split back yoke.",
    price: 9990,
    offerPrice: 8490,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
    ],
    specifications: [
      { key: "Material", value: "100% Premium Combed Cotton Oxford" },
      { key: "Fit", value: "Custom Fit (Tailored through waist and sleeves)" },
      { key: "Collar", value: "Classic Button-Down Point Collar" },
      { key: "Care", value: "Machine washable, warm iron" },
      { key: "Country of Origin", value: "Imported" },
    ],
    variants: [
      {
        sku: "RL-OXF-WHT-M",
        attributes: [
          { name: "Color", value: "Classic White" },
          { name: "Size", value: "M" },
        ],
        sellingPrice: 8490,
        currentVendorPrice: 7100,
        currentStock: 65,
        weight: 0.35,
      },
      {
        sku: "RL-OXF-BLU-L",
        attributes: [
          { name: "Color", value: "Sky Blue" },
          { name: "Size", value: "L" },
        ],
        sellingPrice: 8490,
        currentVendorPrice: 7100,
        currentStock: 50,
        weight: 0.35,
      },
    ],
    reviews: [
      {
        customerName: "Aarav Mehta",
        rating: 5,
        comment: "The cotton weave softens up beautifully after a couple of washes. Custom fit sits sharp under blazers or casually untucked with chinos.",
      },
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "Timeless staple. The collar maintains its crisp roll all day long without needing collar stays.",
      },
    ],
  },
  {
    title: "Levi's 501 Original Fit Straight Leg Jeans",
    brand: "Levi's",
    subCategory: "Jeans & Trousers",
    description: "The original blue jean since 1873. The Levi's 501 is the blueprint for every pair of jeans in existence—wrought with iconic straight fit, signature button fly, and copper rivets. Made from non-stretch heavyweight denim for authentic vintage drape.",
    price: 4599,
    offerPrice: 3899,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800",
    ],
    specifications: [
      { key: "Fabric", value: "100% Cotton Heavyweight Non-Stretch Denim" },
      { key: "Rise", value: "Mid rise, sits comfortably at waist" },
      { key: "Closure", value: "Iconic 5-button metal fly" },
      { key: "Leg Opening", value: "Straight 16-inch opening" },
      { key: "Stitching", value: "Classic contrast gold thread with red Tab logo" },
    ],
    variants: [
      {
        sku: "LEV-501-IND-32",
        attributes: [
          { name: "Color", value: "Dark Indigo Rinse" },
          { name: "Waist", value: "32" },
          { name: "Length", value: "32" },
        ],
        sellingPrice: 3899,
        currentVendorPrice: 3100,
        currentStock: 80,
        weight: 0.72,
      },
    ],
    reviews: [
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "True to size and molds to your body shape after wearing for a week. The heavyweight denim has that rugged, durable feel you can't get from stretch jeans.",
      },
      {
        customerName: "Karthik Menon",
        rating: 4,
        comment: "Classic 501 cut pairs well with Red Wing boots or white sneakers. Deep indigo wash doesn't bleed in cold wash.",
      },
    ],
  },
  {
    title: "Reformation Juliette Floral High-Slit Midi Dress",
    brand: "Reformation",
    subCategory: "Dresses & Tops",
    description: "A romantic, slim-fitting midi dress featuring tie straps, a sweetheart neckline, a smocked back bodice for flexibility, and a dramatic side slit. Cut from lightweight, sustainably sourced georgette viscose with French garden floral prints.",
    price: 18990,
    offerPrice: 16490,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800",
    ],
    specifications: [
      { key: "Material", value: "100% FSC-certified Viscose Georgette" },
      { key: "Length", value: "Midi (46 inches from shoulder)" },
      { key: "Details", value: "Adjustable self-tie shoulder straps, side zipper closure" },
      { key: "Bodice", value: "Smocked stretch back bodice with sweetheart bust" },
      { key: "Sustainability", value: "Made in a climate-neutral certified Los Angeles facility" },
    ],
    variants: [
      {
        sku: "REF-JUL-FLOR-S",
        attributes: [
          { name: "Color", value: "Emerald Daisy" },
          { name: "Size", value: "S" },
        ],
        sellingPrice: 16490,
        currentVendorPrice: 14000,
        currentStock: 25,
        weight: 0.28,
      },
    ],
    reviews: [
      {
        customerName: "Priya Sharma",
        rating: 5,
        comment: "Wore this for an outdoor summer wedding and received endless compliments. The smocked back makes the chest area fit like a bespoke glove.",
      },
      {
        customerName: "Ananya Iyer",
        rating: 5,
        comment: "The high slit makes walking and dancing effortless. The viscose fabric flows gracefully and doesn't cling.",
      },
    ],
  },
  {
    title: "The North Face 1996 Retro Nuptse 700-Fill Down Jacket",
    brand: "The North Face",
    subCategory: "Jackets & Coats",
    description: "Built for mountain and city life, the iconic 1996 Retro Nuptse Jacket combines retro styling with modern weather protection. Stuffed with certified 700-fill goose down, shiny water-repellent ripstop shell, and a stowable hood in the collar.",
    price: 28999,
    offerPrice: 25999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800",
    ],
    specifications: [
      { key: "Insulation", value: "700-fill Responsible Down Standard (RDS) certified goose down" },
      { key: "Shell", value: "40D 54 g/m² 100% recycled nylon ripstop with non-PFC DWR water finish" },
      { key: "Pockets", value: "Secure-zip hand pockets; jacket stows into right hand pocket" },
      { key: "Cuffs", value: "Adjustable hook-and-loop cuff tabs with Triclimate loops" },
      { key: "Fit", value: "Relaxed boxy silhouette with bungee cinch hem" },
    ],
    variants: [
      {
        sku: "TNF-NUPT96-BLK-L",
        attributes: [
          { name: "Color", value: "TNF Black" },
          { name: "Size", value: "L" },
        ],
        sellingPrice: 25999,
        currentVendorPrice: 22000,
        currentStock: 35,
        weight: 0.775,
      },
    ],
    reviews: [
      {
        customerName: "David Wilson",
        rating: 5,
        comment: "Sub-zero warmth without feeling like a heavy medieval suit of armor. The 700-fill down lofts right back up even after being crammed in a carry-on.",
      },
      {
        customerName: "Mohammed Al-Fassi",
        rating: 5,
        comment: "Authentic 90s silhouette that sits perfectly over hoodies. DWR coating sheds snow and drizzle effortlessly.",
      },
    ],
  },
  {
    title: "Nike Air Max 90 Classic Leather Athletic Sneakers",
    brand: "Nike",
    subCategory: "Shoes & Footwear",
    description: "Nothing as fly, nothing as comfortable, nothing as proven. The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle outsole, stitched leather overlays, and classic TPU accents with visible Max Air cushioning.",
    price: 11495,
    offerPrice: 9995,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800",
    ],
    specifications: [
      { key: "Cushioning", value: "Visible Max Air heel cushioning originally designed for performance running" },
      { key: "Upper", value: "Full-grain leather with suede and breathable mesh panels" },
      { key: "Sole", value: "Rubber Waffle sole delivers heritage traction and durability" },
      { key: "Collar", value: "Padded, low-cut collar looks sleek and feels plush" },
    ],
    variants: [
      {
        sku: "NIKE-AM90-WHT-9",
        attributes: [
          { name: "Color", value: "Triple White" },
          { name: "Size (US)", value: "9" },
        ],
        sellingPrice: 9995,
        currentVendorPrice: 8200,
        currentStock: 55,
        weight: 0.88,
      },
    ],
    reviews: [
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "Walked 20,000 steps a day during a Tokyo trip and my feet never complained. The air bubble has that perfect springy responsiveness.",
      },
      {
        customerName: "Sneha Patel",
        rating: 4,
        comment: "Clean white leather wipes down easily with sneaker cleaner. True to size with ample toe room.",
      },
    ],
  },
  {
    title: "Samsonite Freeform Hardside Spinner 28-inch Checked Luggage",
    brand: "Samsonite",
    subCategory: "Bags & Luggage",
    description: "Extremely lightweight and durable, Freeform is created to bring the strength and maneuverability our travelers have come to expect, with a truly unique futuristic ribbed design. Double spinner wheels and TSA-approved flush-mounted lock.",
    price: 19999,
    offerPrice: 16999,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800",
    ],
    specifications: [
      { key: "Dimensions", value: "28 x 20.5 x 13.25 inches (Checked Luggage Size)" },
      { key: "Weight", value: "9.5 lbs (Super lightweight injection-molded polypropylene)" },
      { key: "Wheels", value: "Four multi-directional double spinner wheels for effortless 360-degree rolls" },
      { key: "Lock", value: "Integrated 3-dial TSA combination lock" },
      { key: "Expansion", value: "Expands 1.5 inches for additional packing capacity" },
    ],
    variants: [
      {
        sku: "SAM-FF-28-NAVY",
        attributes: [
          { name: "Color", value: "Navy Blue" },
          { name: "Size", value: "28-inch Checked" },
        ],
        sellingPrice: 16999,
        currentVendorPrice: 14200,
        currentStock: 30,
        weight: 4.3,
      },
    ],
    reviews: [
      {
        customerName: "Emily Watson",
        rating: 5,
        comment: "Survived 4 international flight transfers without a single crack or dent. Glides across airport tile with zero resistance.",
      },
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "Internal compression cross-straps and zippered divider panel keep suits and dress shirts crisp without wrinkling.",
      },
    ],
  },
  {
    title: "Tissot PRX Powermatic 80 Automatic 40mm Watch",
    brand: "Tissot",
    subCategory: "Watches",
    description: "An authentic reissue of the 1978 design. Featuring an integrated stainless steel case and bracelet, waffle embossed dial, sapphire crystal, and the Swiss Powermatic 80 automatic movement with an 80-hour power reserve and Nivachron hairspring.",
    price: 68500,
    offerPrice: 62500,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
    ],
    specifications: [
      { key: "Movement", value: "Swiss Made Powermatic 80.111 automatic movement (80-hour power reserve)" },
      { key: "Case Diameter", value: "40mm 316L stainless steel barrel-shaped case" },
      { key: "Glass", value: "Scratch-resistant sapphire crystal with anti-reflective coating" },
      { key: "Water Resistance", value: "100 meters / 330 feet with exhibition caseback" },
      { key: "Dial", value: "Sunray blue waffle-embossed textured dial with Super-LumiNova hands" },
    ],
    variants: [
      {
        sku: "TISS-PRX80-BLU",
        attributes: [
          { name: "Dial Color", value: "Sunburst Blue" },
          { name: "Bracelet", value: "Integrated Stainless Steel" },
        ],
        sellingPrice: 62500,
        currentVendorPrice: 55000,
        currentStock: 20,
        weight: 0.138,
      },
    ],
    reviews: [
      {
        customerName: "Mohammed Al-Fassi",
        rating: 5,
        comment: "The integrated bracelet catches and reflects the light like a luxury watch costing five times more. 80-hour power reserve means you can take it off Friday and pick it up running on Monday.",
      },
      {
        customerName: "Aarav Mehta",
        rating: 5,
        comment: "Waffle dial texture in direct sunlight has immense depth. Swiss accuracy is within +3 seconds per day.",
      },
    ],
  },
  {
    title: "Ray-Ban Aviator Classic Green G-15 Polarized Sunglasses",
    brand: "Ray-Ban",
    subCategory: "Sunglasses & Eyewear",
    description: "Originally designed in 1937 for US aviators, the Ray-Ban Aviator Classic RB3025 is one of the most iconic sunglass models in the world. Features a lightweight gold metal frame with crystal green G-15 polarized lenses that absorb 85% of visible light.",
    price: 11990,
    offerPrice: 10490,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800",
    ],
    specifications: [
      { key: "Frame Material", value: "Corrosion-resistant gold electroplated metal" },
      { key: "Lens Technology", value: "Crystal Green G-15 Polarized (Category 3 filter)" },
      { key: "UV Protection", value: "100% UV400 protection against UVA, UVB, and harmful blue light" },
      { key: "Size", value: "Standard 58-14 (Lens width 58mm, Bridge 14mm, Temple 135mm)" },
      { key: "Included", value: "Genuine leather Ray-Ban protective case and microfiber cloth" },
    ],
    variants: [
      {
        sku: "RB-3025-GOLD-58",
        attributes: [
          { name: "Frame Color", value: "Arista Gold" },
          { name: "Lens Color", value: "Green Classic G-15 Polarized" },
        ],
        sellingPrice: 10490,
        currentVendorPrice: 8800,
        currentStock: 45,
        weight: 0.032,
      },
    ],
    reviews: [
      {
        customerName: "Sunita Rao",
        rating: 5,
        comment: "Polarized G-15 lenses cut road and water glare completely when driving in bright afternoon glare. Incredibly comfortable nose bridge pads.",
      },
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "Gold frame with green glass lenses never goes out of style. Built with authentic Italian craftsmanship.",
      },
    ],
  },
  {
    title: "Manyavar Royal Silk Blend Embroidered Kurta Pajama Set",
    brand: "Manyavar",
    subCategory: "Kurtas & Ethnic Wear",
    description: "Exude timeless royal elegance at weddings and festival celebrations. Crafted from a luxurious art silk blend with intricate mandarin collar zardozi embroidery, tailored side slits, and comfortable matching churidar pajama trousers.",
    price: 7999,
    offerPrice: 6799,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1727835523550-18478cacefa2?w=800",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
    ],
    specifications: [
      { key: "Fabric", value: "Premium Dupion Silk & Cotton Blend" },
      { key: "Embroidery", value: "Hand-finished Resham & Zari work on collar and placket" },
      { key: "Collar", value: "Mandarin Bandhgala Collar" },
      { key: "Includes", value: "1x Knee-length Kurta, 1x Drawstring Churidar Pajama" },
      { key: "Occasion", value: "Weddings, Eid, Diwali, Festive Celebrations" },
    ],
    variants: [
      {
        sku: "MAN-KURT-MRN-40",
        attributes: [
          { name: "Color", value: "Royal Wine Maroon" },
          { name: "Chest Size", value: "40 (L)" },
        ],
        sellingPrice: 6799,
        currentVendorPrice: 5500,
        currentStock: 40,
        weight: 0.65,
      },
    ],
    reviews: [
      {
        customerName: "Karthik Menon",
        rating: 5,
        comment: "The silk blend fabric has a subtle sheen that looks majestic under banquet chandeliers. The churidar fits comfortably around the calves without pinching.",
      },
      {
        customerName: "Aarav Mehta",
        rating: 5,
        comment: "Impeccable stitching and rich maroon color. Received numerous compliments throughout the sangeet night.",
      },
    ],
  },
  {
    title: "Under Armour HeatGear Compression Long Leggings & Top Set",
    brand: "Under Armour",
    subCategory: "Activewear & Sports",
    description: "HeatGear is Under Armour's original performance baselayer—the one you put on first and take off last. Delivers ultra-tight compression, 4-way stretch, moisture-wicking technology, and anti-odor ergonomics to keep you dry and cool during intense workouts.",
    price: 5499,
    offerPrice: 4699,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1695459468644-717c8ae17eed?w=800",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    ],
    specifications: [
      { key: "Material", value: "84% Polyester / 16% Elastane HeatGear Fabric" },
      { key: "Technology", value: "Moisture Transport System wicks sweat & dries fast" },
      { key: "Stretch", value: "4-way stretch material moves better in every direction" },
      { key: "Seams", value: "Ergonomic flatlock seams prevent chafing during heavy squats and runs" },
      { key: "Ventilation", value: "Strategic mesh panels on underarms and back knees for airflow" },
    ],
    variants: [
      {
        sku: "UA-HG-COMP-BLK-M",
        attributes: [
          { name: "Color", value: "Black / Steel" },
          { name: "Size", value: "M" },
        ],
        sellingPrice: 4699,
        currentVendorPrice: 3800,
        currentStock: 60,
        weight: 0.38,
      },
    ],
    reviews: [
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "Excellent muscle compression reduces quad soreness after heavy deadlift sessions. Dries completely within 15 minutes of cardio.",
      },
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "Waistband doesn't roll down while sprinting. Premium fabric doesn't go sheer during deep squats.",
      },
    ],
  },
];
