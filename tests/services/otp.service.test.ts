import "reflect-metadata";

import { MESSAGES } from "@/config/messages.constant";
import { OtpService } from "@/services/otp/otp.service";

describe("otpService", () => {
  let otpService: OtpService;
  let mockRedisClient: any;
  beforeEach(() => {
    mockRedisClient = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    otpService = new OtpService(mockRedisClient);
  });
  describe("generateOTP", () => {
    it("should generate and save OTP for user", async () => {
      const data = { email: "test@example.com", role: "admin", name: "Test" } as any;
      await otpService.generateOTP(data);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        expect.stringContaining("otp:test@example.com"),
        expect.any(String),
        expect.objectContaining({ expiration: expect.any(Object) }),
      );
    });
  });
  describe("generateOTPForTenant", () => {
    it("should generate and save OTP for tenant", async () => {
      const data = { contactEmail: "tenant@example.com", name: "Tenant" } as any;
      await otpService.generateOTPForTenant(data);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        expect.stringContaining("otp:tenant@example.com"),
        expect.any(String),
        expect.any(Object),
      );
    });
  });
  describe("resendOTP", () => {
    it("should resend OTP for existing tenant OTP", async () => {
      const stored = { type: "tenant", data: { contactEmail: "exist@example.com" } };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(stored));
      await otpService.resendOTP("exist@example.com");
      expect(mockRedisClient.set).toHaveBeenCalled();
    });
    it("should resend OTP for existing user OTP", async () => {
      const stored = { type: "user", data: { email: "user@example.com", role: "admin" } };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(stored));
      await otpService.resendOTP("user@example.com");
      expect(mockRedisClient.set).toHaveBeenCalled();
    });
    it("should throw if OTP expired or not found", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      await expect(otpService.resendOTP("expired@example.com")).rejects.toThrow(MESSAGES.OTP.EXPIRED);
    });
  });
  describe("verifyOtp", () => {
    it("should verify and return stored data if OTP matches", async () => {
      const stored = { otp: "123456", data: { foo: "bar" } };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(stored));
      const result = await otpService.verifyOtp({ email: "test@example.com", otp: "123456" } as any);
      expect(result).toEqual(stored);
      expect(mockRedisClient.del).toHaveBeenCalled();
    });
    it("should throw if OTP expired", async () => {
      mockRedisClient.get.mockResolvedValue(null);
      await expect(otpService.verifyOtp({ email: "test@example.com", otp: "123456" } as any)).rejects.toThrow(MESSAGES.OTP.EXPIRED);
    });
    it("should throw if OTP does not match", async () => {
      const stored = { otp: "123456" };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(stored));
      await expect(otpService.verifyOtp({ email: "test@example.com", otp: "654321" } as any)).rejects.toThrow(MESSAGES.OTP.INVALID);
    });
  });
});
