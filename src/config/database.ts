import mongoose from "mongoose";

import logger from "./logger";
import env from "./validate-env";

async function connectDB() {
  try {
    await mongoose.connect(env.DATABASE_URL);
    logger.info("✅ Connected to MongoDB");
  }
  catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

export default connectDB;
