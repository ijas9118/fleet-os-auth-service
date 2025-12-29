import "reflect-metadata";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

import type { IUser } from "@/models/user.model";

import { AuthHelper } from "@/services/auth/auth.helper";
import { HttpError } from "@/utils/http-error-class";

jest.mock("jsonwebtoken");
jest.mock("argon2");

describe("authHelper", () => {
  let authHelper: AuthHelper;

  beforeEach(() => {
    authHelper = new AuthHelper();
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash the password", async () => {
      (argon2.hash as jest.Mock).mockResolvedValue("hashed_password");
      const result = await authHelper.hashPassword("password123");
      expect(argon2.hash).toHaveBeenCalledWith("password123", expect.any(Object));
      expect(result).toBe("hashed_password");
    });
  });

  describe("validatePassword", () => {
    it("should return true for valid password", async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      const result = await authHelper.validatePassword("password123", "hashed_password");
      expect(argon2.verify).toHaveBeenCalledWith("hashed_password", "password123");
      expect(result).toBe(true);
    });

    it("should return false for invalid password", async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      const result = await authHelper.validatePassword("wrong", "hashed_password");
      expect(result).toBe(false);
    });
  });

  describe("createJwtPayload", () => {
    it("should create payload from user", () => {
      const user = {
        _id: "123",
        role: "PLATFORM_ADMIN",
        tenantId: "tenant123",
      } as unknown as IUser;

      const payload = authHelper.createJwtPayload(user);

      expect(payload).toEqual({
        sub: "123",
        role: "PLATFORM_ADMIN",
        tenantId: "tenant123",
      });
    });
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", () => {
      (jwt.sign as jest.Mock).mockReturnValue("mock_token");
      /* eslint-disable node/no-process-env */
      process.env.JWT_ACCESS_SECRET = "access_secret";
      process.env.JWT_REFRESH_SECRET = "refresh_secret";
      process.env.JWT_ACCESS_EXPIRY = "15m";
      process.env.JWT_REFRESH_EXPIRY = "7d";

      const payload = { sub: "123", role: "admin" } as any;
      const tokens = authHelper.generateTokens(payload);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        accessToken: "mock_token",
        refreshToken: "mock_token",
      });
    });
  });

  describe("decodeToken", () => {
    it("should decode token", () => {
      const mockDecoded = { sub: "123" };
      (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);

      const result = authHelper.decodeToken("token");

      expect(jwt.decode).toHaveBeenCalledWith("token");
      expect(result).toBe(mockDecoded);
    });

    it("should throw error if token is invalid", () => {
      (jwt.decode as jest.Mock).mockReturnValue(null);
      expect(() => authHelper.decodeToken("invalid")).toThrow(HttpError);
    });
  });
});
