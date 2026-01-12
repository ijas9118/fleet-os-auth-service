import "reflect-metadata";

import createApp from "./app";
import connectDB from "./config/database";
import { connectProducer, disconnectProducer } from "./config/kafka";
import logger from "./config/logger";
import env from "./config/validate-env";

const app = createApp();

const PORT = env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    await connectProducer();

    app.listen(PORT, () => {
      logger.info(`Auth Server started on port ${PORT}`);
    });
  }
  catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await disconnectProducer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await disconnectProducer();
  process.exit(0);
});
