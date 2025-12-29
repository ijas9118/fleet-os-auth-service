import "reflect-metadata";

import Tenant from "@/models/tenant.model";
import { TenantRepository } from "@/repositories/tenant/tenant.repository";

jest.mock("@/models/tenant.model");

describe("tenantRepository", () => {
  let tenantRepository: TenantRepository;

  beforeEach(() => {
    tenantRepository = new TenantRepository();
    jest.clearAllMocks();
  });

  describe("getTenantByEmail", () => {
    it("should return tenant if found", async () => {
      const mockTenant = { _id: "123", contactEmail: "test@example.com" };
      (Tenant.findOne as jest.Mock).mockResolvedValue(mockTenant);

      const result = await tenantRepository.getTenantByEmail("test@example.com");

      expect(Tenant.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(result).toEqual(mockTenant);
    });

    it("should return null if not found", async () => {
      (Tenant.findOne as jest.Mock).mockResolvedValue(null);
      const result = await tenantRepository.getTenantByEmail("notfound@example.com");
      expect(result).toBeNull();
    });
  });

  describe("getTenantByTenantId", () => {
    it("should return tenant if found", async () => {
      const mockTenant = { _id: "123", tenantId: "tid" };
      (Tenant.findOne as jest.Mock).mockResolvedValue(mockTenant);

      const result = await tenantRepository.getTenantByTenantId("tid");

      expect(Tenant.findOne).toHaveBeenCalledWith({ tenantId: "tid" });
      expect(result).toEqual(mockTenant);
    });
  });

  describe("createTenant", () => {
    it("should create and return tenant", async () => {
      const mockData = { contactEmail: "new@example.com" };
      const mockSavedTenant = { ...mockData, _id: "123" };

      const mockTenantInstance = {
        save: jest.fn().mockResolvedValue(mockSavedTenant),
      };
      (Tenant as unknown as jest.Mock).mockImplementation(() => mockTenantInstance);

      const result = await tenantRepository.createTenant(mockData);

      expect(Tenant).toHaveBeenCalledWith(mockData);
      expect(mockTenantInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedTenant);
    });
  });

  describe("updateTenant", () => {
    it("should update and return tenant", async () => {
      const mockData = { status: "ACTIVE" } as any;
      const mockUpdatedTenant = { tenantId: "tid", ...mockData };

      (Tenant.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedTenant);

      const result = await tenantRepository.updateTenant("tid", mockData);

      expect(Tenant.findOneAndUpdate).toHaveBeenCalledWith({ tenantId: "tid" }, mockData, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(mockUpdatedTenant);
    });
  });
});
