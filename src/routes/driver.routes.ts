import { UserRole } from "@ahammedijas/fleet-os-shared";
import { Router } from "express";

import type { DriverController } from "@/controllers/driver.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { ChangeStatusSchema } from "@/dto/change-status.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

// Inject controller
const driverController = container.get<DriverController>(
  TYPES.DriverController,
);

// Protect all routes
router.use(requireAuth);
router.use(requireRole(UserRole.TENANT_ADMIN, UserRole.OPERATIONS_MANAGER));

router.get("/", driverController.listDrivers);

router.post(
  "/block",
  validate(ChangeStatusSchema),
  driverController.blockDriver,
);

router.post(
  "/unblock",
  validate(ChangeStatusSchema),
  driverController.unblockDriver,
);

export default router;
