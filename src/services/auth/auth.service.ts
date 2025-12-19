import type { RedisClientType } from "redis";

import { STATUS_CODES, UserRole } from "@ahammedijas/fleet-os-shared";
import { inject } from "inversify";
import { v4 as uuidv4 } from "uuid";

import type { AcceptInviteDTO } from "@/dto/accept-invite.dto";
import type { AuthTokens, AuthUser } from "@/dto/auth.response.dto";
import type { InternalUserCreateDTO } from "@/dto/internal-user-create.dto";
import type { LoginDTO } from "@/dto/login.dto";
import type { TenantAdminRegisterDTO } from "@/dto/tenant-admin.register.dto";
import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { ITenantRepository } from "@/repositories/tenant/tenant.repository.interface";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { JWTPayload } from "@/types";

import { MESSAGES } from "@/config/messages.constant";
import env from "@/config/validate-env";
import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IOtpService } from "../otp/otp.service.interface";
import type { AuthHelper } from "./auth.helper";
import type { IAuthService } from "./auth.service.interface";

export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.TenantRepository) private _tenantRepo: ITenantRepository,
    @inject(TYPES.OtpService) private _otpService: IOtpService,
    @inject(TYPES.TokenRepository) private _tokenRepo: ITokenRepository,
    @inject(TYPES.RedisClient) private _redisClient: RedisClientType,
    @inject(TYPES.AuthHelper) private _authHelper: AuthHelper,
  ) {}

  private async _isUserAlreadyExist(email: string) {
    const existingUser = await this._userRepo.getUserByEmail(email);
    if (existingUser) {
      throw new HttpError(MESSAGES.AUTH.EMAIL_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }
  }

  private async _isTenantAlreadyExist(email: string) {
    const existingTenant = await this._tenantRepo.getTenantByEmail(email);
    if (existingTenant) {
      throw new HttpError(MESSAGES.AUTH.TENANT_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }
  }

  async verifyTenantByAdmin(tenantId: string): Promise<{ tenantLink: string }> {
    const tenant = await this._tenantRepo.getTenantByTenantId(tenantId);
    if (!tenant) {
      throw new HttpError("Tenant not found", STATUS_CODES.NOT_FOUND);
    }

    if (tenant.status === "ACTIVE") {
      throw new HttpError("Tenant already active", STATUS_CODES.CONFLICT);
    }

    // Update status
    await this._tenantRepo.updateTenant(tenantId, { status: "ACTIVE" as any });

    // Generate Admin Registration Link
    const tenantLink = `${env.CLIENT_URL}/register-admin?tenantId=${tenantId}`;

    return { tenantLink };
  }

  async registerTenant(data: TenantRegisterDTO): Promise<void> {
    await this._isTenantAlreadyExist(data.contactEmail);
    await this._otpService.generateOTPForTenant(data);
  }

  async verifyTenantRegisteration(data: VerifyOtpDTO): Promise<any> {
    const savedData = await this._otpService.verifyOtp(data);
    if (savedData.type !== "tenant") {
      throw new HttpError("Invalid OTP type", 400);
    }

    const tenantId = uuidv4();
    const tenant = await this._tenantRepo.createTenant({ ...savedData.data, tenantId });

    return {
      tenantId: tenant.tenantId,
      contactEmail: tenant.contactEmail,
      state: tenant.status,
    };
  }

  async registerTenantAdmin(data: TenantAdminRegisterDTO): Promise<void> {
    await this._isUserAlreadyExist(data.email);

    const tenant = await this._tenantRepo.getTenantByTenantId(data.tenantId);
    if (!tenant) {
      throw new HttpError("Tenant not active", STATUS_CODES.FORBIDDEN);
    }

    const hashedPassword = await this._authHelper.hashPassword(data.password);
    await this._otpService.generateOTP({ ...data, password: hashedPassword, role: UserRole.TENANT_ADMIN });
  }

  async verifyAndRegister(data: VerifyOtpDTO): Promise<AuthUser> {
    const savedData = await this._otpService.verifyOtp(data);
    if (savedData.type !== "user") {
      throw new HttpError("Invalid OTP type", 400);
    }
    const user = await this._userRepo.createUser(savedData.data);

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async login(data: LoginDTO): Promise<AuthTokens> {
    const user = await this._userRepo.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    if (user.role !== UserRole.PLATFORM_ADMIN) {
      if (!user.tenantId) {
        throw new HttpError("Tenant ID missing for non-admin user", STATUS_CODES.FORBIDDEN);
      }
      const tenant = await this._tenantRepo.getTenantByTenantId(user.tenantId);
      if (!tenant) {
        throw new HttpError("Tenant not active", STATUS_CODES.FORBIDDEN);
      }
    }

    const isPasswordValid = await this._authHelper.validatePassword(data.password, user.password!);
    if (!isPasswordValid) {
      throw new HttpError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const payload = this._authHelper.createJwtPayload(user);
    const tokens = this._authHelper.generateTokens(payload);

    await this._storeRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  async createInternalUser(data: InternalUserCreateDTO, tenantId: string): Promise<void> {
    await this._isUserAlreadyExist(data.email);

    const user = await this._userRepo.createUser({
      ...data,
      password: null,
      tenantId,
    });

    const token = uuidv4();

    // Redis class
    await this._redisClient.set(`invite:${token}`, user._id.toString(), {
      expiration: { type: "EX", value: 24 * 60 * 60 },
    });
  }

  async setPasswordFromInvite(data: AcceptInviteDTO): Promise<void> {
    const key = `invite:${data.token}`;

    const userId = await this._redisClient.get(key);

    if (!userId) {
      throw new HttpError("Invalid or expired invite token", 401);
    }

    const hashed = await this._authHelper.hashPassword(data.password);

    await this._userRepo.updateUser(userId, { password: hashed });

    await this._redisClient.del(key);
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    const decoded = this._authHelper.decodeToken(token);
    const storedToken = await this._validateStoredRefreshToken(token, decoded);

    storedToken.revoked = true;
    await storedToken.save();

    const payload: JWTPayload = this._authHelper.createJwtPayload(decoded);

    const newTokens = this._authHelper.generateTokens(payload);

    await this._storeRefreshToken(storedToken.user.toString(), newTokens.refreshToken);

    return newTokens;
  }

  async logout(token: string, user: string): Promise<void> {
    const storedToken = await this._tokenRepo.findByToken(token);

    if (!storedToken)
      return;

    await this._tokenRepo.revoke({ token, user });
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this._deleteAllTokens(userId);
  }

  private async _deleteAllTokens(userId: string) {
    await this._tokenRepo.deleteAllTokens(userId);
  }

  private async _storeRefreshToken(userId: string, token: string) {
    const { exp } = this._authHelper.decodeToken(token);
    await this._tokenRepo.create({
      user: userId,
      token,
      expiresAt: new Date(exp! * 1000),
    });
  }

  private async _validateStoredRefreshToken(token: string, decoded: JWTPayload) {
    const storedToken = await this._tokenRepo.findByToken(token);

    if (!storedToken || storedToken.revoked) {
      await this._deleteAllTokens(decoded.sub as string);
      throw new HttpError(MESSAGES.TOKEN.INVALID_REFRESH_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }

    return storedToken;
  }
}
