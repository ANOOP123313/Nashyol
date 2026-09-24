import express from "express";
import {
  getUsers,
  getCustomers,
  getUserById,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
  createUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "superadmin"));

router.get("/customers", getCustomers);
router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id/block", toggleBlockUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
