import { injectable } from "inversify";

import type { RegisterDTO } from "@/dto/register.dto";
import type { IUser } from "@/models/user.model";

import User from "@/models/user.model";

import type { IUserRepository } from "./user.repository.interface";

@injectable()
export class UserRepository implements IUserRepository {
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async createUser(data: RegisterDTO): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }
}
