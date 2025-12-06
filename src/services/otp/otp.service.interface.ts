import type { UserRole } from "@ahammedijas/fleet-os-shared";

import type { TenantAdminRegisterDTO } from "@/dto/tenant-admin.register.dto";
import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { StoredOtp } from "@/types";

export type IOtpService = {
  generateOTP: (data: (TenantAdminRegisterDTO & { role: UserRole })) => Promise<void>;

  generateOTPForTenant: (data: TenantRegisterDTO) => Promise<void>;

  verifyOtp: (data: VerifyOtpDTO) => Promise<StoredOtp>;

  resendOTP: (email: string) => Promise<void>;
};
