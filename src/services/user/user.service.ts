import { inject, injectable } from "inversify";

import type { UserListItemDTO } from "@/dto/user-list.dto";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { PaginatedResponse } from "@/types";

import TYPES from "@/di/types";

import type { IUserService } from "./user.service.interface";

@injectable()
export class UserService implements IUserService {
  constructor(@inject(TYPES.UserRepository) private _userRepository: IUserRepository) {}

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
}
