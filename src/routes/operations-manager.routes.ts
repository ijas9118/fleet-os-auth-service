import { UserRole } from "@ahammedijas/fleet-os-shared";
import { Router } from "express";

import type { OperationsManagerController } from "@/controllers/operations-manager.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { ChangeStatusSchema } from "@/dto/change-status.dto";
import { OperationsManagerListQuerySchema } from "@/dto/operations-manager-list.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

const operationsManagerController = container.get<OperationsManagerController>(
  TYPES.OperationsManagerController,
);

router.use(requireAuth);
router.use(requireRole(UserRole.PLATFORM_ADMIN, UserRole.TENANT_ADMIN));

router.get("/", operationsManagerController.listOperationsManagers);

router.post(
  "/block",
  validate(ChangeStatusSchema),
  operationsManagerController.blockOperationsManager,
);

router.post(
  "/unblock",
  validate(ChangeStatusSchema),
  operationsManagerController.unblockOperationsManager,
);

export default router;


