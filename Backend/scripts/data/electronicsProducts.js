export const electronicsProducts = [
  {
    title: "Apple iPhone 15 Pro Max 256GB",
    brand: "Apple",
    subCategory: "Smartphones",
    description: "The iPhone 15 Pro Max features a strong and light aerospace-grade titanium design with textured matte-glass back. Powered by the groundbreaking A17 Pro chip, next-generation portraits with Focus and Depth Control, and a 5x Telephoto camera.",
    price: 159900,
    offerPrice: 149900,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
    ],
    specifications: [
      { key: "Display", value: "6.7-inch Super Retina XDR OLED ProMotion 120Hz" },
      { key: "Processor", value: "A17 Pro chip with 6-core GPU" },
      { key: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto" },
      { key: "Battery Life", value: "Up to 29 hours video playback" },
      { key: "Build Material", value: "Titanium frame with Ceramic Shield front" },
      { key: "Connectivity", value: "5G, Wi-Fi 6E, USB-C (USB 3 speeds)" },
    ],
    variants: [
      {
        sku: "IP15PM-256-NAT",
        attributes: [
          { name: "Color", value: "Natural Titanium" },
          { name: "Storage", value: "256GB" },
        ],
        sellingPrice: 149900,
        currentVendorPrice: 138000,
        currentStock: 45,
        weight: 0.221,
      },
    ],
    reviews: [
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "The titanium finish is exceptionally lightweight compared to the 14 Pro Max. Battery easily lasts 1.5 days on heavy use, and the 5x zoom camera is ridiculously sharp.",
      },
      {
        customerName: "Priya Sharma",
        rating: 5,
        comment: "Action button is super convenient for quick mute and camera shortcuts. USB-C makes transferring 4K ProRes videos lightning fast.",
      },
    ],
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G AI Smartphone",
    brand: "Samsung",
    subCategory: "Smartphones",
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Built with Galaxy AI, Note-ready built-in S Pen, and groundbreaking 200MP camera system.",
    price: 134999,
    offerPrice: 129999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800",
    ],
    specifications: [
      { key: "Display", value: "6.8-inch Dynamic AMOLED 2X, QHD+, 120Hz, 2600 nits" },
      { key: "Processor", value: "Snapdragon 8 Gen 3 for Galaxy" },
      { key: "Main Camera", value: "200MP Wide + 50MP Periscope + 12MP Ultra Wide" },
      { key: "S Pen", value: "Embedded Bluetooth S Pen stylus" },
      { key: "Battery", value: "5000 mAh with 45W Fast Charging" },
      { key: "AI Features", value: "Live Translate, Circle to Search, Note Assist" },
    ],
    variants: [
      {
        sku: "SGS24U-512-GRAY",
        attributes: [
          { name: "Color", value: "Titanium Gray" },
          { name: "Storage", value: "512GB" },
          { name: "RAM", value: "12GB" },
        ],
        sellingPrice: 129999,
        currentVendorPrice: 119000,
        currentStock: 38,
        weight: 0.232,
      },
    ],
    reviews: [
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "Circle to Search and Live Call Translation are genuinely useful in day-to-day meetings. Flat display with anti-reflective glass makes viewing outdoors incredible.",
      },
      {
        customerName: "Aarav Mehta",
        rating: 4,
        comment: "Outstanding zoom and low-light photography. S Pen is indispensable for quick signatures and sketching notes.",
      },
    ],
  },
  {
    title: "Dell XPS 15 9530 OLED Creator Laptop",
    brand: "Dell",
    subCategory: "Laptops & Computers",
    description: "The Dell XPS 15 balances power and mobility. Featuring a stunning 3.5K OLED InfinityEdge touch display, 13th Gen Intel Core i9 processor, NVIDIA GeForce RTX 4070 graphics, and machined CNC aluminum chassis.",
    price: 249990,
    offerPrice: 229990,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
    ],
    specifications: [
      { key: "Processor", value: "13th Gen Intel Core i9-13900H (14 cores, up to 5.4 GHz)" },
      { key: "Display", value: '15.6" 3.5K (3456x2160) OLED InfinityEdge Touch 400 nits' },
      { key: "Graphics", value: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
      { key: "Memory", value: "32GB DDR5 4800MHz" },
      { key: "Storage", value: "1TB M.2 PCIe NVMe SSD" },
      { key: "Audio", value: "Quad-speaker design with Waves Nx 3D audio" },
    ],
    variants: [
      {
        sku: "DELL-XPS15-I9-OLED",
        attributes: [
          { name: "Color", value: "Platinum Silver / Black Carbon Fiber" },
          { name: "RAM", value: "32GB" },
          { name: "Storage", value: "1TB" },
        ],
        sellingPrice: 229990,
        currentVendorPrice: 210000,
        currentStock: 18,
        weight: 1.92,
      },
    ],
    reviews: [
      {
        customerName: "Karthik Menon",
        rating: 5,
        comment: "The 3.5K OLED panel has 100% DCI-P3 coverage, perfect for color grading DaVinci Resolve timelines. Renders 4K exports without breaking a sweat.",
      },
      {
        customerName: "David Wilson",
        rating: 4,
        comment: "Carbon fiber palm rest feels premium and stays cool. Battery life is decent around 7 hours on standard productivity workloads.",
      },
    ],
  },
  {
    title: "Bose QuietComfort Ultra Wireless Headphones",
    brand: "Bose",
    subCategory: "Headphones & Audio",
    description: "World-class active noise cancellation with breakthrough Bose Immersive Audio that takes what you're hearing out of your head and places it in front of you. CustomTune technology personalizes the noise cancellation and sound performance.",
    price: 35900,
    offerPrice: 32900,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    ],
    specifications: [
      { key: "Noise Cancellation", value: "Bose CustomTune Active Noise Cancelling" },
      { key: "Spatial Audio", value: "Bose Immersive Audio with Still & Motion modes" },
      { key: "Battery Life", value: "Up to 24 hours (up to 18 hours with Immersive Audio)" },
      { key: "Microphones", value: "12-microphone array for wind-free crystal clear calls" },
      { key: "Connectivity", value: "Bluetooth 5.3, Multipoint pairing, Snapdragon Sound" },
    ],
    variants: [
      {
        sku: "BOSE-QC-ULTRA-BLK",
        attributes: [
          { name: "Color", value: "Black" },
        ],
        sellingPrice: 32900,
        currentVendorPrice: 28500,
        currentStock: 60,
        weight: 0.25,
      },
    ],
    reviews: [
      {
        customerName: "Sneha Patel",
        rating: 5,
        comment: "Immersive Audio creates an actual concert hall sensation. The ear cups are memory foam clouds—wore them on an 8-hour flight with zero fatigue.",
      },
      {
        customerName: "Emily Watson",
        rating: 5,
        comment: "ANC blocks out metro rumblings and office chatter completely. Voice clarity on Zoom calls is crisp.",
      },
    ],
  },
  {
    title: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium",
    brand: "Apple",
    subCategory: "Smart Watches",
    description: "The most rugged and capable Apple Watch. Engineered for outdoor endurance, ocean sports, and elite fitness training. Features 3,000 nits Always-On Retina display, S9 SiP chip, Double Tap gesture, and precision dual-frequency GPS.",
    price: 89900,
    offerPrice: 84900,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    ],
    specifications: [
      { key: "Case Size", value: "49mm Aerospace-grade Titanium" },
      { key: "Display", value: "3000 nits Always-On Retina sapphire crystal display" },
      { key: "Water Resistance", value: "100m water resistant, certified EN13319 dive computer to 40m" },
      { key: "Battery", value: "Up to 36 hours normal use (up to 72 hours in Low Power Mode)" },
      { key: "Sensors", value: "Depth gauge, water temperature sensor, ECG, Blood Oxygen" },
      { key: "Siren", value: "86-decibel sound siren audible up to 180 meters" },
    ],
    variants: [
      {
        sku: "AW-ULTRA2-49-ORNG",
        attributes: [
          { name: "Case", value: "Natural Titanium" },
          { name: "Band", value: "Orange Ocean Band" },
        ],
        sellingPrice: 84900,
        currentVendorPrice: 77000,
        currentStock: 30,
        weight: 0.061,
      },
    ],
    reviews: [
      {
        customerName: "Mohammed Al-Fassi",
        rating: 5,
        comment: "Battery easily hits 3 full days of tracking hikes with GPS and sleep tracking enabled. The screen is remarkably readable even under blinding direct sun.",
      },
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "Double tap gesture is fantastic when your hands are full. Precision dual-frequency GPS mapped my marathon route with pinpoint accuracy.",
      },
    ],
  },
  {
    title: "Sony Alpha 7 IV Full-Frame Hybrid Mirrorless Camera",
    brand: "Sony",
    subCategory: "Cameras & Photography",
    description: "The visionary hybrid full-frame camera. With a 33MP Exmor R back-illuminated CMOS sensor, BIONZ XR processing engine, 4K 60p 10-bit 4:2:2 movie recording, and real-time Eye AF for humans, animals, and birds.",
    price: 219990,
    offerPrice: 204990,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
    ],
    specifications: [
      { key: "Sensor", value: "33.0 Megapixel 35mm Full-Frame Back-Illuminated Exmor R CMOS" },
      { key: "Processor", value: "BIONZ XR image processor with 8x higher processing speed" },
      { key: "Video", value: "4K 60p 10-bit 4:2:2 recording, S-Cinetone color profile" },
      { key: "Autofocus", value: "759 phase-detection AF points with Real-Time Eye AF" },
      { key: "Stabilization", value: "5.5-step 5-axis in-body optical image stabilization" },
      { key: "Viewfinder", value: "3.68 million dot Quad-VGA OLED electronic viewfinder" },
    ],
    variants: [
      {
        sku: "SONY-A7IV-BODY",
        attributes: [
          { name: "Package", value: "Body Only" },
          { name: "Color", value: "Black" },
        ],
        sellingPrice: 204990,
        currentVendorPrice: 188000,
        currentStock: 15,
        weight: 0.658,
      },
    ],
    reviews: [
      {
        customerName: "Sunita Rao",
        rating: 5,
        comment: "Real-time eye autofocus is virtually flawless. The dynamic range in low-light wedding photography saved countless tricky reception shots.",
      },
      {
        customerName: "David Wilson",
        rating: 5,
        comment: "S-Cinetone profile matches seamlessly with FX3 cinema line footage. Dual card slots provide peace of mind.",
      },
    ],
  },
  {
    title: "Nintendo Switch OLED Model with White Joy-Con",
    brand: "Nintendo",
    subCategory: "Gaming & Consoles",
    description: "Features a vibrant 7-inch OLED screen with vivid colors and crisp contrast, a wide adjustable tabletop stand, a dock with a wired LAN port, 64GB of internal storage, and enhanced audio in handheld and tabletop modes.",
    price: 34999,
    offerPrice: 31499,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800",
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800",
    ],
    specifications: [
      { key: "Screen", value: "7.0-inch OLED multi-touch capacitive screen (1280x720)" },
      { key: "TV Output", value: "Up to 1080p via HDMI in TV mode" },
      { key: "Storage", value: "64GB internal storage (expandable up to 2TB via MicroSD)" },
      { key: "Dock Ports", value: "2x USB 2.0, HDMI out, Wired LAN port" },
      { key: "Battery Life", value: "Approximately 4.5 to 9 hours depending on title" },
    ],
    variants: [
      {
        sku: "NINT-SW-OLED-WHT",
        attributes: [
          { name: "Edition", value: "White Joy-Con" },
        ],
        sellingPrice: 31499,
        currentVendorPrice: 28000,
        currentStock: 40,
        weight: 0.42,
      },
    ],
    reviews: [
      {
        customerName: "Ananya Iyer",
        rating: 5,
        comment: "The OLED screen is an absolute night-and-day difference from the original Switch. Deep blacks and vibrant saturation make Zelda look cinematic.",
      },
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "Tabletop kickstand is wide, metallic, and locks securely at any viewing angle. Perfect for gaming on flights.",
      },
    ],
  },
  {
    title: "Apple iPad Pro 11-inch M4 Ultra Retina XDR OLED",
    brand: "Apple",
    subCategory: "Tablets",
    description: "The groundbreaking iPad Pro is impossibly thin, featuring world-leading Ultra Retina XDR tandem OLED display technology and outrageously powerful Apple M4 performance with hardware-accelerated ray tracing.",
    price: 99900,
    offerPrice: 94900,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
    ],
    specifications: [
      { key: "Display", value: "11-inch Tandem OLED Ultra Retina XDR (1600 nits peak HDR)" },
      { key: "Processor", value: "Apple M4 chip with 16-core Neural Engine" },
      { key: "Camera", value: "12MP Wide rear camera with LiDAR scanner, Landscape 12MP Center Stage" },
      { key: "Thickness", value: "Incredibly slim 5.3mm profile" },
      { key: "Accessories", value: "Supports Apple Pencil Pro & Magic Keyboard" },
      { key: "Ports", value: "Thunderbolt 4 / USB 4" },
    ],
    variants: [
      {
        sku: "IPAD-PRO-11-M4-256",
        attributes: [
          { name: "Color", value: "Space Black" },
          { name: "Storage", value: "256GB" },
          { name: "Connectivity", value: "Wi-Fi 6E" },
        ],
        sellingPrice: 94900,
        currentVendorPrice: 87000,
        currentStock: 25,
        weight: 0.444,
      },
    ],
    reviews: [
      {
        customerName: "Sophia Carter",
        rating: 5,
        comment: "The tandem OLED panel is pure sorcery—true blacks with retina-searing specular highlights. Apple Pencil Pro squeeze gesture makes illustration so intuitive.",
      },
      {
        customerName: "Priya Sharma",
        rating: 5,
        comment: "Crazy how thin and light this tablet is while packing desktop-grade M4 horsepower. Exports 4K Final Cut timelines instantaneously.",
      },
    ],
  },
  {
    title: "Philips Hue White and Color Ambiance Smart Starter Kit",
    brand: "Philips Hue",
    subCategory: "Smart Home",
    description: "Transform your home with 16 million colors and shades of warm-to-cool white light. Includes 3 smart LED bulbs, Hue Bridge, and smart dimmer switch. Works seamlessly with Apple HomeKit, Alexa, and Google Assistant.",
    price: 15499,
    offerPrice: 13999,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1558089687-e5c0c58d7c49?w=800",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
    ],
    specifications: [
      { key: "Color Palette", value: "16 million colors + 50,000 shades of warm-to-cool white" },
      { key: "Brightness", value: "1100 lumens per bulb (75W equivalent)" },
      { key: "Protocol", value: "Zigbee + Matter & Bluetooth compatible" },
      { key: "Kit Includes", value: "3x E27 Color Bulbs, 1x Hue Bridge, 1x Smart Dimmer Switch" },
      { key: "Integration", value: "Apple Home, Google Assistant, Amazon Alexa, Spotify sync" },
    ],
    variants: [
      {
        sku: "PHIL-HUE-KIT-3B",
        attributes: [
          { name: "Socket", value: "E27 / B22" },
          { name: "Lumens", value: "1100 lm" },
        ],
        sellingPrice: 13999,
        currentVendorPrice: 12000,
        currentStock: 50,
        weight: 0.85,
      },
    ],
    reviews: [
      {
        customerName: "Aarav Mehta",
        rating: 5,
        comment: "Syncing the bulbs with movies and Spotify playlists creates an incredible home theater atmosphere. Bridge connection is rock solid without WiFi dropouts.",
      },
      {
        customerName: "Karthik Menon",
        rating: 4,
        comment: "Automated sunrise wake-up lighting is gentle and natural. Dimmer switch magnetic backplate adheres anywhere on the wall.",
      },
    ],
  },
  {
    title: "LG C3 65-inch 4K OLED evo Smart TV",
    brand: "LG",
    subCategory: "TV & Video",
    description: "Engineered with self-lit OLED pixels boosted by Brightness Booster and the α9 AI Processor Gen6. Delivers infinite contrast, 100% color fidelity, Dolby Vision, Dolby Atmos, and 0.1ms response time with 4x HDMI 2.1 ports for console and PC gaming.",
    price: 219990,
    offerPrice: 189990,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800",
    ],
    specifications: [
      { key: "Panel Type", value: "4K OLED evo with Brightness Booster" },
      { key: "Resolution", value: "3840 x 2160 (120Hz Native Refresh Rate)" },
      { key: "Processor", value: "α9 AI Processor Gen6 with AI Super Upscaling" },
      { key: "HDR Support", value: "Dolby Vision, HDR10, HLG, Filmmaker Mode" },
      { key: "Gaming", value: "G-Sync, FreeSync Premium, VRR, ALLM, 4x HDMI 2.1" },
      { key: "Audio", value: "40W 2.2 Channel with Dolby Atmos & AI Sound Pro 9.1.2" },
    ],
    variants: [
      {
        sku: "LG-OLED65C3-4K",
        attributes: [
          { name: "Screen Size", value: '65"' },
          { name: "Series", value: "C3 evo" },
        ],
        sellingPrice: 189990,
        currentVendorPrice: 172000,
        currentStock: 12,
        weight: 18.5,
      },
    ],
    reviews: [
      {
        customerName: "Vikram Nair",
        rating: 5,
        comment: "Black levels are absolute pitch black—zero backlight bleed or halo effect. PS5 gaming in 4K 120Hz with VRR is buttery smooth.",
      },
      {
        customerName: "Mohammed Al-Fassi",
        rating: 5,
        comment: "WebOS 23 is quick and responsive. The thin bezel and minimalist stand look like high-end modern art in our living room.",
      },
    ],
  },
  {
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    brand: "Logitech",
    subCategory: "Computer Accessories",
    description: "An icon remastered. Feel every moment of your workflow with even more precision and tactile feedback thanks to Quiet Clicks and an 8,000 DPI track-on-glass optical sensor. Equipped with the MagSpeed Electromagnetic scroll wheel.",
    price: 10995,
    offerPrice: 9495,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    ],
    specifications: [
      { key: "Sensor", value: "Darkfield high precision 8,000 DPI (tracks on glass min 4mm)" },
      { key: "Buttons", value: "7 buttons (Left/Right, Back/Forward, App-Switch, Wheel mode, Middle)" },
      { key: "Scroll Wheel", value: "MagSpeed electromagnetic scroll wheel with Smartshift" },
      { key: "Quiet Clicks", value: "90% noise reduction click feel" },
      { key: "Battery Life", value: "Up to 70 days on a full charge (3 hours use from 1-min quick charge)" },
      { key: "Connectivity", value: "Bluetooth Low Energy + Logi Bolt USB Receiver" },
    ],
    variants: [
      {
        sku: "LOGI-MXM3S-GRAP",
        attributes: [
          { name: "Color", value: "Graphite" },
        ],
        sellingPrice: 9495,
        currentVendorPrice: 7900,
        currentStock: 80,
        weight: 0.141,
      },
    ],
    reviews: [
      {
        customerName: "Rohan Deshmukh",
        rating: 5,
        comment: "MagSpeed free-spinning scroll wheel changes how you work through 10,000-row Excel spreadsheets. Quiet clicks keep zoom calls silent.",
      },
      {
        customerName: "Ananya Iyer",
        rating: 5,
        comment: "Thumb scroll wheel is perfect for horizontal video editing timelines in Premiere Pro. Ergonomic palm contour eliminated my wrist cramps.",
      },
    ],
  },
  {
    title: "Marshall Stanmore III Bluetooth Home Speaker",
    brand: "Marshall",
    subCategory: "Audio & Speakers",
    description: "Stanmore III takes the legendary Marshall rock-and-roll legacy into the home with re-engineered wider soundstage, dynamic loudness, analog brass knobs, and Bluetooth 5.2 connectivity alongside 3.5mm and RCA inputs.",
    price: 36999,
    offerPrice: 32999,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
    ],
    specifications: [
      { key: "Power Amplifiers", value: "One 50W Class D for woofer + Two 15W Class D for tweeters" },
      { key: "Frequency Range", value: "45–20,000 Hz" },
      { key: "Maximum Sound Pressure", value: "97 dB @ 1 m" },
      { key: "Controls", value: "Brass rotary knobs for Volume, Bass, and Treble" },
      { key: "Inputs", value: "Bluetooth 5.2, 3.5 mm Aux input, RCA input" },
      { key: "Build", value: "PVC-free textured vinyl cabinet with brass script logo" },
    ],
    variants: [
      {
        sku: "MARSH-STAN3-BLK",
        attributes: [
          { name: "Color", value: "Black & Brass" },
        ],
        sellingPrice: 32999,
        currentVendorPrice: 28500,
        currentStock: 25,
        weight: 4.25,
      },
    ],
    reviews: [
      {
        customerName: "Emily Watson",
        rating: 5,
        comment: "Punchy, room-filling analog sound with warmth that digital soundbars can't replicate. The brass dials make tactile tuning pure joy.",
      },
      {
        customerName: "Aarav Mehta",
        rating: 5,
        comment: "Connected our vinyl turntable via the RCA input in the living room. Looks gorgeous on the credenza and fills the entire floor with deep bass.",
      },
    ],
  },
  {
    title: "Anker 737 Power Bank PowerCore 24K 140W Ultra-Fast Charger",
    brand: "Anker",
    subCategory: "Power Banks & Storage",
    description: "Equipped with the latest Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge for MacBook Pro 16\", laptops, phones, and tablets. Features a smart digital display.",
    price: 13999,
    offerPrice: 11999,
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
    ],
    specifications: [
      { key: "Battery Capacity", value: "24,000 mAh (86.4Wh airline-safe)" },
      { key: "Max Output", value: "140W single port via USB-C Power Delivery 3.1" },
      { key: "Ports", value: "2x USB-C (140W bi-directional) + 1x USB-A (18W)" },
      { key: "Display", value: "Smart color digital display showing input/output wattage and battery health" },
      { key: "Safety", value: "ActiveShield 2.0 temperature monitoring 3 million times per day" },
    ],
    variants: [
      {
        sku: "ANKER-737-140W",
        attributes: [
          { name: "Capacity", value: "24,000mAh" },
          { name: "Color", value: "Black / Space Gray" },
        ],
        sellingPrice: 11999,
        currentVendorPrice: 10200,
        currentStock: 50,
        weight: 0.63,
      },
    ],
    reviews: [
      {
        customerName: "David Wilson",
        rating: 5,
        comment: "Charges my 16-inch M3 MacBook Pro at full 140W speed! The live wattage display telling you estimated time remaining is so satisfying.",
      },
      {
        customerName: "Sneha Patel",
        rating: 5,
        comment: "Airline compliant and charges my iPhone 15 Pro five times over on long weekend trips. Excellent build quality.",
      },
    ],
  },
];
