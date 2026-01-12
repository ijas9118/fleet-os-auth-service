import type { NextFunction, Request, Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";

import env from "@/config/validate-env";
import { HttpError } from "@/utils/http-error-class";

export function internalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-internal-api-key"];

  // Use a default key for dev if not set, or fail secure in valid envs
  // In a real scenario, this MUST be set in .env
  const validApiKey = env.INTERNAL_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    throw new HttpError("Unauthorized: Invalid Internal API Key", STATUS_CODES.UNAUTHORIZED);
  }

  next();
}
