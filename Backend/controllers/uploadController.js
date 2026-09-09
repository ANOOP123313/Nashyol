import fs from "fs";
import path from "path";

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    if (typeof image === "string" && image.startsWith("data:image/")) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === "svg+xml" ? "svg" : matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, "base64");
        const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const uploadDir = path.join(process.cwd(), "uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        const protocol = req.headers["x-forwarded-proto"] || req.protocol;
        const host = req.get("host");
        const url = `${protocol}://${host}/uploads/${filename}`;
        return res.status(200).json({ url, filename });
      }
    }

    return res.status(200).json({ url: image });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Failed to upload image" });
  }
};
