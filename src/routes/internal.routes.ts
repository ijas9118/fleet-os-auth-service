import { Router } from "express";

import type { InternalController } from "@/controllers/internal.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { internalAuthMiddleware } from "@/middlewares/internal-auth.middleware";

const internalRouter = Router();

// Resolve controller from DI container
const internalController = container.get<InternalController>(TYPES.InternalController);

// Apply internal auth middleware to all routes in this router
internalRouter.use(internalAuthMiddleware);

internalRouter.patch(
  "/users/:userId/mark-onboarded",
  internalController.markUserOnboarded.bind(internalController),
);

export default internalRouter;
