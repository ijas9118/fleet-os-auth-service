import type { RegisterDTO } from "@/dto/register.dto";
import type { IUser } from "@/models/user.model";

export type IUserRepository = {
  getUserByEmail: (email: string) => Promise<IUser | null>;
  getUserById: (id: string) => Promise<IUser | null>;
  createUser: (data: RegisterDTO) => Promise<IUser>;
};
