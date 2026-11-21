const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./src/app");
const { ensureAuthIndexes } = require("./src/config/authIndexes");

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
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
