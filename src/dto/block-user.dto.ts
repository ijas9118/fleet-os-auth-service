import { z } from "zod";

export const BlockUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  reason: z.string().optional(),
});

export type BlockUserDTO = z.infer<typeof BlockUserSchema>;
