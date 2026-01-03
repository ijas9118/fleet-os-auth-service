import "reflect-metadata";
import { TenantStatus } from "@ahammedijas/fleet-os-shared";

import { TenantMapper } from "@/mappers/tenant.mapper";

describe("tenantMapper", () => {
  const mockTenant = {
    tenantId: "tid",
    name: "Fleet Corp",
    contactEmail: "contact@fleet.com",
    industry: "Logistics",
    contactPhone: "1234567890",
    address: { city: "NY" },
    status: TenantStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: "mongoId",
  } as any;

  describe("toDTO", () => {
    it("should map tenant to DTO", () => {
      const dto = TenantMapper.toDTO(mockTenant);
      expect(dto).toEqual({
        tenantId: mockTenant.tenantId,
        name: mockTenant.name,
        contactEmail: mockTenant.contactEmail,
        industry: mockTenant.industry,
        contactPhone: mockTenant.contactPhone,
        address: mockTenant.address,
        status: mockTenant.status,
        createdAt: mockTenant.createdAt,
      });
      expect(dto).not.toHaveProperty("_id");
      expect(dto).not.toHaveProperty("updatedAt");
    });
  });

  describe("toDTOs", () => {
    it("should map array of tenants to DTOs", () => {
      const dtos = TenantMapper.toDTOs([mockTenant, mockTenant]);
      expect(dtos).toHaveLength(2);
      expect(dtos[0].tenantId).toBe(mockTenant.tenantId);
    });

    it("should return empty array for empty input", () => {
      const dtos = TenantMapper.toDTOs([]);
      expect(dtos).toEqual([]);
    });
  });
});
