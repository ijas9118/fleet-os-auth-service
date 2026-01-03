import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { TenantResponseDTO } from "@/dto/tenant.response.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { PaginationOptions } from "@/repositories/tenant/tenant.repository.interface";

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ITenantService {
  getTenants: (options?: PaginationOptions) => Promise<PaginatedResponse<TenantResponseDTO>>;
  getPendingTenants: (options?: PaginationOptions) => Promise<PaginatedResponse<TenantResponseDTO>>;
  verifyTenantByAdmin: (tenantId: string) => Promise<{ tenantLink: string }>;
  registerTenant: (data: TenantRegisterDTO) => Promise<void>;
  verifyTenantRegisteration: (data: VerifyOtpDTO) => Promise<any>;
  rejectTenant: (tenantId: string) => Promise<void>;
  getRejectedTenants: (options?: PaginationOptions) => Promise<PaginatedResponse<TenantResponseDTO>>;
}
