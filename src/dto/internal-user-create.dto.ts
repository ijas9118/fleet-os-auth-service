import { UserRole } from "@ahammedijas/fleet-os-shared";
import z from "zod";

export const InternalUserCreateSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  role: z.enum(UserRole),
});

export type InternalUserCreateDTO = z.infer<typeof InternalUserCreateSchema>;
