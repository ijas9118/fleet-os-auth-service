import { z } from "zod";

export const ChangeStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  reason: z.string().optional(),
});

export type ChangeStatusDTO = z.infer<typeof ChangeStatusSchema>;
