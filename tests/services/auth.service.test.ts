import "reflect-metadata";

import { AuthService } from "@/services/auth/auth.service";
import { HttpError } from "@/utils/http-error-class";

jest.mock("uuid", () => ({ v4: () => "uuid" }));

describe("authService", () => {
  let authService: AuthService;
  let mockUserRepo: any;
  let mockTenantRepo: any;
  let mockOtpService: any;
  let mockTokenRepo: any;
  let mockRedisClient: any;
  let mockAuthHelper: any;

  beforeEach(() => {
    mockUserRepo = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };
    mockTenantRepo = {
      getTenantByEmail: jest.fn(),
      getTenantByTenantId: jest.fn(),
      createTenant: jest.fn(),
      updateTenant: jest.fn(),
    };
    mockOtpService = {
      generateOTPForTenant: jest.fn(),
      verifyOtp: jest.fn(),
      generateOTP: jest.fn(),
    };
    mockTokenRepo = {
      create: jest.fn(),
      findByToken: jest.fn(),
      revoke: jest.fn(),
      deleteAllTokens: jest.fn(),
    };
    mockRedisClient = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    mockAuthHelper = {
      hashPassword: jest.fn(),
      validatePassword: jest.fn(),
      createJwtPayload: jest.fn(),
      generateTokens: jest.fn(),
      decodeToken: jest.fn(),
    };

    authService = new AuthService(
      mockUserRepo,
      mockTenantRepo,
      mockOtpService,
      mockTokenRepo,
      mockRedisClient,
      mockAuthHelper,
    );
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const mockUser = {
        _id: "userId",
        email: "test@example.com",
        password: "hashedPassword",
        role: "PLATFORM_ADMIN",
        tenantId: "tenantId",
      };
      mockUserRepo.getUserByEmail.mockResolvedValue(mockUser);
      mockAuthHelper.validatePassword.mockResolvedValue(true);
      mockAuthHelper.createJwtPayload.mockReturnValue({ sub: "userId" });
      mockAuthHelper.generateTokens.mockReturnValue({
        accessToken: "access",
        refreshToken: "refresh",
      });
      mockAuthHelper.decodeToken.mockReturnValue({ exp: 1234567890 });

      const result = await authService.login({
        email: "test@example.com",
        password: "password",
      });

      expect(mockUserRepo.getUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockAuthHelper.validatePassword).toHaveBeenCalledWith(
        "password",
        "hashedPassword",
      );
      expect(mockTokenRepo.create).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: "access", refreshToken: "refresh" });
    });

    it("should throw error if user not found", async () => {
      mockUserRepo.getUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "test@example.com", password: "password" }),
      ).rejects.toThrow(HttpError);
    });

    it("should throw error if password invalid", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
        role: "PLATFORM_ADMIN",
      };
      mockUserRepo.getUserByEmail.mockResolvedValue(mockUser);
      mockAuthHelper.validatePassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: "test@example.com", password: "password" }),
      ).rejects.toThrow(HttpError);
    });

    it("should throw if non-admin user has no tenantId", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
        role: "DRIVER",
        tenantId: null,
      };
      mockUserRepo.getUserByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login({ email: "test@example.com", password: "password" }),
      ).rejects.toThrow("Tenant ID missing for non-admin user");
    });

    it("should throw if non-admin user's tenant is not active", async () => {
      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword",
        role: "DRIVER",
        tenantId: "tid",
      };
      mockUserRepo.getUserByEmail.mockResolvedValue(mockUser);
      mockTenantRepo.getTenantByTenantId.mockResolvedValue(null);

      await expect(
        authService.login({ email: "test@example.com", password: "password" }),
      ).rejects.toThrow("Tenant not active");
    });

    it("should login successfully as non-admin with valid tenant", async () => {
      const mockUser = {
        _id: "userId",
        email: "driver@example.com",
        password: "hashedPassword",
        role: "DRIVER",
        tenantId: "tid",
      };
      mockUserRepo.getUserByEmail.mockResolvedValue(mockUser);
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "ACTIVE" });
      mockAuthHelper.validatePassword.mockResolvedValue(true);
      mockAuthHelper.createJwtPayload.mockReturnValue({ sub: "userId" });
      mockAuthHelper.generateTokens.mockReturnValue({ accessToken: "access", refreshToken: "refresh" });
      mockAuthHelper.decodeToken.mockReturnValue({ exp: 1234567890 });

      const result = await authService.login({ email: "driver@example.com", password: "password" });

      expect(mockTenantRepo.getTenantByTenantId).toHaveBeenCalledWith("tid");
      expect(result).toEqual({ accessToken: "access", refreshToken: "refresh" });
    });
  });

  describe("registerTenant", () => {
    it("should register tenant successfully", async () => {
      mockTenantRepo.getTenantByEmail.mockResolvedValue(null);

      await authService.registerTenant({ contactEmail: "test@fleet.com" } as any);

      expect(mockTenantRepo.getTenantByEmail).toHaveBeenCalledWith("test@fleet.com");
      expect(mockOtpService.generateOTPForTenant).toHaveBeenCalled();
    });

    it("should throw if tenant exists", async () => {
      mockTenantRepo.getTenantByEmail.mockResolvedValue({} as any);

      await expect(authService.registerTenant({ contactEmail: "test@fleet.com" } as any))
        .rejects
        .toThrow(HttpError);
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens successfully", async () => {
      const mockDecoded = { sub: "userId", exp: 1234567890 };
      const mockStoredToken = { revoked: false, save: jest.fn(), user: "userId" };

      mockAuthHelper.decodeToken.mockReturnValue(mockDecoded);
      mockTokenRepo.findByToken.mockResolvedValue(mockStoredToken);
      mockAuthHelper.createJwtPayload.mockReturnValue({ sub: "userId" });
      mockAuthHelper.generateTokens.mockReturnValue({
        accessToken: "newAccess",
        refreshToken: "newRefresh",
      });

      const result = await authService.refreshToken("validRefreshToken");

      expect(mockAuthHelper.decodeToken).toHaveBeenCalledWith("validRefreshToken");
      expect(mockTokenRepo.findByToken).toHaveBeenCalledWith("validRefreshToken");
      expect(mockStoredToken.save).toHaveBeenCalled(); // revoked = true
      expect(result).toEqual({ accessToken: "newAccess", refreshToken: "newRefresh" });
    });

    it("should throw if token is revoked", async () => {
      const mockDecoded = { sub: "userId" };
      const mockStoredToken = { revoked: true, user: "userId" };

      mockAuthHelper.decodeToken.mockReturnValue(mockDecoded);
      mockTokenRepo.findByToken.mockResolvedValue(mockStoredToken);

      await expect(authService.refreshToken("revokedToken")).rejects.toThrow(HttpError);
      expect(mockTokenRepo.deleteAllTokens).toHaveBeenCalledWith("userId");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      mockTokenRepo.findByToken.mockResolvedValue({});

      await authService.logout("token", "userId");

      expect(mockTokenRepo.revoke).toHaveBeenCalledWith({ token: "token", user: "userId" });
    });

    it("should do nothing if token not found", async () => {
      mockTokenRepo.findByToken.mockResolvedValue(null);
      await authService.logout("token", "userId");
      expect(mockTokenRepo.revoke).not.toHaveBeenCalled();
    });
  });

  describe("verifyTenantByAdmin", () => {
    it("should verify tenant successfully", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "PENDING" });
      mockTenantRepo.updateTenant.mockResolvedValue({});

      const result = await authService.verifyTenantByAdmin("tenantId");

      expect(mockTenantRepo.updateTenant).toHaveBeenCalledWith("tenantId", { status: "ACTIVE" });
      expect(result).toHaveProperty("tenantLink");
    });

    it("should throw if tenant not found", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue(null);
      await expect(authService.verifyTenantByAdmin("tenantId")).rejects.toThrow("Tenant not found");
    });

    it("should throw if tenant already active", async () => {
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "ACTIVE" });
      await expect(authService.verifyTenantByAdmin("tenantId")).rejects.toThrow("Tenant already active");
    });
  });

  describe("verifyTenantRegisteration", () => {
    it("should verify and create tenant", async () => {
      mockOtpService.verifyOtp.mockResolvedValue({ type: "tenant", data: { contactEmail: "test@test.com" } });
      mockTenantRepo.createTenant.mockResolvedValue({ tenantId: "tid", contactEmail: "test@test.com", status: "PENDING" });

      const result = await authService.verifyTenantRegisteration({ otp: "123" } as any);

      expect(mockTenantRepo.createTenant).toHaveBeenCalled();
      expect(result.tenantId).toBe("tid");
    });

    it("should throw if invalid otp type", async () => {
      mockOtpService.verifyOtp.mockResolvedValue({ type: "user" });
      await expect(authService.verifyTenantRegisteration({ otp: "123" } as any)).rejects.toThrow("Invalid OTP type");
    });
  });

  describe("registerTenantAdmin", () => {
    it("should register tenant admin", async () => {
      mockUserRepo.getUserByEmail.mockResolvedValue(null);
      mockTenantRepo.getTenantByTenantId.mockResolvedValue({ status: "ACTIVE" });
      mockAuthHelper.hashPassword.mockResolvedValue("hashed");

      await authService.registerTenantAdmin({ email: "admin@test.com", tenantId: "tid", password: "pass" } as any);

      expect(mockOtpService.generateOTP).toHaveBeenCalled();
    });

    it("should throw if user exists", async () => {
      mockUserRepo.getUserByEmail.mockResolvedValue({});
      await expect(authService.registerTenantAdmin({ email: "admin@test.com" } as any)).rejects.toThrow(HttpError);
    });

    it("should throw if tenant not active", async () => {
      mockUserRepo.getUserByEmail.mockResolvedValue(null);
      mockTenantRepo.getTenantByTenantId.mockResolvedValue(null);
      await expect(authService.registerTenantAdmin({ email: "admin@test.com", tenantId: "tid" } as any)).rejects.toThrow("Tenant not active");
    });
  });

  describe("verifyAndRegister", () => {
    it("should verify and register user", async () => {
      mockOtpService.verifyOtp.mockResolvedValue({ type: "user", data: {} });
      mockUserRepo.createUser.mockResolvedValue({ _id: "uid", email: "e@e.com", role: "admin" });

      const result = await authService.verifyAndRegister({ otp: "123" } as any);

      expect(mockUserRepo.createUser).toHaveBeenCalled();
      expect(result.id).toBe("uid");
    });

    it("should throw if invalid otp type", async () => {
      mockOtpService.verifyOtp.mockResolvedValue({ type: "tenant" });
      await expect(authService.verifyAndRegister({ otp: "123" } as any)).rejects.toThrow("Invalid OTP type");
    });
  });

  describe("createInternalUser", () => {
    it("should create internal user and set invite", async () => {
      mockUserRepo.getUserByEmail.mockResolvedValue(null);
      mockUserRepo.createUser.mockResolvedValue({ _id: "uid" });

      await authService.createInternalUser({ email: "new@test.com" } as any, "tid");

      expect(mockUserRepo.createUser).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalled();
    });
  });

  describe("setPasswordFromInvite", () => {
    it("should set password from invite", async () => {
      mockRedisClient.get.mockResolvedValue("uid");
      mockAuthHelper.hashPassword.mockResolvedValue("hashed");

      await authService.setPasswordFromInvite({ token: "tok", password: "pass" } as any);

      expect(mockUserRepo.updateUser).toHaveBeenCalledWith("uid", { password: "hashed" });
      expect(mockRedisClient.del).toHaveBeenCalled();
    });

    it("should throw if invalid token", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      await expect(authService.setPasswordFromInvite({ token: "tok" } as any)).rejects.toThrow("Invalid or expired invite token");
    });
  });

  describe("logoutAllSessions", () => {
    it("should delete all tokens", async () => {
      await authService.logoutAllSessions("uid");
      expect(mockTokenRepo.deleteAllTokens).toHaveBeenCalledWith("uid");
    });
  });
});
