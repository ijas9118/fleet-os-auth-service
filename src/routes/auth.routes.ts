import { Router } from "express";

import type { AuthController } from "@/controllers/auth.controller";

import container from "@/di/container";
import TYPES from "@/di/types";
import { LoginSchema } from "@/dto/login.dto";
import { RegisterSchema } from "@/dto/register.dto";
import { VerifyOtpSchema } from "@/dto/verify-otp.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/verify-otp", validate(VerifyOtpSchema), authController.verifyAndRegister);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", validate(LoginSchema), authController.login);
router.post("/refresh", authController.refresh);

/** Protected routes */
router.use(requireAuth);

router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAllSessions);

export default router;
