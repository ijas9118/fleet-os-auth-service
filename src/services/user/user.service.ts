import { STATUS_CODES } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";

import type { UserListItemDTO } from "@/dto/user-list.dto";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { PaginatedResponse } from "@/types";

import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IUserService } from "./user.service.interface";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.TokenRepository) private _tokenRepository: ITokenRepository,
  ) {}

  async getAllUsers(
    filters?: {
      role?: string;
      tenantId?: string;
      isActive?: boolean;
      search?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<UserListItemDTO>> {
    const { users, total } = await this._userRepository.getAllUsers(filters, page, limit);

    const userList: UserListItemDTO[] = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));

    return {
      data: userList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async blockUser(userId: string): Promise<void> {
    const user = await this._userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (!user.isActive) {
      throw new HttpError("User is already blocked", STATUS_CODES.BAD_REQUEST);
    }

    await this._userRepository.updateUser(userId, { isActive: false });

    await this._tokenRepository.deleteAllTokens(userId);
  }

  async unblockUser(userId: string): Promise<void> {
    const user = await this._userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (user.isActive) {
      throw new HttpError("User is already active", STATUS_CODES.BAD_REQUEST);
    }

    await this._userRepository.updateUser(userId, { isActive: true });
  }
}
