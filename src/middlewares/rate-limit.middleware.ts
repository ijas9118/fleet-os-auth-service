import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";
import rateLimit from "express-rate-limit";

import { MESSAGES } from "@/config/messages.constant";

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
