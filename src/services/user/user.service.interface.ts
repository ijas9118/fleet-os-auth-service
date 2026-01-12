import type { UserListItemDTO } from "@/dto/user-list.dto";
import type { PaginatedResponse } from "@/types";

export interface IUserService {
  getAllUsers: (
    filters?: {
      role?: string;
      tenantId?: string;
      isActive?: boolean;
      search?: string;
    },
    page?: number,
    limit?: number,
  ) => Promise<PaginatedResponse<UserListItemDTO>>;

  blockUser: (userId: string) => Promise<void>;

  unblockUser: (userId: string) => Promise<void>;

  markUserOnboardingComplete: (userId: string) => Promise<void>;
}
