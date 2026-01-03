import { STATUS_CODES, TenantStatus, UserRole } from "@ahammedijas/fleet-os-shared";
import { inject, injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { TenantResponseDTO } from "@/dto/tenant.response.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { ITenantRepository, PaginationOptions } from "@/repositories/tenant/tenant.repository.interface";
import type { IUserRepository } from "@/repositories/user/user.repository.interface";

import { MESSAGES } from "@/config/messages.constant";
import env from "@/config/validate-env";
import TYPES from "@/di/types";
import { TenantMapper } from "@/mappers/tenant.mapper";
import { HttpError } from "@/utils/http-error-class";

import type { IOtpService } from "../otp/otp.service.interface";
import type { ITenantService, PaginatedResponse } from "./tenant.service.interface";

@injectable()
export class TenantService implements ITenantService {
  constructor(
    @inject(TYPES.TenantRepository) private _tenantRepo: ITenantRepository,
    @inject(TYPES.OtpService) private _otpService: IOtpService,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
  ) {}

  private async _isTenantAlreadyExist(email: string) {
    const existingTenant = await this._tenantRepo.getTenantByEmail(email);
    if (existingTenant)
      throw new HttpError(MESSAGES.AUTH.TENANT_ALREADY_EXISTS, STATUS_CODES.CONFLICT);
  }

  async getTenants(options?: PaginationOptions): Promise<PaginatedResponse<TenantResponseDTO>> {
    const { data, total } = await this._tenantRepo.getTenantsExcludingStatus(
      [TenantStatus.PENDING_VERIFICATION, TenantStatus.REJECTED],
      options,
    );

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: TenantMapper.toDTOs(data),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getPendingTenants(options?: PaginationOptions): Promise<PaginatedResponse<TenantResponseDTO>> {
    const { data, total } = await this._tenantRepo.getTenantsByStatus(
      TenantStatus.PENDING_VERIFICATION,
      options,
    );

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: TenantMapper.toDTOs(data),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async verifyTenantByAdmin(tenantId: string): Promise<{ tenantLink: string }> {
    const tenant = await this._tenantRepo.getTenantByTenantId(tenantId);
    if (!tenant)
      throw new HttpError("Tenant not found", STATUS_CODES.NOT_FOUND);

    if (tenant.status === TenantStatus.ACTIVE)
      throw new HttpError("Tenant already active", STATUS_CODES.CONFLICT);

    const existingAdmins = await this._userRepo.getUsersByTenantAndRole(tenantId, UserRole.TENANT_ADMIN);

    await this._tenantRepo.updateTenant(tenantId, { status: TenantStatus.ACTIVE });

    if (existingAdmins.length > 0)
      return { tenantLink: "" };

    const tenantLink = `${env.CLIENT_URL}/register-admin?tenantId=${tenantId}`;

    return { tenantLink };
  }

  async registerTenant(data: TenantRegisterDTO): Promise<void> {
    await this._isTenantAlreadyExist(data.contactEmail);
    await this._otpService.generateOTPForTenant(data);
  }

  async verifyTenantRegisteration(data: VerifyOtpDTO): Promise<any> {
    const savedData = await this._otpService.verifyOtp(data);
    if (savedData.type !== "tenant")
      throw new HttpError("Invalid OTP type", 400);

    const tenantId = uuidv4();
    const tenant = await this._tenantRepo.createTenant({ ...savedData.data, tenantId });

    return {
      tenantId: tenant.tenantId,
      contactEmail: tenant.contactEmail,
      state: tenant.status,
    };
  }

  async rejectTenant(tenantId: string): Promise<void> {
    const tenant = await this._tenantRepo.getTenantByTenantId(tenantId);
    if (!tenant)
      throw new HttpError("Tenant not found", STATUS_CODES.NOT_FOUND);

    if (tenant.status === TenantStatus.REJECTED)
      throw new HttpError("Tenant already rejected", STATUS_CODES.CONFLICT);

    await this._tenantRepo.updateTenant(tenantId, { status: TenantStatus.REJECTED });
  }

  async getRejectedTenants(options?: PaginationOptions): Promise<PaginatedResponse<TenantResponseDTO>> {
    const { data, total } = await this._tenantRepo.getTenantsByStatus(
      TenantStatus.REJECTED,
      options,
    );

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data: TenantMapper.toDTOs(data),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
