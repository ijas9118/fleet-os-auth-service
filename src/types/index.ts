import type { Role } from "@ahammedijas/fleet-os-shared";

export type JWTPayload = {
  sub: string;
  email: string;
  role: Role;
  exp?: number;
};

export type StoredOtp = {
  name: string;
  email: string;
  password: string;
  otp: string;
};
