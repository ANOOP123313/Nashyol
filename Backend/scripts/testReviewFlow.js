import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

async function testFlow() {
  await mongoose.connect(process.env.MONGODB_URI);

  const sophia = await User.findOne({ email: "user@naashyol.com" });
  console.log("Sophia:", sophia?.name, sophia?._id);

  // Find an order by Sophia
  const sophiaOrder = await Order.findOne({ user: sophia._id });
  const orderedProductId = sophiaOrder?.items?.[0]?.productId;
  const orderedProduct = await Product.findById(orderedProductId);

  // Find a product NOT ordered by Sophia
  const notOrderedProduct = await Product.findOne({ _id: { $ne: orderedProductId } });

  console.log("Ordered product:", orderedProduct?.title, orderedProduct?._id);
  console.log("Not ordered product:", notOrderedProduct?.title, notOrderedProduct?._id);

  // Login as Sophia
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "user@naashyol.com", password: "password123" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("Sophia logged in:", !!token);

  // 1. Check can-review for not ordered product
  const canReviewNotOrdered = await fetch(`http://localhost:5000/api/reviews/can-review/${notOrderedProduct._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());
  console.log("Can Sophia review not ordered product?:", canReviewNotOrdered);

  // 2. Try to post review for not ordered product (expect 403)
  const failRes = await fetch("http://localhost:5000/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: notOrderedProduct._id,
      rating: 5,
      comment: "Should fail with 403",
    }),
  });
  console.log("Post review for not ordered product (Status):", failRes.status);
  const failData = await failRes.json();
  console.log("Post review error message:", failData.message);

  // 3. Check can-review for ordered product
  const canReviewOrdered = await fetch(`http://localhost:5000/api/reviews/can-review/${orderedProduct._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());
  console.log("Can Sophia review ordered product?:", canReviewOrdered);

  // 4. Test admin reviews endpoint
  const adminRes = await fetch("http://localhost:5000/api/reviews/admin", {
    headers: { Origin: "http://localhost:5173" },
  });
  console.log("Admin reviews status:", adminRes.status);
  const adminData = await adminRes.json();
  console.log("Admin reviews count:", adminData.length);
  if (adminData.length > 0) {
    console.log("Sample admin review:", {
      id: adminData[0]._id,
      user: adminData[0].user?.name,
      product: adminData[0].product?.title,
      rating: adminData[0].rating,
      comment: adminData[0].comment,
      status: adminData[0].status,
    });
  }

  await mongoose.disconnect();
}

testFlow().catch(console.error);
