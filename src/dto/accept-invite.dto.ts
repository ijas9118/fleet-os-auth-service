import z from "zod";

export const AcceptInviteSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine(val => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
    .refine(val => /\d/.test(val), { message: "Password must contain at least one number" }),
  token: z.string(),
});

export type AcceptInviteDTO = z.infer<typeof AcceptInviteSchema>;
