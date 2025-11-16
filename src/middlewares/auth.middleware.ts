import type { NextFunction, Request, Response } from "express";

import type { Role } from "@/config/constants/roles.constant";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Missing user context" });
  }

  req.user = {
    id: userId as string,
    role: req.headers["x-user-role"] as Role,
    email: req.headers["x-user-email"] as string,
  };

  next();
}
