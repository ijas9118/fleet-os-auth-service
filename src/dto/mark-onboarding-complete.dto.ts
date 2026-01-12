import z from "zod";

export const MarkOnboardingCompleteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type MarkOnboardingCompleteDTO = z.infer<typeof MarkOnboardingCompleteSchema>;
