import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { UserListQueryDTO } from "@/dto/user-list.dto";
import type { IUserService } from "@/services/user/user.service.interface";

import TYPES from "@/di/types";
import { ResponseHelper } from "@/utils/response.helper";

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private _userService: IUserService) {}

  getAllUsers = async (req: Request, res: Response) => {
    const query = req.query as UserListQueryDTO;

    const page = Number.parseInt(query.page || "1");
    const limit = Number.parseInt(query.limit || "10");

    const filters: any = {};

    if (query.role) {
      filters.role = query.role;
    }

    if (query.tenantId) {
      filters.tenantId = query.tenantId;
    }

    if (query.isActive !== undefined) {
      filters.isActive = query.isActive === "true";
    }

    if (query.search) {
      filters.search = query.search;
    }

    const result = await this._userService.getAllUsers(filters, page, limit);
    ResponseHelper.success(res, "Users retrieved successfully", result);
  };
}
