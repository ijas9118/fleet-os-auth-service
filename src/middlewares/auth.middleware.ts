import type { NextFunction, Request, Response } from "express";

import { STATUS_CODES, UserRole } from "@ahammedijas/fleet-os-shared";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];
  const userRole = req.headers["x-user-role"];
  const tenantId = req.headers["x-tenant-id"];

  if (!userId || !userEmail || !userRole) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Missing auth headers" });
  }

  // Enforce tenantId for non-platform admins
  if (userRole !== UserRole.PLATFORM_ADMIN && !tenantId) {
    return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Forbidden: Missing proper headers" });
  }

  req.user = {
    id: userId as string,
    role: userRole as UserRole,
    email: userEmail as string,
    tenantId: tenantId as string,
  };

  next();
}
