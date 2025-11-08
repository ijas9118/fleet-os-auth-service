import { injectable } from "inversify";

import type { IUser } from "@/models/user.model";

import User from "@/models/user.model";

import type { IUserRepository } from "./user.repository.interface";

@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }
}
