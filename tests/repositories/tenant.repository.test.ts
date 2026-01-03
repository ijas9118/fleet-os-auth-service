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

      expect(Tenant.findOne).toHaveBeenCalledWith({ contactEmail: "test@example.com" });
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

  describe("getTenantsByStatus", () => {
    it("should return paginated tenants with default options", async () => {
      const mockTenants = [{ _id: "1" }, { _id: "2" }];
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTenants),
      };
      (Tenant.find as jest.Mock).mockReturnValue(mockFind);
      (Tenant.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await tenantRepository.getTenantsByStatus("ACTIVE");

      expect(Tenant.find).toHaveBeenCalledWith({ status: "ACTIVE" });
      expect(mockFind.skip).toHaveBeenCalledWith(0);
      expect(mockFind.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({ data: mockTenants, total: 2 });
    });

    it("should apply search query if provided", async () => {
      const mockTenants = [{ _id: "1", companyName: "Fleet" }];
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTenants),
      };
      (Tenant.find as jest.Mock).mockReturnValue(mockFind);
      (Tenant.countDocuments as jest.Mock).mockResolvedValue(1);

      await tenantRepository.getTenantsByStatus("ACTIVE", { search: "Fleet", page: 1, limit: 10 });

      const expectedQuery = {
        status: "ACTIVE",
        $or: [
          { companyName: { $regex: "Fleet", $options: "i" } },
          { contactEmail: { $regex: "Fleet", $options: "i" } },
          { contactPerson: { $regex: "Fleet", $options: "i" } },
        ],
      };
      expect(Tenant.find).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe("getTenantsExcludingStatus", () => {
    it("should exclude single status", async () => {
      const mockTenants = [{ _id: "1" }];
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTenants),
      };
      (Tenant.find as jest.Mock).mockReturnValue(mockFind);
      (Tenant.countDocuments as jest.Mock).mockResolvedValue(1);

      await tenantRepository.getTenantsExcludingStatus("REJECTED");

      expect(Tenant.find).toHaveBeenCalledWith({ status: { $ne: "REJECTED" } });
    });

    it("should exclude multiple statuses", async () => {
      const mockTenants = [{ _id: "1" }];
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTenants),
      };
      (Tenant.find as jest.Mock).mockReturnValue(mockFind);
      (Tenant.countDocuments as jest.Mock).mockResolvedValue(1);

      await tenantRepository.getTenantsExcludingStatus(["REJECTED", "PENDING"]);

      expect(Tenant.find).toHaveBeenCalledWith({ status: { $nin: ["REJECTED", "PENDING"] } });
    });

    it("should apply search query", async () => {
      const mockTenants = [{ _id: "1" }];
      const mockFind = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockTenants),
      };
      (Tenant.find as jest.Mock).mockReturnValue(mockFind);
      (Tenant.countDocuments as jest.Mock).mockResolvedValue(1);

      await tenantRepository.getTenantsExcludingStatus("REJECTED", { search: "test" });

      const expectedQuery = {
        status: { $ne: "REJECTED" },
        $or: [
          { companyName: { $regex: "test", $options: "i" } },
          { contactEmail: { $regex: "test", $options: "i" } },
          { contactPerson: { $regex: "test", $options: "i" } },
        ],
      };

      expect(Tenant.find).toHaveBeenCalledWith(expectedQuery);
    });
  });
});
