import { UserRole } from "@ahammedijas/fleet-os-shared";
import { Router } from "express";

import type { TenantController } from "@/controllers/tenant.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { TenantRegisterSchema } from "@/dto/tenant.register.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";

/**
 * Routes for tenant management operations
 */
const router = Router();

const tenantController = container.get<TenantController>(TYPES.TenantController);

// Public tenant registration
router.post("/register", validate(TenantRegisterSchema), tenantController.registerTenant);

// Protected admin routes
router.use(requireAuth);
router.use(requireRole(UserRole.PLATFORM_ADMIN));

router.get("/", tenantController.getTenants);
router.get("/pending", tenantController.getPendingTenants);
router.get("/rejected", tenantController.getRejectedTenants);
router.post("/verify", tenantController.verifyTenant);
router.post("/reject", tenantController.rejectTenant);

export default router;
