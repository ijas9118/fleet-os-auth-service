import bcrypt from "bcryptjs";
import { inject } from "inversify";

import type { IUserRepository } from "@/repositories/user/user.repository.interface";

import TYPES from "@/di/types";

import type { IAuthService } from "./auth.service.interface";

export class AuthService implements IAuthService {
  constructor(@inject(TYPES.UserRepository) private _userRepo: IUserRepository) {}

  async register(name: string, email: string, password: string) {
    const existing = await this._userRepo.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await this._userRepo.create({ name, email, password: hashedPassword });
  }
}
