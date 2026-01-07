import { injectable } from "inversify";

import type { IUser } from "@/models/user.model";

import User from "@/models/user.model";

import type { IUserRepository } from "./user.repository.interface";

@injectable()
export class UserRepository implements IUserRepository {
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async getUsersByTenantAndRole(tenantId: string, role: string): Promise<IUser[]> {
    return User.find({ tenantId, role });
  }

  async getAllUsers(
    filters?: {
      role?: string;
      tenantId?: string;
      isActive?: boolean;
      search?: string;
    },
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = {
      role: { $ne: "PLATFORM_ADMIN" },
    };

    if (filters?.role) {
      query.role = filters.role;
    }

    if (filters?.tenantId) {
      query.tenantId = filters.tenantId;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total };
  }
}
