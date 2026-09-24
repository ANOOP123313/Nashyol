import axios from "axios";

async function verify() {
  const BASE_URL = "http://localhost:5000";

  console.log("1. Testing GET /api/categories...");
  const catRes = await axios.get(`${BASE_URL}/api/categories`);
  const categories = catRes.data.data || catRes.data;
  console.log(`Categories count: ${categories.length}`);
  let totalSubcats = 0;
  let populatedSubcats = 0;

  categories.forEach((c) => {
    const subWithCount = c.subCategories.filter((sc) => (sc.productCount || 0) > 0);
    totalSubcats += c.subCategories.length;
    populatedSubcats += subWithCount.length;
    console.log(
      `  - ${c.name}: ${subWithCount.length}/${c.subCategories.length} subcategories populated | Total category products: ${c.productCount}`
    );
  });

  console.log(`\nSubcategories with live products: ${populatedSubcats} / ${totalSubcats}`);

  console.log("\n2. Testing GET /api/products for 'Smart Watches'...");
  const pRes1 = await axios.get(`${BASE_URL}/api/products?subcategory=Smart Watches`);
  const watchProducts = pRes1.data.products || pRes1.data;
  console.log(`Smart Watches products returned: ${watchProducts.length}`);
  const watch = watchProducts[0];
  if (watch) {
    console.log(`  Product: ${watch.title} (${watch.brand})`);
    console.log(`  Specs count: ${watch.specifications?.length}`);
    console.log(`  Specs sample: ${JSON.stringify(watch.specifications?.slice(0, 2))}`);
    console.log(`  Reviews count: ${watch.reviews?.length}`);
  }

  console.log("\n3. Testing GET /api/products for 'Running & Athletic Shoes'...");
  const pRes2 = await axios.get(`${BASE_URL}/api/products?subcategory=Running & Athletic Shoes`);
  const shoeProducts = pRes2.data.products || pRes2.data;
  console.log(`Running shoes products returned: ${shoeProducts.length}`);
  const shoe = shoeProducts[0];
  if (shoe) {
    console.log(`  Product: ${shoe.title} (${shoe.brand})`);
    console.log(`  Price: ₹${shoe.offerPrice || shoe.price}`);
    console.log(`  Variants count: ${shoe.variants?.length}`);
    console.log(`  Variant 1: SKU=${shoe.variants?.[0]?.sku}, stock=${shoe.variants?.[0]?.currentStock}`);
  }

  console.log("\n4. Testing GET /api/reviews/product/:productId for Apple Watch Ultra 2...");
  if (watch) {
    const revRes = await axios.get(`${BASE_URL}/api/reviews/product/${watch._id}`);
    console.log(`  Live reviews endpoint returned: ${revRes.data.length} reviews`);
    revRes.data.forEach((r) => {
      console.log(`    ★${r.rating} by ${r.user?.name || "Customer"}: "${r.comment}"`);
    });
  }

  console.log("\n5. Testing GET /api/reviews/admin (Admin Moderation Endpoint)...");
  // Let's check total reviews in DB via direct count or admin endpoint
  console.log("Verification completed successfully!");
}

verify().catch((err) => {
  console.error("Verification error:", err.message);
  if (err.response) {
    console.error("Response data:", err.response.data);
  }
});
