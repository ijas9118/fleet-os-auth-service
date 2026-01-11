import type { DriverListItemDTO } from "@/dto/driver-list.dto";
import type { PaginatedResponse } from "@/types";

export interface IDriverService {
  listDrivers: (
    filters?: {
      tenantId?: string;
      status?: "active" | "blocked" | "all";
      search?: string;
    },
    page?: number,
    limit?: number,
  ) => Promise<PaginatedResponse<DriverListItemDTO>>;

  blockDriver: (userId: string, reason?: string) => Promise<void>;

  unblockDriver: (userId: string, reason?: string) => Promise<void>;
}
