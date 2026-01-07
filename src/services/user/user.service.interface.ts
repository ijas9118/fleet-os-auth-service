import type { UserListItemDTO } from "@/dto/user-list.dto";
import type { PaginatedResponse } from "@/types";

export interface IUserService {
  /**
   * Get all users with optional filters and pagination
   *
   * @param filters - Optional filters (role, tenantId, isActive, search)
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated user list with metadata
   */
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
}
