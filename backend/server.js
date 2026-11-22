const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();

const app = require("./src/app");
const { ensureAuthIndexes } = require("./src/config/authIndexes");
const { createSocketServer } = require("./src/realtime/socketServer");

async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI and JWT_SECRET must be configured in .env");
    }
    if (Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
      throw new Error("JWT_SECRET must be at least 32 bytes");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await ensureAuthIndexes();

    const port = process.env.PORT || 5000;
    const server = http.createServer(app);
    const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_URL || "http://localhost:5173")
      .split(",").map(origin => origin.trim()).filter(Boolean);
    createSocketServer(server, allowedOrigins);
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
