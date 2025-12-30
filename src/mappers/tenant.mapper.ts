import type { ITenant } from "@/models/tenant.model";
import type { TenantResponseDTO } from "@/dto/tenant.response.dto";

export class TenantMapper {
  static toDTO(tenant: ITenant): TenantResponseDTO {
    return {
      tenantId: tenant.tenantId,
      name: tenant.name,
      contactEmail: tenant.contactEmail,
      industry: tenant.industry,
      contactPhone: tenant.contactPhone,
      address: tenant.address,
      status: tenant.status,
      createdAt: tenant.createdAt,
    };
  }

  static toDTOs(tenants: ITenant[]): TenantResponseDTO[] {
    return tenants.map((tenant) => TenantMapper.toDTO(tenant));
  }
}
