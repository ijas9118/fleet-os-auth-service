import { Router } from "express";

import type { AuthController } from "@/controllers/auth.controller";

import container from "@/di/container";
import TYPES from "@/di/types";

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register", authController.register);

export default router;
