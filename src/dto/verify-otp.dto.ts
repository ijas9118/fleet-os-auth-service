import z from "zod";

export const VerifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().min(6, "OTP should have six characters"),
});

export type VerifyOtpDTO = z.infer<typeof VerifyOtpSchema>;
