import type { RedisClientType } from "redis";

import { STATUS_CODES, UserRole } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

import type { AcceptInviteDTO } from "@/dto/accept-invite.dto";
import type { AuthTokens, AuthUser } from "@/dto/auth.response.dto";
import type { InternalUserCreateDTO } from "@/dto/internal-user-create.dto";
import type { LoginDTO } from "@/dto/login.dto";
import type { TenantAdminRegisterDTO } from "@/dto/tenant-admin.register.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { ITenantRepository } from "@/repositories/tenant/tenant.repository.interface";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { JWTPayload } from "@/types";

import logger from "@/config/logger";
import { MESSAGES } from "@/config/messages.constant";
import env from "@/config/validate-env";
import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IEventPublisherService } from "../event-publisher/event-publisher.service.interface";
import type { IOtpService } from "../otp/otp.service.interface";
import type { AuthHelper } from "./auth.helper";
import type { IAuthService } from "./auth.service.interface";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.TokenRepository) private _tokenRepo: ITokenRepository,
    @inject(TYPES.RedisClient) private _redisClient: RedisClientType,
    @inject(TYPES.AuthHelper) private _authHelper: AuthHelper,
    @inject(TYPES.TenantRepository) private _tenantRepo: ITenantRepository,
    @inject(TYPES.OtpService) private _otpService: IOtpService,
    @inject(TYPES.EventPublisherService) private _eventPublisher: IEventPublisherService,
  ) {}

  private async _isUserAlreadyExist(email: string) {
    const existingUser = await this._userRepo.getUserByEmail(email);
    if (existingUser) {
      throw new HttpError(MESSAGES.AUTH.EMAIL_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }
  }

  async registerTenantAdmin(data: TenantAdminRegisterDTO): Promise<void> {
    await this._isUserAlreadyExist(data.email);

    const tenant = await this._tenantRepo.getTenantByTenantId(data.tenantId);
    if (!tenant)
      throw new HttpError("Tenant not active", STATUS_CODES.FORBIDDEN);

    const hashedPassword = await this._authHelper.hashPassword(data.password);
    await this._otpService.generateOTP({ ...data, password: hashedPassword, role: UserRole.TENANT_ADMIN });
  }

  async verifyAndRegister(data: VerifyOtpDTO): Promise<AuthUser> {
    const savedData = await this._otpService.verifyOtp(data);
    if (savedData.type !== "user")
      throw new HttpError("Invalid OTP type", 400);

    const user = await this._userRepo.createUser({ ...savedData.data, isActive: true });

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

  async login(data: LoginDTO): Promise<AuthTokens> {
    const user = await this._userRepo.getUserByEmail(data.email);
    if (!user)
      throw new HttpError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);

    if (!user.isActive)
      throw new HttpError("Your account has been suspended. Please contact support.", STATUS_CODES.FORBIDDEN);

    if (!user.password)
      throw new HttpError("Please accept your invitation first to set your password.", STATUS_CODES.FORBIDDEN);

    let tenant;

    if (user.role !== UserRole.PLATFORM_ADMIN) {
      if (!user.tenantId)
        throw new HttpError("Tenant ID missing for non-admin user", STATUS_CODES.FORBIDDEN);

      tenant = await this._tenantRepo.getTenantByTenantId(user.tenantId);
      if (!tenant)
        throw new HttpError("Tenant not active", STATUS_CODES.FORBIDDEN);
    }

    const isPasswordValid = await this._authHelper.validatePassword(data.password, user.password!);
    if (!isPasswordValid)
      throw new HttpError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);

    const payload = this._authHelper.createJwtPayload({
      _id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: tenant?.name,
      isOnboardingComplete: user.isOnboardingComplete,
    });
    const tokens = this._authHelper.generateTokens(payload);

    // Update last login timestamp
    await this._userRepo.updateUser(user._id.toString(), { lastLoginAt: new Date() });

    await this._storeRefreshToken(user._id, tokens.refreshToken);

    return tokens;
  }

  async createInternalUser(data: InternalUserCreateDTO, tenantId: string, invitedBy: string): Promise<void> {
    await this._isUserAlreadyExist(data.email);

    const user = await this._userRepo.createUser({
      ...data,
      password: null,
      tenantId,
      isActive: false,
      invitedBy,
      invitedAt: new Date(),
    });

    const token = uuidv4();

    await this._redisClient.set(`invite:${token}`, user._id.toString(), {
      expiration: { type: "EX", value: 24 * 60 * 60 },
    });

    // TODO: Replace with email service once implemented
    const invitationLink = `${env.CLIENT_URL || "http://localhost:5173"}/auth/accept-invite?token=${token}`;
    logger.debug("\n=== INVITATION LINK ===");
    logger.debug(`User: ${user.name} (${user.email})`);
    logger.debug(`Role: ${user.role}`);
    logger.debug(`Link: ${invitationLink}`);
    logger.debug(`Expires in: 24 hours`);
    logger.debug("========================\n");
  }

  async setPasswordFromInvite(data: AcceptInviteDTO): Promise<AuthUser> {
    const key = `invite:${data.token}`;

    const userId = await this._redisClient.get(key);

    if (!userId)
      throw new HttpError("Invalid or expired invite token", 401);

    const hashed = await this._authHelper.hashPassword(data.password);

    const user = await this._userRepo.getUserById(userId);
    if (!user)
      throw new HttpError("User not found", 500);

    await this._userRepo.updateUser(userId, {
      password: hashed,
      isActive: true,
      invitationAcceptedAt: new Date(),
      isOnboardingComplete: user.role === UserRole.DRIVER ? false : undefined,
    });

    await this._redisClient.del(key);

    // Publish event if user is a driver
    if (user.role === UserRole.DRIVER && user.tenantId) {
      await this._publishDriverActivatedEvent(user);
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  private async _publishDriverActivatedEvent(user: any): Promise<void> {
    await this._eventPublisher.publish(
      "auth-events",
      "auth.user.driver.activated",
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        activatedAt: new Date().toISOString(),
      },
    );
  }

  async refreshToken(token: string): Promise<AuthTokens> {
    const decoded = this._authHelper.decodeToken(token);

    const storedToken = await this._validateStoredRefreshToken(token, decoded);

    const user = await this._userRepo.getUserById(storedToken.user.toString());
    if (!user || !user.isActive)
      throw new HttpError("Your account has been suspended. Please contact support.", STATUS_CODES.FORBIDDEN);

    storedToken.revoked = true;
    await storedToken.save();

    let tenantName: string | undefined;
    if (user.tenantId && user.role !== UserRole.PLATFORM_ADMIN) {
      const tenant = await this._tenantRepo.getTenantByTenantId(user.tenantId);
      tenantName = tenant?.name;
    }

    const payload: JWTPayload = this._authHelper.createJwtPayload({
      _id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName,
      isOnboardingComplete: user.isOnboardingComplete,
    });

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
