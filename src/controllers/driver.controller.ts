import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { DriverListQueryDTO } from "@/dto/driver-list.dto";
import type { IDriverService } from "@/services/driver/driver.service.interface";

import TYPES from "@/di/types";
import { ResponseHelper } from "@/utils/response.helper";

@injectable()
export class DriverController {
  constructor(
    @inject(TYPES.DriverService)
    private _driverService: IDriverService,
  ) {}

  listDrivers = async (req: Request, res: Response) => {
    const query = req.query as DriverListQueryDTO;

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

    const result = await this._driverService.listDrivers(
      filters,
      page,
      limit,
    );

    ResponseHelper.success(res, "Drivers retrieved successfully", result);
  };

  blockDriver = async (req: Request, res: Response) => {
    const { userId, reason } = req.body;
    await this._driverService.blockDriver(userId, reason);
    ResponseHelper.success(res, "Driver blocked successfully");
  };

  unblockDriver = async (req: Request, res: Response) => {
    const { userId, reason } = req.body;
    await this._driverService.unblockDriver(userId, reason);
    ResponseHelper.success(res, "Driver unblocked successfully");
  };
}
