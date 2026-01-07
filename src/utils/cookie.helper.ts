import type { Response } from "express";

import env from "@/config/validate-env";

/**
 * Cookie configuration constants
 */
export const COOKIE_CONFIG = {
  REFRESH_TOKEN_NAME: "refreshToken",
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
} as const;

/**
 * Helper class for managing HTTP cookies
 */
export class CookieHelper {
  /**
   * Set refresh token cookie with proper security configuration
   */
  static setRefreshTokenCookie(res: Response, token: string): void {
    res.cookie(COOKIE_CONFIG.REFRESH_TOKEN_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_CONFIG.MAX_AGE,
    });
  }

  /**
   * Clear refresh token cookie
   */
  static clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(COOKIE_CONFIG.REFRESH_TOKEN_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
}
