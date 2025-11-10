import { Router } from "express";

import type { AuthController } from "@/controllers/auth.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { LoginSchema } from "@/dto/login.dto";
import { RegisterSchema } from "@/dto/register.dto";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);

export default router;
