import type { Role } from "@ahammedijas/fleet-os-shared";
import type { NextFunction, Request, Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";

/**
 * Authentication middleware that extracts user identity from request headers.
 *
 * This middleware expects the following headers to be present:
 * - `x-user-id`: The unique identifier of the authenticated user.
 * - `x-user-email`: The user's email address.
 * - `x-user-role`: The user's role within the system.
 *
 * If any of these headers are missing, the request is rejected with a 401 response.
 * Otherwise, the user information is attached to `req.user` for downstream handlers.
 *
 * ⚠️ Note:
 * This middleware assumes these headers are added by a trusted upstream service
 * (e.g., API Gateway, Auth service). They must *not* come directly from the client.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns A 401 response if headers are missing, otherwise calls `next()`
 */

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];
  const userRole = req.headers["x-user-role"];

  if (!userId || !userEmail || !userRole) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Missing auth headers" });
  }

  req.user = {
    id: userId as string,
    role: userRole as Role,
    email: userEmail as string,
  };

  next();
}
