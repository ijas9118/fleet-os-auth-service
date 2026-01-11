import { Container } from "inversify";

import type { ITenantRepository } from "@/repositories/tenant/tenant.repository.interface";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { IAuthService } from "@/services/auth/auth.service.interface";
import type { IOperationsManagerService } from "@/services/operations-manager/operations-manager.service.interface";
import type { IOtpService } from "@/services/otp/otp.service.interface";
import type { ITenantService } from "@/services/tenant/tenant.service.interface";
import type { IUserService } from "@/services/user/user.service.interface";

import { initRedisClient } from "@/config/redis.config";
import { AuthController } from "@/controllers/auth.controller";
import { OperationsManagerController } from "@/controllers/operations-manager.controller";
import { TenantController } from "@/controllers/tenant.controller";
import { UserController } from "@/controllers/user.controller";
import { TenantRepository } from "@/repositories/tenant/tenant.repository";
import { TokenRepository } from "@/repositories/token/token.repository";
import { UserRepository } from "@/repositories/user/user.repository";
import { AuthHelper } from "@/services/auth/auth.helper";
import { AuthService } from "@/services/auth/auth.service";
import { OperationsManagerService } from "@/services/operations-manager/operations-manager.service";
import { OtpService } from "@/services/otp/otp.service";
import { TenantService } from "@/services/tenant/tenant.service";
import { UserService } from "@/services/user/user.service";

import TYPES from "./types";

const container = new Container();

const redisClient = initRedisClient();

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<ITenantService>(TYPES.TenantService).to(TenantService);
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IOperationsManagerService>(TYPES.OperationsManagerService).to(OperationsManagerService);
container.bind<AuthHelper>(TYPES.AuthHelper).to(AuthHelper);
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<ITenantRepository>(TYPES.TenantRepository).to(TenantRepository);
container.bind<ITokenRepository>(TYPES.TokenRepository).to(TokenRepository);
container.bind<IOtpService>(TYPES.OtpService).to(OtpService);

container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.TenantController).to(TenantController);
container.bind(TYPES.UserController).to(UserController);
container.bind(TYPES.OperationsManagerController).to(OperationsManagerController);

export default container;
