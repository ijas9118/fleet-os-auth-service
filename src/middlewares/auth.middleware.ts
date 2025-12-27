import type { NextFunction, Request, Response } from "express";

import { STATUS_CODES, UserRole } from "@ahammedijas/fleet-os-shared";
import jwt from "jsonwebtoken";

import logger from "@/config/logger";

import type { JWTPayload } from "../types";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Missing or invalid authorization token" });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JWTPayload;

  try {
    decoded = jwt.decode(token) as JWTPayload;
  }
  catch (error) {
    logger.error(error);
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Invalid token format" });
  }

  if (!decoded) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Unable to decode token" });
  }

  const userId = decoded.sub;
  const userEmail = decoded.email;
  const userRole = decoded.role;
  const tenantId = decoded.tenantId;

  if (!userId || !userEmail || !userRole) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized: Token missing required fields" });
  }

  // Enforce tenantId for non-platform admins
  if (userRole !== UserRole.PLATFORM_ADMIN && !tenantId) {
    return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Forbidden: Tenant ID missing in token" });
  }

  req.user = {
    id: userId,
    role: userRole,
    email: userEmail,
    tenantId: tenantId as string,
  };

  next();
}
