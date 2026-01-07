import { UserRole } from "@ahammedijas/fleet-os-shared";
import { Router } from "express";

import type { UserController } from "@/controllers/user.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { BlockUserSchema } from "@/dto/block-user.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

const userController = container.get<UserController>(TYPES.UserController);

router.use(requireAuth);

router.get("/", requireRole(UserRole.PLATFORM_ADMIN), userController.getAllUsers);

router.post("/block", requireRole(UserRole.PLATFORM_ADMIN), validate(BlockUserSchema), userController.blockUser);

router.post("/unblock", requireRole(UserRole.PLATFORM_ADMIN), validate(BlockUserSchema), userController.unblockUser);

export default router;
