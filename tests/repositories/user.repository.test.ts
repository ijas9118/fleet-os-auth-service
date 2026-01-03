import "reflect-metadata";

import User from "@/models/user.model";
import { UserRepository } from "@/repositories/user/user.repository";

jest.mock("@/models/user.model");

describe("userRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    jest.clearAllMocks();
  });

  describe("getUserByEmail", () => {
    it("should return user if found", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.getUserByEmail("test@example.com");

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(result).toEqual(mockUser);
    });

    it("should return null if not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserByEmail("notfound@example.com");

      expect(User.findOne).toHaveBeenCalledWith({ email: "notfound@example.com" });
      expect(result).toBeNull();
    });
  });

  describe("getUserById", () => {
    it("should return user if found", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userRepository.getUserById("123");

      expect(User.findById).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockUser);
    });

    it("should return null if not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.getUserById("invalid-id");

      expect(User.findById).toHaveBeenCalledWith("invalid-id");
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create and return the user", async () => {
      const mockData = { email: "new@example.com", password: "hashed_password" };
      const mockSavedUser = { ...mockData, _id: "123" };

      // Mock the constructor and save method
      const mockUserInstance = {
        save: jest.fn().mockResolvedValue(mockSavedUser),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUserInstance);

      const result = await userRepository.createUser(mockData);

      expect(User).toHaveBeenCalledWith(mockData);
      expect(mockUserInstance.save).toHaveBeenCalled();
      expect(result).toEqual(mockSavedUser);
    });
  });

  describe("updateUser", () => {
    it("should update and return the user", async () => {
      const mockData = { role: "PLATFORM_ADMIN" } as any;
      const mockUpdatedUser = { _id: "123", ...mockData };

      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await userRepository.updateUser("123", mockData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("123", mockData, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should return null if user to update is not found", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await userRepository.updateUser("invalid", {});

      expect(result).toBeNull();
    });
  });

  describe("getUsersByTenantAndRole", () => {
    it("should return users matching tenant and role", async () => {
      const mockUsers = [{ _id: "123", tenantId: "tid", role: "role" }];
      (User.find as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userRepository.getUsersByTenantAndRole("tid", "role");

      expect(User.find).toHaveBeenCalledWith({ tenantId: "tid", role: "role" });
      expect(result).toEqual(mockUsers);
    });
  });
});
