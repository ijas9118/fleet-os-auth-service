import "reflect-metadata";

import createApp from "./app";
import connectDB from "./config/database";
import logger from "./config/logger";
import env from "./config/validate-env";

const app = createApp();

const PORT = env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Auth Server started on port ${PORT}`);
    });
  }
  catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
})();
