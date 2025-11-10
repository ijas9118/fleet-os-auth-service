import { Container } from "inversify";

import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { IAuthService } from "@/services/auth/auth.service.interface";
import type { IOtpService } from "@/services/otp/otp.service.interface";

import { initRedisClient } from "@/config/redis.config";
import { AuthController } from "@/controllers/auth.controller";
import { TokenRepository } from "@/repositories/token/token.repository";
import { UserRepository } from "@/repositories/user/user.repository";
import { AuthService } from "@/services/auth/auth.service";
import { OtpService } from "@/services/otp/otp.service";

import TYPES from "./types";

const container = new Container();

const redisClient = initRedisClient();

container.bind(TYPES.RedisClient).toConstantValue(redisClient);

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<ITokenRepository>(TYPES.TokenRepository).to(TokenRepository);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IOtpService>(TYPES.OtpService).to(OtpService);

container.bind(TYPES.AuthController).to(AuthController);

export default container;
