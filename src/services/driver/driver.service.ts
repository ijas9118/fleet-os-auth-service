import { STATUS_CODES, UserRole } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";

import type { DriverListItemDTO } from "@/dto/driver-list.dto";
import type { ITokenRepository } from "@/repositories/token/token.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";
import type { PaginatedResponse } from "@/types";

import logger from "@/config/logger";
import TYPES from "@/di/types";
import { HttpError } from "@/utils/http-error-class";

import type { IDriverService } from "./driver.service.interface";

@injectable()
export class DriverService implements IDriverService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.TokenRepository) private _tokenRepository: ITokenRepository,
  ) {}

  async listDrivers(
    filters?: {
      tenantId?: string;
      status?: "active" | "blocked" | "all";
      search?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<DriverListItemDTO>> {
    const queryFilters: any = {
      role: UserRole.DRIVER,
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

    const driversList: DriverListItemDTO[] = users.map(user => ({
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
      data: driversList,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async blockDriver(userId: string, reason?: string): Promise<void> {
    const user = await this._userRepository.getUserById(userId);

    if (!user) {
      throw new HttpError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (user.role !== UserRole.DRIVER) {
      throw new HttpError(
        "User is not a driver",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (!user.isActive) {
      throw new HttpError(
        "Driver is already blocked",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    await this._userRepository.updateUser(userId, { isActive: false });

    // Revoke all active sessions
    await this._tokenRepository.deleteAllTokens(userId);

    if (reason) {
      logger.debug(`Driver ${userId} blocked. Reason: ${reason}`);
    }
  }

  async unblockDriver(userId: string, reason?: string): Promise<void> {
    const user = await this._userRepository.getUserById(userId);

    if (!user) {
      throw new HttpError("User not found", STATUS_CODES.NOT_FOUND);
    }

    if (user.role !== UserRole.DRIVER) {
      throw new HttpError(
        "User is not a driver",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (user.isActive) {
      throw new HttpError(
        "Driver is already active",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    await this._userRepository.updateUser(userId, { isActive: true });

    if (reason) {
      logger.debug(`Driver ${userId} unblocked. Reason: ${reason}`);
    }
  }
}
