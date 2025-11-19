import type { Role } from "@ahammedijas/fleet-os-shared";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
    }

    interface Request {
      user?: User;
    }
  }
}
