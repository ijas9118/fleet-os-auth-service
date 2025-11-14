import type { GenerateOtpDTO } from "@/dto/generate-otp.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";
import type { StoredOtp } from "@/types";

export type IOtpService = {
  /**
   * Generates a new OTP code for the given user and stores it securely
   * with a TTL. Existing OTP entries for the same user should be overwritten.
   *
   * @param data - User data required to generate the OTP.
   * @returns A promise that resolves when OTP is stored.
   * @throws HttpError if storage fails.
   */
  generateOTP: (data: GenerateOtpDTO) => Promise<void>;

  /**
   * Verifies a user-submitted OTP. If valid, returns the stored user data
   * associated with the OTP and deletes the OTP entry from storage.
   *
   * @param data - Email and OTP submitted by the user.
   * @returns The user data originally stored with the OTP.
   * @throws HttpError if OTP expired, missing, or invalid.
   */
  verifyOtp: (data: VerifyOtpDTO) => Promise<StoredOtp>;

  /**
   * Regenerates and resends a new OTP for the given email.
   * Must overwrite the previous OTP while preserving stored user data.
   *
   * @param email - Email for which OTP must be resent.
   * @returns A promise that resolves when the OTP is regenerated.
   * @throws HttpError if no previously stored session exists.
   */
  resendOTP: (email: string) => Promise<void>;
};
