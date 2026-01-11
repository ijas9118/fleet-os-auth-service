import type { UserRole } from "@ahammedijas/fleet-os-shared";

import { z } from "zod";

export interface OperationsManagerListItemDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export const OperationsManagerListQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z.enum(["active", "blocked", "all"]).optional().default("all"),
  search: z.string().optional(),
});

export type OperationsManagerListQueryDTO = z.infer<typeof OperationsManagerListQuerySchema>;
