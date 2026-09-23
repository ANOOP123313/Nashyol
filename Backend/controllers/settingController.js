import asyncHandler from "express-async-handler";
import Setting from "../models/Setting.js";

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  const settingsList = await Setting.find();
  const settingsMap = {};
  settingsList.forEach((s) => {
    settingsMap[s.key] = s.value;
  });
  res.json(settingsMap);
});

// @desc    Update or create settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = req.body; // e.g., { storeName: "Nashyol", taxRate: 5, ... }

  if (typeof settings !== "object" || settings === null) {
    res.status(400);
    throw new Error("Invalid settings payload");
  }

  const updated = {};
  for (const [key, value] of Object.entries(settings)) {
    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    updated[setting.key] = setting.value;
  }

  res.json(updated);
});
