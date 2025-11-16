import type { Role } from "@/config/constants/roles.constant";

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
