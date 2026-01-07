import type { Request, Response } from "express";

import { inject, injectable } from "inversify";

import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { ITenantService } from "@/services/tenant/tenant.service.interface";

import { MESSAGES } from "@/config/messages.constant";
import TYPES from "@/di/types";
import { RequestHelper } from "@/utils/request.helper";
import { ResponseHelper } from "@/utils/response.helper";

/**
 * Controller for tenant management operations
 * Handles tenant registration, verification, rejection, and listing
 */
@injectable()
export class TenantController {
  constructor(
    @inject(TYPES.TenantService) private _tenantService: ITenantService,
  ) {}

  /**
   * Register a new tenant
   */
  registerTenant = async (req: Request, res: Response) => {
    const data: TenantRegisterDTO = req.body;
    await this._tenantService.registerTenant(data);
    ResponseHelper.success(res, MESSAGES.OTP.SENT);
  };

  /**
   * Verify a tenant (admin action)
   */
  verifyTenant = async (req: Request, res: Response) => {
    const { tenantId } = req.body;
    const result = await this._tenantService.verifyTenantByAdmin(tenantId);
    ResponseHelper.success(res, "Tenant active", result);
  };

  /**
   * Reject a tenant (admin action)
   */
  rejectTenant = async (req: Request, res: Response) => {
    const { tenantId } = req.body;
    await this._tenantService.rejectTenant(tenantId);
    ResponseHelper.success(res, "Tenant rejected");
  };

  /**
   * Get all tenants with pagination and search
   */
  getTenants = async (req: Request, res: Response) => {
    const params = RequestHelper.parsePaginationParams(req.query);
    const result = await this._tenantService.getTenants(params);
    ResponseHelper.success(res, "Tenants retrieved successfully", result);
  };

  /**
   * Get pending tenants with pagination and search
   */
  getPendingTenants = async (req: Request, res: Response) => {
    const params = RequestHelper.parsePaginationParams(req.query);
    const result = await this._tenantService.getPendingTenants(params);
    ResponseHelper.success(res, "Pending tenants retrieved successfully", result);
  };

  /**
   * Get rejected tenants with pagination and search
   */
  getRejectedTenants = async (req: Request, res: Response) => {
    const params = RequestHelper.parsePaginationParams(req.query);
    const result = await this._tenantService.getRejectedTenants(params);
    ResponseHelper.success(res, "Rejected tenants retrieved successfully", result);
  };
}
