import "reflect-metadata";

import RefreshToken from "@/models/refresh-token.model";
import { TokenRepository } from "@/repositories/token/token.repository";

jest.mock("@/models/refresh-token.model");

describe("tokenRepository", () => {
  let tokenRepository: TokenRepository;

  beforeEach(() => {
    tokenRepository = new TokenRepository();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create and return token", async () => {
      const mockData = { token: "abc", user: "u1" };
      const mockSavedToken = { ...mockData, _id: "123" };

      const mockTokenInstance = {
        save: jest.fn().mockResolvedValue(mockSavedToken),
      };
      (RefreshToken as unknown as jest.Mock).mockImplementation(() => mockTokenInstance);

      const result = await tokenRepository.create(mockData as any);

      expect(RefreshToken).toHaveBeenCalledWith(mockData);
      expect(mockTokenInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedToken);
    });
  });

  describe("findByToken", () => {
    it("should return token if found", async () => {
      const mockToken = { token: "abc", user: "u1" };
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(mockToken);

      const result = await tokenRepository.findByToken("abc");

      expect(RefreshToken.findOne).toHaveBeenCalledWith({ token: "abc" });
      expect(result).toEqual(mockToken);
    });
  });

  describe("revoke", () => {
    it("should revoke token", async () => {
      await tokenRepository.revoke({ token: "abc", user: "u1" });

      expect(RefreshToken.findOneAndUpdate).toHaveBeenCalledWith(
        { token: "abc", user: "u1" },
        { revoked: true },
      );
    });
  });

  describe("deleteAllTokens", () => {
    it("should delete all tokens for user", async () => {
      await tokenRepository.deleteAllTokens("u1");

      expect(RefreshToken.deleteMany).toHaveBeenCalledWith({ user: "u1" });
    });
  });
});
