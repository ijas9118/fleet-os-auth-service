import { STATUS_CODES, UserRole } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";

import type { OperationsManagerListItemDTO } from "@/dto/operations-manager-list.dto";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { PaginatedResponse } from "@/types";

import logger from "@/config/logger";
import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IOperationsManagerService } from "./operations-manager.service.interface";

@injectable()
export class OperationsManagerService implements IOperationsManagerService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.TokenRepository) private _tokenRepository: ITokenRepository,
  ) {}

  async listOperationsManagers(
    filters?: {
      tenantId?: string;
      status?: "active" | "blocked" | "all";
      search?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<OperationsManagerListItemDTO>> {
    const queryFilters: any = {
      role: UserRole.OPERATIONS_MANAGER,
    };

    if (filters?.tenantId) {
      queryFilters.tenantId = filters.tenantId;
    }

    if (filters?.status === "active") {
      queryFilters.isActive = true;
    }
    else if (filters?.status === "blocked") {
      queryFilters.isActive = false;
    }

    if (filters?.search) {
      queryFilters.search = filters.search;
    }

    const { users, total } = await this._userRepository.getAllUsers(queryFilters, page, limit);

    const operationsManagersList: OperationsManagerListItemDTO[] = users.map(user => ({
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
      data: operationsManagersList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async blockOperationsManager(userId: string, reason?: string): Promise<void> {
    const user = await this._userRepository.getUserById(userId);

    if (!user) {
      throw new HttpError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (user.role !== UserRole.OPERATIONS_MANAGER) {
      throw new HttpError(
        "User is not an operations manager",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (!user.isActive) {
      throw new HttpError(
        "Operations manager is already blocked",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    await this._userRepository.updateUser(userId, { isActive: false });

    // Revoke all active sessions
    await this._tokenRepository.deleteAllTokens(userId);

    // TODO: Log the reason for blocking if provided (for audit trail)
    if (reason) {
      // Future: implement audit logging
      logger.debug(`Operations manager ${userId} blocked. Reason: ${reason}`);
    }
  }

  async unblockOperationsManager(userId: string, reason?: string): Promise<void> {
    const user = await this._userRepository.getUserById(userId);

    if (!user) {
      throw new HttpError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (user.role !== UserRole.OPERATIONS_MANAGER) {
      throw new HttpError(
        "User is not an operations manager",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (user.isActive) {
      throw new HttpError(
        "Operations manager is already active",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    await this._userRepository.updateUser(userId, { isActive: true });

    if (reason) {
      // Future: implement audit logging
      logger.debug(`Operations manager ${userId} unblocked. Reason: ${reason}`);
    }
  }
}
