import z from "zod";

export const TenantRegisterSchema = z.object({
  name: z.string().min(2, { message: "Business name must be at least 2 characters long" }),
  industry: z.string().optional(),
  contactEmail: z.email({ message: "Invalid contact email address" }),
  contactPhone: z.string().optional(),

  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type TenantRegisterDTO = z.infer<typeof TenantRegisterSchema>;
