import type { NextFunction, Request, Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";

import logger from "@/config/logger";
import { MESSAGES } from "@/config/messages.constant";
import env from "@/config/validate-env";

/**
 * Express middleware to handle unmatched routes (404 Not Found).
 *
 * This middleware should be registered *after* all valid routes.
 * When no route matches the incoming request, it logs a warning and
 * returns a JSON response detailing the missing resource.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused)
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction) {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(STATUS_CODES.NOT_FOUND).json({
    success: false,
    error: {
      message: `Resource not found: ${req.method} ${req.originalUrl}`,
      path: req.originalUrl,
      method: req.method,
    },
  });
}

/**
 * Centralized error-handling middleware for Express.
 *
 * This middleware catches any unhandled errors thrown in the application.
 * It logs the error, determines the correct HTTP status code, and returns
 * a structured JSON error response. In production mode, internal errors (5xx)
 * return a generic message to avoid exposing sensitive details.
 *
 * Expected error object:
 * - `err.message`: Error description
 * - `err.statusCode` (optional): Custom HTTP status code
 *
 * Behavior:
 * - Logs error message, stack trace, and request path
 * - Uses generic message in production for 500+ errors
 * - Returns consistent JSON structure for all error responses
 *
 * @param err - The thrown error
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused)
 */
export function errorHandler(err: Error & { statusCode?: number }, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode ?? STATUS_CODES.INTERNAL_SERVER_ERROR;
  const isProd = env.NODE_ENV === "production";

  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, path: req.originalUrl });

  res.status(statusCode).json({
    success: false,
    error: {
      message: isProd && statusCode >= 500 ? MESSAGES.ERROR.INTERNAL_SERVER_ERROR : err.message,
      path: req.originalUrl,
      method: req.method,
    },
  });
}
