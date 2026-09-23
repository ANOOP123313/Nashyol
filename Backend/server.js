import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (_) {}

import { execSync } from "child_process";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI.includes("/nashyol")
  ? process.env.MONGODB_URI
  : `${process.env.MONGODB_URI.replace(/\/+$/, "")}/nashyol?retryWrites=true&w=majority`;

function freePort(port) {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = output.split("\n").filter(line => line.includes(`:${port}`) && line.includes("LISTENING"));
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0" && pid !== String(process.pid)) {
          pids.add(pid);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`⚠️ Terminated stale process (PID: ${pid}) holding port ${port}`);
        } catch (_) {}
      }
    } else {
      try {
        execSync(`fuser -k ${port}/tcp`);
      } catch (_) {
        try {
          execSync(`lsof -t -i:${port} | xargs kill -9 2>/dev/null || true`);
        } catch (_) {}
      }
    }
  } catch (_) {}
}

async function startServer() {
  try {
    freePort(PORT);
    await mongoose.connect(mongoUri, { dbName: "nashyol" });
    console.log("✅ MongoDB Connected to database:", mongoose.connection.name);
    console.log("✅ URI used:", mongoUri);
    const count = await Category.countDocuments();
    console.log("✅ Categories count on startup:", count);

    const listenWithRetry = (retries = 3) => {
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT} [Ready]`);
      });

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && retries > 0) {
          console.warn(`⚠️ Port ${PORT} busy. Retrying in 1s (${retries} retries left)...`);
          freePort(PORT);
          setTimeout(() => {
            try { server.close(); } catch (_) {}
            listenWithRetry(retries - 1);
          }, 1000);
        } else {
          console.error("Server error:", err);
        }
      });
    };

    listenWithRetry();
  } catch (err) {
    console.error("❌ DB Connection Failed", err);
  }
}

startServer();