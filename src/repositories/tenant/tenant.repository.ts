import { injectable } from "inversify";

import type { ITenant } from "@/models/tenant.model";

import Tenant from "@/models/tenant.model";

import type { ITenantRepository } from "./tenant.repository.interface";

@injectable()
export class TenantRepository implements ITenantRepository {
  async getTenantByEmail(email: string): Promise<ITenant | null> {
    return await Tenant.findOne({ email });
  }

  async getTenantByTenantId(tenantId: string): Promise<ITenant | null> {
    return await Tenant.findOne({ tenantId });
  }

  async createTenant(data: Partial<ITenant>): Promise<ITenant> {
    const tenant = new Tenant(data);
    return tenant.save();
  }

  async updateTenant(tenantId: string, data: Partial<ITenant>): Promise<ITenant | null> {
    return Tenant.findOneAndUpdate({ tenantId }, data, {
      new: true,
      runValidators: true,
    });
  }

  async getTenantsByStatus(status: string): Promise<ITenant[]> {
    return await Tenant.find({ status });
  }

  async getTenantsExcludingStatus(status: string): Promise<ITenant[]> {
    return await Tenant.find({ status: { $ne: status } });
  }
}
