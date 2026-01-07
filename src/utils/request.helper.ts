import type { Request } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";

import { HttpError } from "./http-error-class";

/**
 * Helper class for extracting and validating data from HTTP requests
 */
export class RequestHelper {
  /**
   * Extract and validate refresh token from cookies
   * @throws HttpError if refresh token is missing
   */
  static extractRefreshToken(req: Request): string {
    if (!req.cookies) {
      throw new HttpError("No cookies found", STATUS_CODES.FORBIDDEN);
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new HttpError("No refresh token found", STATUS_CODES.FORBIDDEN);
    }

    return refreshToken;
  }

  /**
   * Parse and validate pagination parameters from query string
   */
  static parsePaginationParams(query: {
    page?: string;
    limit?: string;
    search?: string;
  }): {
    page: number;
    limit: number;
    search?: string;
  } {
    const page = Number.parseInt(query.page || "1") || 1;
    const limit = Number.parseInt(query.limit || "10") || 10;
    const search = query.search;

    return { page, limit, search };
  }
}
