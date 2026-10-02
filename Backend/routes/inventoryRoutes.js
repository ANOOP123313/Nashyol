import express from "express";
import {
  getInventory,
  getAvailableInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  deleteInventoryItem,
  resetInventoryProductStatus,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.route("/")
  .get(getInventory)
  .post(createInventoryItem);

router.get("/available", getAvailableInventory);

router.post("/:id/reset-status", resetInventoryProductStatus);

router.route("/:id")
  .get(getInventoryItem)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

router.route("/:id/adjust")
  .put(adjustStock)
  .post(adjustStock);

export default router;
