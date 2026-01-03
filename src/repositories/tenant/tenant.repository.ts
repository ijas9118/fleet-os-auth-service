import { injectable } from "inversify";

import type { ITenant } from "@/models/tenant.model";

import Tenant from "@/models/tenant.model";

import type {
  ITenantRepository,
  PaginatedResult,
  PaginationOptions,
} from "./tenant.repository.interface";

@injectable()
export class TenantRepository implements ITenantRepository {
  async getTenantByEmail(email: string): Promise<ITenant | null> {
    return await Tenant.findOne({ contactEmail: email });
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

  async getTenantsByStatus(
    status: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<ITenant>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const search = options?.search || "";
    const skip = (page - 1) * limit;

    const query: any = { status };

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactEmail: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      Tenant.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Tenant.countDocuments(query),
    ]);

    return { data, total };
  }

  async getTenantsExcludingStatus(
    status: string | string[],
    options?: PaginationOptions,
  ): Promise<PaginatedResult<ITenant>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const search = options?.search || "";
    const skip = (page - 1) * limit;

    const query: any = {};

    if (Array.isArray(status)) {
      query.status = { $nin: status };
    }
    else {
      query.status = { $ne: status };
    }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactEmail: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      Tenant.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Tenant.countDocuments(query),
    ]);

    return { data, total };
  }
}
