import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodType } from "zod";

import { z } from "zod";

import { MESSAGES } from "@/config/constants/messages.constant";
import { STATUS_CODES } from "@/config/constants/status-codes.constant";

export function validate(schema: ZodType<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    }
    catch (err: any) {
      const error = err as ZodError<any>;
      const treeified = z.treeifyError(error);
      const properties = (treeified as any).properties;
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: MESSAGES.ERROR.BAD_REQUEST,
        errors: properties,
      });
    }
  };
}
