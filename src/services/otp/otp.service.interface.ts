import type { GenerateOtpDTO } from "@/dto/generate-otp.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";

export type IOtpService = {
  /**
   * Generate and store OTP securely in Redis with TTL.
   * The user’s registration data is temporarily stored until verification.
   */
  generateOTP: (data: GenerateOtpDTO) => any;

  /**
   * Verify OTP stored in Redis. Returns user data if valid.
   * Deletes OTP entry upon successful verification.
   */
  verifyOtp: (data: VerifyOtpDTO) => any;

  /**
   * Resends OTP and overwrite the otp in Redis.
   */
  resendOTP: (email: string) => Promise<void>;
};
