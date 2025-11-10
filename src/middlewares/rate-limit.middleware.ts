import rateLimit from "express-rate-limit";

import { MESSAGES } from "@/config/constants/messages.constant";
import { STATUS_CODES } from "@/config/constants/status-codes.constant";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (_req, res) => {
    res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({
      message: MESSAGES.ERROR.TOO_MANY_REQUESTS,
      timestamp: new Date().toISOString(),
    });
  },
});

export default limiter;
