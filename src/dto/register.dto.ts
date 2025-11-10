import z from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine(val => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
    .refine(val => /\d/.test(val), { message: "Password must contain at least one number" }),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
