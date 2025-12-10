import type { Request, Response } from "express";

import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";

import type { InternalUserCreateDTO } from "@/dto/internal-user-create.dto";
import type { LoginDTO } from "@/dto/login.dto";
import type { TenantAdminRegisterDTO } from "@/dto/tenant-admin.register.dto";
import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { IAuthService } from "@/services/auth/auth.service.interface";
import type { IOtpService } from "@/services/otp/otp.service.interface";

import { MESSAGES } from "@/config/messages.constant";
import env from "@/config/validate-env";
import TYPES from "@/di/types";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private _authService: IAuthService,
    @inject(TYPES.OtpService) private _otpService: IOtpService,
  ) {}

  registerTenant = async (req: Request, res: Response) => {
    const data: TenantRegisterDTO = req.body;
    await this._authService.registerTenant(data);
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.OTP.SENT });
  };

  registerUser = async (req: Request, res: Response) => {
    const data: TenantAdminRegisterDTO = req.body;
    await this._authService.registerTenantAdmin(data);
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.OTP.SENT });
  };

  verifyAndRegister = async (req: Request, res: Response) => {
    const body = req.body as VerifyOtpDTO;

    if (body.type === "tenant") {
      const result = await this._authService.verifyTenantRegisteration(body);
      return res.status(STATUS_CODES.OK).json({ message: MESSAGES.AUTH.TENANT_REGISTER_SUCCESS, result });
    }

    if (body.type === "user") {
      const result = await this._authService.verifyAndRegister(body);
      return res.status(STATUS_CODES.OK).json({ message: MESSAGES.AUTH.USER_REGISTER_SUCCESS, result });
    }

    throw new Error("Invalid OTP type");
  };

  resendOTP = async (req: Request, res: Response) => {
    const { email } = req.body;
    await this._otpService.resendOTP(email);
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.OTP.SENT });
  };

  login = async (req: Request, res: Response) => {
    const data: LoginDTO = req.body;
    const tokens = await this._authService.login(data);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: { accessToken: tokens.accessToken },
    });
  };

  inviteUser = async (req: Request, res: Response) => {
    const data: InternalUserCreateDTO = req.body;
    await this._authService.createInternalUser(data);
    res.status(200).json({ message: MESSAGES.AUTH.INVITE_REQUEST_SENT });
  };

  acceptInvite = async (req: Request, res: Response) => {
    const data: { token: string; password: string } = req.body;
    await this._authService.setPasswordFromInvite(data);
    res.status(200).json({ message: MESSAGES.AUTH.USER_REGISTER_SUCCESS });
  };

  refresh = async (req: Request, res: Response) => {
    if (!req.cookies) {
      res.status(STATUS_CODES.FORBIDDEN).json({
        error: "No cookie",
      });
      return;
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(STATUS_CODES.FORBIDDEN).json({
        error: "No refresh token",
      });
      return;
    }

    const tokens = await this._authService.refreshToken(refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.TOKEN.NEW_TOKENS, tokens });
  };

  logout = async (req: Request, res: Response) => {
    if (!req.cookies) {
      res.status(STATUS_CODES.FORBIDDEN).json({
        error: "No cookie",
      });
      return;
    }
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(STATUS_CODES.FORBIDDEN).json({
        error: "No refresh token",
      });
      return;
    }

    await this._authService.logout(refreshToken, req.user?.id as string);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.AUTH.LOGOUT_SUCCESS || "Logged out successfully",
    });
  };

  logoutAllSessions = async (req: Request, res: Response) => {
    const userId = req.user?.id as string;

    await this._authService.logoutAllSessions(userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(STATUS_CODES.OK).json({
      message: MESSAGES.AUTH.LOGOUT_ALL_SUCCESS,
    });
  };
}
