import "reflect-metadata";

import { TenantService } from "@/services/tenant/tenant.service";
import { HttpError } from "@/utils/http-error-class";

jest.mock("uuid", () => ({ v4: () => "uuid" }));

describe("tenantService", () => {
  let tenantService: TenantService;
  let mockTenantRepo: any;
  let mockOtpService: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockTenantRepo = {
      getTenantByEmail: jest.fn(),
      getTenantByTenantId: jest.fn(),
      createTenant: jest.fn(),
      updateTenant: jest.fn(),
      getTenantsExcludingStatus: jest.fn(),
      getTenantsByStatus: jest.fn(),
    };
    mockOtpService = {
      generateOTPForTenant: jest.fn(),
      verifyOtp: jest.fn(),
    };
    mockUserRepo = {
      getUsersByTenantAndRole: jest.fn(),
    };

    tenantService = new TenantService(
      mockTenantRepo,
      mockOtpService,
      mockUserRepo,
    );
  });

  describe("registerTenant", () => {
    it("should register tenant successfully", async () => {
      mockTenantRepo.getTenantByEmail.mockResolvedValue(null);

      await tenantService.registerTenant({ contactEmail: "test@fleet.com" } as any);

      expect(mockTenantRepo.getTenantByEmail).toHaveBeenCalledWith("test@fleet.com");
      expect(mockOtpService.generateOTPForTenant).toHaveBeenCalled();
    });

    it("should throw if tenant exists", async () => {
      mockTenantRepo.getTenantByEmail.mockResolvedValue({} as any);

      await expect(tenantService.registerTenant({ contactEmail: "test@fleet.com" } as any))
        .rejects
        .toThrow(HttpError);
    });
  });

  describe("verifyTenantByAdmin", () => {
    it("should verify tenant successfully", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "PENDING" });
      mockTenantRepo.updateTenant.mockResolvedValue({});
      mockUserRepo.getUsersByTenantAndRole.mockResolvedValue([]);

      const result = await tenantService.verifyTenantByAdmin("tenantId");

      expect(mockTenantRepo.updateTenant).toHaveBeenCalledWith("tenantId", { status: "ACTIVE" });
      expect(result).toHaveProperty("tenantLink");
      expect(result.tenantLink).not.toBe("");
    });

    it("should return empty link if admin already exists", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "PENDING" });
      mockTenantRepo.updateTenant.mockResolvedValue({});
      mockUserRepo.getUsersByTenantAndRole.mockResolvedValue([{ id: "adminId" }]);

      const result = await tenantService.verifyTenantByAdmin("tenantId");

      expect(mockTenantRepo.updateTenant).toHaveBeenCalledWith("tenantId", { status: "ACTIVE" });
      expect(result.tenantLink).toBe("");
    });

    it("should throw if tenant not found", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue(null);
      await expect(tenantService.verifyTenantByAdmin("tenantId")).rejects.toThrow("Tenant not found");
    });

    it("should throw if tenant already active", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "ACTIVE" });
      await expect(tenantService.verifyTenantByAdmin("tenantId")).rejects.toThrow("Tenant already active");
    });
  });

  describe("verifyTenantRegisteration", () => {
    it("should verify and create tenant", async () => {
      mockOtpService.verifyOtp.mockResolvedValue({ type: "tenant", data: { contactEmail: "test@test.com" } });
      mockTenantRepo.createTenant.mockResolvedValue({ tenantId: "tid", contactEmail: "test@test.com", status: "PENDING" });

      const result = await tenantService.verifyTenantRegisteration({ otp: "123" } as any);

      expect(mockTenantRepo.createTenant).toHaveBeenCalled();
      expect(result.tenantId).toBe("tid");
    });

    it("should throw if invalid otp type", async () => {
      mockOtpService.verifyOtp.mockResolvedValue({ type: "user" });
      await expect(tenantService.verifyTenantRegisteration({ otp: "123" } as any)).rejects.toThrow("Invalid OTP type");
    });
  });

  describe("getTenants", () => {
    it("should return tenants", async () => {
      mockTenantRepo.getTenantsExcludingStatus.mockResolvedValue({ data: [], total: 0 });
      const result = await tenantService.getTenants();
      expect(result.data).toEqual([]);
      expect(mockTenantRepo.getTenantsExcludingStatus).toHaveBeenCalledWith(["PENDING_VERIFICATION", "REJECTED"], undefined);
    });
  });

  describe("getPendingTenants", () => {
    it("should return pending tenants", async () => {
      mockTenantRepo.getTenantsByStatus.mockResolvedValue({ data: [], total: 0 });
      const result = await tenantService.getPendingTenants();
      expect(result.data).toEqual([]);
    });
  });

  describe("getRejectedTenants", () => {
    it("should return rejected tenants", async () => {
      mockTenantRepo.getTenantsByStatus.mockResolvedValue({ data: [], total: 0 });
      const result = await tenantService.getRejectedTenants();
      expect(result.data).toEqual([]);
      expect(mockTenantRepo.getTenantsByStatus).toHaveBeenCalledWith("REJECTED", undefined);
    });
  });

  describe("rejectTenant", () => {
    it("should reject tenant successfully", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "PENDING" });
      mockTenantRepo.updateTenant.mockResolvedValue({});

      await tenantService.rejectTenant("tenantId");

      expect(mockTenantRepo.updateTenant).toHaveBeenCalledWith("tenantId", { status: "REJECTED" });
    });

    it("should throw if tenant not found", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue(null);
      await expect(tenantService.rejectTenant("tenantId")).rejects.toThrow("Tenant not found");
    });

    it("should throw if tenant already rejected", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "REJECTED" });
      await expect(tenantService.rejectTenant("tenantId")).rejects.toThrow("Tenant already rejected");
    });
  });
});
