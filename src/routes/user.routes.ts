import { UserRole } from "@ahammedijas/fleet-os-shared";
import { Router } from "express";

import type { UserController } from "@/controllers/user.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";

const router = Router();

const userController = container.get<UserController>(TYPES.UserController);

router.use(requireAuth);

router.get("/", requireRole(UserRole.PLATFORM_ADMIN), userController.getAllUsers);

export default router;
