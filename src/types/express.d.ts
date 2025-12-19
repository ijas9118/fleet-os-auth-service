import type { Role } from "@ahammedijas/fleet-os-shared";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      tenantId?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
