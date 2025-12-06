import z from "zod";

export const TenantAdminRegisterSchema = z.object({
  tenantId: z.string().min(1, { message: "Tenant ID is required" }),
  name: z.string().min(2, { message: "Admin name must be at least 2 characters long" }),
  email: z.email({ message: "Invalid admin email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .refine(val => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
    .refine(val => /\d/.test(val), { message: "Password must contain at least one number" }),
});

export type TenantAdminRegisterDTO = z.infer<typeof TenantAdminRegisterSchema>;
