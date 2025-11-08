import type { IUser } from "@/models/user.model";

export type IUserRepository = {
  findByEmail: (email: string) => Promise<IUser | null>;
  findById: (id: string) => Promise<IUser | null>;
  create: (data: Partial<IUser>) => Promise<IUser>;
};
