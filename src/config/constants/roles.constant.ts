export const ROLES = {
  CUSTOMER: "customer",
  DRIVER: "driver",
  OPERATIONS_MANAGER: "operations_manager",
  WAREHOUSE_MANAGER: "warehouse_manager",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
