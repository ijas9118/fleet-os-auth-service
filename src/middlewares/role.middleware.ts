import type { Role } from "@ahammedijas/fleet-os-shared";
import type { NextFunction, Request, Response } from "express";

/**
 * Middleware factory that restricts access to specific user roles.
 *
 * @function requireRole
 * @param {...Role} allowedRoles - One or more roles permitted to access the route.
 * @returns A 401 response if headers are missing, otherwise calls `next()`
 * A middleware function that checks the authenticated user's role.
 *
 * @description
 * This middleware assumes that the `req.user` object has already been populated
 * by an authentication middleware (e.g., JWT validation).
 * If the user's role is not included in the `allowedRoles`, a **403 Forbidden**
 * response is returned.
 * Otherwise, the request is passed to the next handler.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
}
