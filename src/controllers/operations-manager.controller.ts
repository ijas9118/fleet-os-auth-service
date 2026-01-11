import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { OperationsManagerListQueryDTO } from "@/dto/operations-manager-list.dto";
import type { IOperationsManagerService } from "@/services/operations-manager/operations-manager.service.interface";

import TYPES from "@/di/types";
import { ResponseHelper } from "@/utils/response.helper";

@injectable()
export class OperationsManagerController {
  constructor(
    @inject(TYPES.OperationsManagerService)
    private _operationsManagerService: IOperationsManagerService,
  ) {}

  listOperationsManagers = async (req: Request, res: Response) => {
    const query = req.query as OperationsManagerListQueryDTO;

    const page = Number.parseInt(query.page || "1");
    const limit = Number.parseInt(query.limit || "10");

    const filters: any = {};

    // If user is a tenant admin, filter by their tenantId
    if (req.user?.role === "TENANT_ADMIN" && req.user?.tenantId) {
      filters.tenantId = req.user.tenantId;
    }

    if (query.status && query.status !== "all") {
      filters.status = query.status;
    }

    if (query.search) {
      filters.search = query.search;
    }

    const result = await this._operationsManagerService.listOperationsManagers(
      filters,
      page,
      limit,
    );
    
    ResponseHelper.success(res, "Operations managers retrieved successfully", result);
  };

  blockOperationsManager = async (req: Request, res: Response) => {
    const { userId, reason } = req.body;
    await this._operationsManagerService.blockOperationsManager(userId, reason);
    ResponseHelper.success(res, "Operations manager blocked successfully");
  };

  unblockOperationsManager = async (req: Request, res: Response) => {
    const { userId, reason } = req.body;
    await this._operationsManagerService.unblockOperationsManager(userId, reason);
    ResponseHelper.success(res, "Operations manager unblocked successfully");
  };
}
