import type { Role } from "@ahammedijas/fleet-os-shared";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};
