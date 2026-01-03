import type { ITenant } from "@/models/tenant.model";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ITenantRepository {
  getTenantByEmail: (email: string) => Promise<ITenant | null>;

  getTenantByTenantId: (tenantId: string) => Promise<ITenant | null>;

  createTenant: (data: Partial<ITenant>) => Promise<ITenant>;

  updateTenant: (id: string, data: Partial<ITenant>) => Promise<ITenant | null>;

  getTenantsByStatus: (status: string, options?: PaginationOptions) => Promise<PaginatedResult<ITenant>>;

  getTenantsExcludingStatus: (
    status: string | string[],
    options?: PaginationOptions,
  ) => Promise<PaginatedResult<ITenant>>;
}
