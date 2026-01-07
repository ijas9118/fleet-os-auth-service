import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { ITenantService } from "@/services/tenant/tenant.service.interface";

import { MESSAGES } from "@/config/messages.constant";
import TYPES from "@/di/types";
import { RequestHelper } from "@/utils/request.helper";
import { ResponseHelper } from "@/utils/response.helper";

@injectable()
export class TenantController {
  constructor(
    @inject(TYPES.TenantService) private _tenantService: ITenantService,
  ) {}

  registerTenant = async (req: Request, res: Response) => {
    const data: TenantRegisterDTO = req.body;
    await this._tenantService.registerTenant(data);
    ResponseHelper.success(res, MESSAGES.OTP.SENT);
  };

  verifyTenant = async (req: Request, res: Response) => {
    const { tenantId } = req.body;
    const result = await this._tenantService.verifyTenantByAdmin(tenantId);
    ResponseHelper.success(res, "Tenant active", result);
  };

  rejectTenant = async (req: Request, res: Response) => {
    const { tenantId } = req.body;
    await this._tenantService.rejectTenant(tenantId);
    ResponseHelper.success(res, "Tenant rejected");
  };

  getTenants = async (req: Request, res: Response) => {
    const params = RequestHelper.parsePaginationParams(req.query);
    const result = await this._tenantService.getTenants(params);
    ResponseHelper.success(res, "Tenants retrieved successfully", result);
  };

  getPendingTenants = async (req: Request, res: Response) => {
    const params = RequestHelper.parsePaginationParams(req.query);
    const result = await this._tenantService.getPendingTenants(params);
    ResponseHelper.success(res, "Pending tenants retrieved successfully", result);
  };

  getRejectedTenants = async (req: Request, res: Response) => {
    const params = RequestHelper.parsePaginationParams(req.query);
    const result = await this._tenantService.getRejectedTenants(params);
    ResponseHelper.success(res, "Rejected tenants retrieved successfully", result);
  };
}
