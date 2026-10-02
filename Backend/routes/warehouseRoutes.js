import express from "express";
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouseController.js";

const router = express.Router();

router.route("/")
  .get(getWarehouses)
  .post(createWarehouse);

router.route("/:id")
  .get(getWarehouseById)
  .put(updateWarehouse)
  .delete(deleteWarehouse);

export default router;
