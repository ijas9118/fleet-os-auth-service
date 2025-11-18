import type { NextFunction, Request, Response } from "express";

import type { Role } from "@/config/constants/roles.constant";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  const userEmail = req.headers["x-user-email"];
  const userRole = req.headers["x-user-role"];

  if (!userId || !userEmail || !userRole) {
    return res.status(401).json({ message: "Unauthorized: Missing auth headers" });
  }

  req.user = {
    id: userId as string,
    role: userRole as Role,
    email: userEmail as string,
  };

  next();
}
