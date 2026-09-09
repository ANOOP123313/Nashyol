import express from "express";
import {
  registerVendor,
  getMyVendorProfile,
  updateMyVendorProfile,
  getAllApprovedVendors,
  getVendorById,
  adminGetAllVendors,
  adminUpdateApprovalStatus,
  adminDeleteVendor,
  adminUpdateRevenue,
  adminCreateVendor,
} from "../controllers/vendorController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────
//  PUBLIC / ADMIN ROUTES
// ─────────────────────────────────────────
router.get("/", getAllApprovedVendors);           // GET  /api/vendor
router.post("/", adminCreateVendor);              // POST /api/vendor
router.get("/:id", getVendorById);                // GET  /api/vendor/:id
router.put("/:id/status", adminUpdateApprovalStatus); // PUT /api/vendor/:id/status
router.delete("/:id", adminDeleteVendor);         // DELETE /api/vendor/:id

// ─────────────────────────────────────────
//  VENDOR (logged-in) ROUTES
// ─────────────────────────────────────────
router.post("/register", protect, registerVendor);              // POST   /api/vendor/register
router.get("/my-profile", protect, getMyVendorProfile);         // GET    /api/vendor/my-profile
router.put("/my-profile", protect, updateMyVendorProfile);      // PUT    /api/vendor/my-profile

// ─────────────────────────────────────────
//  ADMIN ROUTES
// ─────────────────────────────────────────
router.get("/admin/all", adminGetAllVendors);
router.patch("/admin/:id/approval", adminUpdateApprovalStatus);
router.patch("/admin/:id/revenue", adminUpdateRevenue);
router.delete("/admin/:id", adminDeleteVendor);

export default router;