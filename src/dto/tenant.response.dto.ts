import { TenantStatus } from "@ahammedijas/fleet-os-shared";

export interface TenantResponseDTO {
  tenantId: string;
  name: string;
  contactEmail: string;
  industry?: string;
  contactPhone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  status: TenantStatus;
  createdAt: Date;
}
