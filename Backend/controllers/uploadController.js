import fs from "fs";
import path from "path";
import { isR2Configured, uploadToR2, getFileFromR2 } from "../services/cloudflareR2Service.js";

export const uploadImage = async (req, res) => {
  try {
    let buffer = null;
    let ext = "png";
    let mimeType = "image/png";
    const { image } = req.body || {};

    if (req.file) {
      buffer = req.file.buffer || fs.readFileSync(req.file.path);
      mimeType = req.file.mimetype || "image/png";
      ext = req.file.originalname?.split(".").pop() || "png";
    } else if (typeof image === "string" && image.startsWith("data:image/")) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        ext = matches[1] === "svg+xml" ? "svg" : matches[1];
        mimeType = matches[1] === "svg+xml" ? "image/svg+xml" : `image/${ext}`;
        buffer = Buffer.from(matches[2], "base64");
      }
    } else if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
      // Already a full URL
      return res.status(200).json({ url: image });
    }

    if (!buffer) {
      return res.status(400).json({ message: "No valid image provided" });
    }

    const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    // Upload to Cloudflare R2 if configured
    if (isR2Configured()) {
      try {
        const url = await uploadToR2(buffer, filename, mimeType);
        return res.status(200).json({ url, filename, storage: "cloudflare_r2" });
      } catch (r2Err) {
        console.error("Cloudflare R2 upload error, falling back to local:", r2Err);
      }
    }

    // Fallback: Local storage
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    const url = `${protocol}://${host}/uploads/${filename}`;

    return res.status(200).json({ url, filename, storage: "local" });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Failed to upload image" });
  }
};

export const serveFile = async (req, res) => {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }

    // 1. Try fetching from Cloudflare R2 first
    if (isR2Configured()) {
      const fileData = await getFileFromR2(filename);
      if (fileData && fileData.Body) {
        if (fileData.ContentType) {
          res.setHeader("Content-Type", fileData.ContentType);
        }
        res.setHeader("Cache-Control", "public, max-age=31536000");
        return fileData.Body.pipe(res);
      }
    }

    // 2. Fallback to local uploads folder
    const localPath = path.join(process.cwd(), "uploads", filename);
    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }

    return res.status(404).json({ message: "File not found" });
  } catch (err) {
    console.error("Error serving file:", err);
    return res.status(500).json({ message: "Failed to serve file" });
  }
};
