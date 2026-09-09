import express from "express";
import {
  getUsers,
  getUserById,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "superadmin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id/block", toggleBlockUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
