import type { OperationsManagerListItemDTO } from "@/dto/operations-manager-list.dto";
import type { PaginatedResponse } from "@/types";

export interface IOperationsManagerService {
  listOperationsManagers: (
    filters?: {
      tenantId?: string;
      status?: "active" | "blocked" | "all";
      search?: string;
    },
    page?: number,
    limit?: number,
  ) => Promise<PaginatedResponse<OperationsManagerListItemDTO>>;

  blockOperationsManager: (userId: string, reason?: string) => Promise<void>;

  unblockOperationsManager: (userId: string, reason?: string) => Promise<void>;
}
