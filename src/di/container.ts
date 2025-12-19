import { Container } from "inversify";

import type { ITenantRepository } from "@/repositories/tenant/tenant.repository.interface";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { IAuthService } from "@/services/auth/auth.service.interface";
import type { IOtpService } from "@/services/otp/otp.service.interface";

import { initRedisClient } from "@/config/redis.config";
import { AuthController } from "@/controllers/auth.controller";
import { TenantRepository } from "@/repositories/tenant/tenant.repository";
import { TokenRepository } from "@/repositories/token/token.repository";
import { UserRepository } from "@/repositories/user/user.repository";
import { AuthHelper } from "@/services/auth/auth.helper";
import { AuthService } from "@/services/auth/auth.service";
import { OtpService } from "@/services/otp/otp.service";

import TYPES from "./types";

const container = new Container();

const redisClient = initRedisClient();

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthHelper>(TYPES.AuthHelper).to(AuthHelper);
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<ITenantRepository>(TYPES.TenantRepository).to(TenantRepository);
container.bind<ITokenRepository>(TYPES.TokenRepository).to(TokenRepository);
container.bind<IOtpService>(TYPES.OtpService).to(OtpService);

container.bind(TYPES.AuthController).to(AuthController);

export default container;
