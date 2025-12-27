import type { Application, NextFunction, Request, Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import routes from "@/routes";

import logger from "./config/logger";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.middleware";

export default function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  app.get("/healthz", (_req: Request, res: Response) => {
    res.status(STATUS_CODES.OK).json({ status: "ok" });
  });

  app.use("/api/v1", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
