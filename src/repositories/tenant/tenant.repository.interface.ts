import type { ITenant } from "@/models/tenant.model";

export interface ITenantRepository {
  getTenantByEmail: (email: string) => Promise<ITenant | null>;

  getTenantByTenantId: (tenantId: string) => Promise<ITenant | null>;

  createTenant: (data: Partial<ITenant>) => Promise<ITenant>;

  updateTenant: (id: string, data: Partial<ITenant>) => Promise<ITenant | null>;

  getTenantsByStatus: (status: string) => Promise<ITenant[]>;

  getTenantsExcludingStatus: (status: string) => Promise<ITenant[]>;
}
