import { UserRole } from "@ahammedijas/fleet-os-shared";
import { Router } from "express";

import type { AuthController } from "@/controllers/auth.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { AcceptInviteSchema } from "@/dto/accept-invite.dto";
import { InternalUserCreateSchema } from "@/dto/internal-user-create.dto";
import { LoginSchema } from "@/dto/login.dto";
import { TenantAdminRegisterSchema } from "@/dto/tenant-admin.register.dto";
import { TenantRegisterSchema } from "@/dto/tenant.register.dto";
import { VerifyOtpSchema } from "@/dto/verify-otp.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register-tenant", validate(TenantRegisterSchema), authController.registerTenant);
router.post("/register-admin", validate(TenantAdminRegisterSchema), authController.registerUser);
router.post("/verify-otp", validate(VerifyOtpSchema), authController.verifyAndRegister);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", validate(LoginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/accept-invite", validate(AcceptInviteSchema), authController.acceptInvite);

/** Protected routes */
router.use(requireAuth);

router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAllSessions);

/** Admin routes */
router.get("/tenants", requireRole(UserRole.PLATFORM_ADMIN), authController.getTenants);
router.get("/tenants/pending", requireRole(UserRole.PLATFORM_ADMIN), authController.getPendingTenants);
router.post("/verify-tenant", requireRole(UserRole.PLATFORM_ADMIN), authController.verifyTenant);

router.post(
  "/invite-user",
  requireRole(UserRole.TENANT_ADMIN, UserRole.PLATFORM_ADMIN),
  validate(InternalUserCreateSchema),
  authController.inviteUser,
);

export default router;
