import type { Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";

/**
 * Helper class for standardizing HTTP responses
 */
export class ResponseHelper {
  /**
   * Send a standardized success response
   */
  static success(
    res: Response,
    message: string,
    data?: unknown,
  ): void {
    const response: { message: string; data?: unknown; result?: unknown } = { message };

    if (data !== undefined) {
      // Use 'result' key if data looks like a paginated query result, otherwise use 'data'
      if (typeof data === "object" && data !== null && ("data" in data || "meta" in data)) {
        response.result = data;
      }
      else {
        response.data = data;
      }
    }

    res.status(STATUS_CODES.OK).json(response);
  }

  /**
   * Send a standardized error response
   */
  static error(
    res: Response,
    statusCode: number,
    error: string,
  ): void {
    res.status(statusCode).json({ error });
  }
}
