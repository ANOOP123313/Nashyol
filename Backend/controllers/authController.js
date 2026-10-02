import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import Referral from "../models/Referral.js";
import { sendNotification } from "./notificationController.js";
import { body, validationResult } from "express-validator";
import { generateToken } from "../utils/generateToken.js";

export const register = asyncHandler(async (req, res) => {

  await Promise.all([
    body("name").trim().notEmpty().withMessage("Name is required").run(req),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required").run(req),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, referralCode } = req.body;

  const exists = await User.findOne({ email });

  if (exists) {
    return res.status(400).json({ message: "Email already registered" });
  }

  let referredBy = null;
  let referrerUser = null;
  if (referralCode && referralCode.trim()) {
    const cleanCode = referralCode.trim();
    referrerUser = await User.findOne({
      $or: [
        { referralCode: cleanCode.toUpperCase() },
        { referralCode: cleanCode.toLowerCase() },
        { referralCode: { $regex: new RegExp(`^${cleanCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
      ]
    });
    if (referrerUser) {
      referredBy = referrerUser._id;
    }
  }

  const hexCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  const user = await User.create({
    name,
    email,
    password,
    role: "user",
    referralCode: hexCode,
    referredBy,
  });

  if (referrerUser && referrerUser._id.toString() !== user._id.toString()) {
    const rewardPoints = 100;
    referrerUser.referralCount = (referrerUser.referralCount || 0) + 1;
    referrerUser.referralPoints = (referrerUser.referralPoints || 0) + rewardPoints;
    referrerUser.walletBalance = (referrerUser.walletBalance || 0) + rewardPoints;
    await referrerUser.save();

    try {
      await Referral.findOneAndUpdate(
        { referredUser: user._id },
        {
          referrer: referrerUser._id,
          referredUser: user._id,
          rewardGranted: true,
          rewardAmount: rewardPoints,
        },
        { upsert: true, new: true }
      );
    } catch (refErr) {
      console.error("Error creating referral record:", refErr);
    }

    await sendNotification(
      referrerUser._id,
      "Referral Reward!",
      `Congratulations! ${user.name} registered using your referral code. You earned ${rewardPoints} referral points!`,
      "referral"
    );
  }

  const token = generateToken(user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    role: user.role,
    referralCode: user.referralCode,
    referralPoints: user.referralPoints || 0,
    referralCount: user.referralCount || 0,
    token,
  });

});


export const login = asyncHandler(async (req, res) => {

  await Promise.all([
    body("email").isEmail().normalizeEmail().run(req),
    body("password").notEmpty().run(req),
  ]);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: "Account blocked" });
  }

  const bcrypt = await import("bcryptjs");

  const match = await bcrypt.default.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.referralCode) {
    user.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    await user.save();
  }

  const token = generateToken(user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    avatar: user.avatar || "",
    role: user.role,
    referralCode: user.referralCode,
    referralPoints: user.referralPoints || user.walletBalance || 0,
    referralCount: user.referralCount || 0,
    token,
  });

});


export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, email, phone, avatar } = req.body;

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    req.user.name = name.trim();
  }

  if (email !== undefined && email.trim()) {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== req.user.email) {
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      req.user.email = normalizedEmail;
    }
  }

  if (phone !== undefined && phone.trim()) {
    req.user.phone = phone.trim();
  }

  if (avatar !== undefined) {
    req.user.avatar = avatar;
  }

  await req.user.save();

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    avatar: req.user.avatar || "",
    role: req.user.role,
    referralCode: req.user.referralCode,
    walletBalance: req.user.walletBalance,
  });
});