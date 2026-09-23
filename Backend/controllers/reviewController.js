import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc    Check if current user can review a product
// @route   GET /api/reviews/can-review/:productId
// @access  Private
export const canReviewProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.json({ hasOrdered: false, alreadyReviewed: false, canReview: false });
  }

  // Check if user has ordered this product
  const hasOrdered = await Order.findOne({
    user: req.user._id,
    "items.productId": productId,
  });

  // Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  res.json({
    hasOrdered: !!hasOrdered,
    alreadyReviewed: !!alreadyReviewed,
    canReview: !!hasOrdered && !alreadyReviewed,
  });
});

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment, title, images } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Valid product ID is required");
  }

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating between 1 and 5 stars is required");
  }

  if (!comment || !comment.trim()) {
    res.status(400);
    throw new Error("Review comment cannot be empty");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Validate that user ordered this product
  const hasOrdered = await Order.findOne({
    user: req.user._id,
    "items.productId": productId,
  });

  if (!hasOrdered) {
    res.status(403);
    throw new Error("Please order this product before writing a review");
  }

  // Validate user hasn't already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating: Number(rating),
    title: title?.trim() || comment.trim().slice(0, 35) + "...",
    comment: comment.trim(),
    images: Array.isArray(images) ? images : [],
    isApproved: true,
    status: "approved",
  });

  // Also sync with embedded product.reviews array if applicable
  try {
    product.reviews.push({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });
    await product.save();
  } catch (e) {
    // Non-fatal if schema differs
  }

  const populated = await Review.findById(review._id)
    .populate("user", "name email")
    .populate("product", "title images");

  res.status(201).json(populated);
});

// @desc    Get reviews created by the current user
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "title images")
    .sort("-createdAt");
  res.json(reviews);
});

// @desc    Get all reviews for a product (Approved only)
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
    return res.json([]);
  }

  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: { $ne: false },
    status: { $ne: "disabled" },
  })
    .populate("user", "name email")
    .sort("-createdAt");

  res.json(reviews);
});

// @desc    Get all reviews for admin moderation
// @route   GET /api/reviews/admin
// @access  Private/Admin
export const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("product", "title images")
    .sort("-createdAt");

  res.json(reviews);
});

// @desc    Update review status (Admin only)
// @route   PUT /api/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status, isApproved } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (status) {
    review.status = status;
    review.isApproved = status === "approved";
  } else if (isApproved !== undefined) {
    review.isApproved = Boolean(isApproved);
    review.status = isApproved ? "approved" : "disabled";
  }

  await review.save();

  const populated = await Review.findById(review._id)
    .populate("user", "name email")
    .populate("product", "title images");

  res.json(populated);
});

// @desc    Delete review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  await Review.findByIdAndDelete(req.params.id);

  try {
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: { _id: review._id } },
    });
  } catch (e) {}

  res.json({ message: "Review deleted successfully" });
});
