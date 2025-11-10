import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { LoginDTO } from "@/dto/login.dto";
import type { RegisterDTO } from "@/dto/register.dto";
import type { IAuthService } from "@/services/auth/auth.service.interface";

import { MESSAGES } from "@/config/constants/messages.constant";
import { STATUS_CODES } from "@/config/constants/status-codes.constant";
import env from "@/config/validate-env";
import TYPES from "@/di/types";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private _authService: IAuthService) {}

  register = async (req: Request, res: Response) => {
    const data: RegisterDTO = req.body;
    const user = await this._authService.register(data);
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.REGISTER_SUCCESS, user });
  };

  login = async (req: Request, res: Response) => {
    const data: LoginDTO = req.body;
    const tokens = await this._authService.login(data);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth/refresh-token",
    });
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, data: { accessToken: tokens.accessToken } });
  };
}
