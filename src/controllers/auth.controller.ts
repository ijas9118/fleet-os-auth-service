import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { InternalUserCreateDTO } from "@/dto/internal-user-create.dto";
import type { LoginDTO } from "@/dto/login.dto";
import type { TenantAdminRegisterDTO } from "@/dto/tenant-admin.register.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { IAuthService } from "@/services/auth/auth.service.interface";
import type { IOtpService } from "@/services/otp/otp.service.interface";
import type { ITenantService } from "@/services/tenant/tenant.service.interface";

import { MESSAGES } from "@/config/messages.constant";
import TYPES from "@/di/types";
import { CookieHelper } from "@/utils/cookie.helper";
import { RequestHelper } from "@/utils/request.helper";
import { ResponseHelper } from "@/utils/response.helper";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private _authService: IAuthService,
    @inject(TYPES.TenantService) private _tenantService: ITenantService,
    @inject(TYPES.OtpService) private _otpService: IOtpService,
  ) {}

  registerUser = async (req: Request, res: Response) => {
    const data: TenantAdminRegisterDTO = req.body;
    await this._authService.registerTenantAdmin(data);
    ResponseHelper.success(res, MESSAGES.OTP.SENT);
  };

  verifyAndRegister = async (req: Request, res: Response) => {
    const body = req.body as VerifyOtpDTO;

    if (body.type === "tenant") {
      const result = await this._tenantService.verifyTenantRegisteration(body);
      return ResponseHelper.success(
        res,
        MESSAGES.AUTH.TENANT_REGISTER_SUCCESS,
        result,
      );
    }

    if (body.type === "user") {
      const result = await this._authService.verifyAndRegister(body);
      return ResponseHelper.success(
        res,
        MESSAGES.AUTH.USER_REGISTER_SUCCESS,
        result,
      );
    }

    throw new Error("Invalid OTP type");
  };

  resendOTP = async (req: Request, res: Response) => {
    const { email } = req.body;
    await this._otpService.resendOTP(email);
    ResponseHelper.success(res, MESSAGES.OTP.SENT);
  };

  login = async (req: Request, res: Response) => {
    const data: LoginDTO = req.body;
    const tokens = await this._authService.login(data);

    CookieHelper.setRefreshTokenCookie(res, tokens.refreshToken);
    ResponseHelper.success(res, MESSAGES.AUTH.LOGIN_SUCCESS, {
      accessToken: tokens.accessToken,
    });
  };

  inviteUser = async (req: Request, res: Response) => {
    const data: InternalUserCreateDTO = req.body;
    const tenantId = req.user?.tenantId;
    const invitedBy = req.user?.id;
    await this._authService.createInternalUser(data, tenantId!, invitedBy!);
    ResponseHelper.success(res, MESSAGES.AUTH.INVITE_REQUEST_SENT);
  };

  acceptInvite = async (req: Request, res: Response) => {
    const data: { token: string; password: string } = req.body;
    const userData = await this._authService.setPasswordFromInvite(data);
    ResponseHelper.success(res, MESSAGES.AUTH.USER_REGISTER_SUCCESS, userData);
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = RequestHelper.extractRefreshToken(req);
    const tokens = await this._authService.refreshToken(refreshToken);

    CookieHelper.setRefreshTokenCookie(res, tokens.refreshToken);
    ResponseHelper.success(res, MESSAGES.TOKEN.NEW_TOKENS, tokens);
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = RequestHelper.extractRefreshToken(req);
    await this._authService.logout(refreshToken, req.user?.id as string);

    CookieHelper.clearRefreshTokenCookie(res);
    ResponseHelper.success(
      res,
      MESSAGES.AUTH.LOGOUT_SUCCESS || "Logged out successfully",
    );
  };

  logoutAllSessions = async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    await this._authService.logoutAllSessions(userId);

    CookieHelper.clearRefreshTokenCookie(res);
    ResponseHelper.success(res, MESSAGES.AUTH.LOGOUT_ALL_SUCCESS);
  };
}
