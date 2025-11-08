import { Container } from "inversify";

import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { IAuthService } from "@/services/auth/auth.service.interface";

import { AuthController } from "@/controllers/auth.controller";
import { TokenRepository } from "@/repositories/token/token.repository";
import { UserRepository } from "@/repositories/user/user.repository";
import { AuthService } from "@/services/auth/auth.service";

import TYPES from "./types";

const container = new Container();

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<ITokenRepository>(TYPES.TokenRepository).to(TokenRepository);

container.bind<IAuthService>(TYPES.AuthService).to(AuthService);

container.bind(TYPES.AuthController).to(AuthController);

export default container;
