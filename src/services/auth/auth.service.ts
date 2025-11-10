import bcrypt from "bcryptjs";
import { inject } from "inversify";
import jwt from "jsonwebtoken";

import type { LoginDTO } from "@/dto/login.dto";
import type { RegisterDTO } from "@/dto/register.dto";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";

import { MESSAGES } from "@/config/constants/messages.constant";
import { STATUS_CODES } from "@/config/constants/status-codes.constant";
import env from "@/config/validate-env";
import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IAuthService } from "./auth.service.interface";

export class AuthService implements IAuthService {
  constructor(@inject(TYPES.UserRepository) private _userRepo: IUserRepository) {}

  async register(data: RegisterDTO) {
    const existing = await this._userRepo.getUserByEmail(data.email);
    if (existing) {
      throw new HttpError(MESSAGES.EMAIL_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    data.password = hashedPassword;

    return await this._userRepo.createUser(data);
  }

  async login(data: LoginDTO) {
    const user = await this._userRepo.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, env.PRIVATE_KEY, { expiresIn: "15m", algorithm: "RS256" });
    const refreshToken = jwt.sign(payload, env.PRIVATE_KEY, { expiresIn: "7d", algorithm: "RS256" });

    return { accessToken, refreshToken };
  }
}
