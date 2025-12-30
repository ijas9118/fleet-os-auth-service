import type { AuthTokens, AuthUser } from "@/dto/auth.response.dto";
import type { InternalUserCreateDTO } from "@/dto/internal-user-create.dto";
import type { LoginDTO } from "@/dto/login.dto";
import type { TenantAdminRegisterDTO } from "@/dto/tenant-admin.register.dto";
import type { TenantRegisterDTO } from "@/dto/tenant.register.dto";
import type { TenantResponseDTO } from "@/dto/tenant.response.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";

export type IAuthService = {

  registerTenant: (data: TenantRegisterDTO) => Promise<void>;

  registerTenantAdmin: (data: TenantAdminRegisterDTO) => Promise<void>;

  verifyTenantRegisteration: (data: VerifyOtpDTO) => Promise<any>;

  verifyAndRegister: (data: VerifyOtpDTO) => Promise<AuthUser>;

  login: (data: LoginDTO) => Promise<AuthTokens>;

  refreshToken: (token: string) => Promise<AuthTokens>;

  logout: (token: string, user: string) => Promise<void>;

  logoutAllSessions: (userId: string) => Promise<void>;

  createInternalUser: (data: InternalUserCreateDTO, tenantId: string) => Promise<void>;

  setPasswordFromInvite: (data: { token: string; password: string }) => Promise<void>;

  verifyTenantByAdmin: (tenantId: string) => Promise<{ tenantLink: string }>;

  getTenants: () => Promise<TenantResponseDTO[]>;

  getPendingTenants: () => Promise<TenantResponseDTO[]>;
};
