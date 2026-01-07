import type { UserRole } from "@ahammedijas/fleet-os-shared";

import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";

export type JWTPayload = {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
