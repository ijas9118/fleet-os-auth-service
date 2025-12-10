import type { UserRole } from "@ahammedijas/fleet-os-shared";

import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";

export type JWTPayload = {
  sub: string;
  email: string;
  role: UserRole;
  exp?: number;
};

export type StoredOtp
  = | {
    type: "tenant";
    otp: string;
    data: TenantRegisterDTO;
  }
  | {
    type: "user";
    otp: string;
    data: {
      name: string;
      email: string;
      password: string;
      tenantId: string;
      role: UserRole;
    };
  };
