import type { Role } from "@/config/constants/roles.constant";

export type JWTPayload = {
  sub: string;
  email: string;
  role: Role;
  exp: number;
};
