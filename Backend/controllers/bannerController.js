import asyncHandler from "express-async-handler";
import Banner from "../models/Banner.js";

// Public: Get active banners
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 });
  res.json(banners);
});

// Admin: Get all banners
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ sortOrder: 1 });
  res.json(banners);
});

// Admin: Create banner
export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, image, link, linkText, sortOrder, isActive } = req.body;
  const banner = await Banner.create({
    title: title || "New Banner",
    subtitle: subtitle || "",
    image: image || "https://placehold.co/1200x400?text=Banner+Image",
    link: link || "/",
    linkText: linkText || "Shop Now",
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    isActive: isActive !== undefined ? isActive : true,
  });
  res.status(201).json(banner);
});

// Admin: Update banner
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  Object.assign(banner, req.body);
  const updated = await banner.save();
  res.json(updated);
});

// Admin: Delete banner
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  await banner.deleteOne();
  res.json({ message: "Banner deleted" });
});
