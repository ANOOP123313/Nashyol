import express from "express";
import multer from "multer";
import { uploadImage, serveFile } from "../controllers/uploadController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);
router.get("/file/:filename", serveFile);

export default router;
