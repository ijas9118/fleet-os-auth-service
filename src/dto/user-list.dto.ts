import type { UserRole } from "@ahammedijas/fleet-os-shared";

import { z } from "zod";

export interface UserListItemDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export const UserListQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  role: z.string().optional(),
  tenantId: z.string().optional(),
  isActive: z.string().optional(),
  search: z.string().optional(),
});

export type UserListQueryDTO = z.infer<typeof UserListQuerySchema>;
