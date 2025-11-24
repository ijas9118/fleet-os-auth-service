import type { AuthTokens, AuthUser } from "@/dto/auth.response.dto";
import type { InternalUserCreateDTO } from "@/dto/internal-user-create.dto";
import type { LoginDTO } from "@/dto/login.dto";
import type { RegisterDTO } from "@/dto/register.dto";
import type { VerifyOtpDTO } from "@/dto/verify-otp.dto";

export type IAuthService = {
  /**
   * Starts the user registration process by validating email uniqueness
   * and generating an OTP. The OTP must be sent to the user for email
   * verification before the account is created.
   *
   * @param data - User-provided registration details.
   * @returns A promise that resolves when the OTP has been generated and stored.
   * @throws HttpError if email already exists or OTP storage fails.
   */
  register: (data: RegisterDTO) => Promise<void>;

  /**
   * Verifies a submitted OTP and, upon success, creates the user account
   * using the data previously stored during registration.
   *
   * @param data - Email and OTP submitted for verification.
   * @returns The newly created user object.
   * @throws HttpError if the OTP is invalid or expired.
   */
  verifyAndRegister: (data: VerifyOtpDTO) => Promise<AuthUser>;

  /**
   * Authenticates a user by validating their credentials and generating
   * a new access and refresh token pair.
   *
   * @param data - User login credentials.
   * @returns An access token and refresh token for the authenticated user.
   * @throws HttpError if the credentials are invalid.
   */
  login: (data: LoginDTO) => Promise<AuthTokens>;

  /**
   * Refreshes authentication tokens using a valid, non-revoked refresh token.
   * The old refresh token is revoked, and a new token pair is returned.
   *
   * @param token - The refresh token provided by the client.
   * @returns A new access token and refresh token pair.
   * @throws HttpError if the refresh token is invalid, expired, or revoked.
   */
  refreshToken: (token: string) => Promise<AuthTokens>;

  /**
   * Logs the user out from the current session by revoking the provided
   * refresh token. Does nothing if the token is not found.
   *
   * @param token - The refresh token to revoke.
   * @param user - The unique id of user.
   * @returns A promise that resolves once the token is revoked.
   * @throws HttpError if token parsing fails.
   */
  logout: (token: string, user: string) => Promise<void>;

  /**
   * Logs the user out from all devices by revoking all stored refresh tokens
   * associated with the given user ID.
   *
   * @param userId - ID of the user whose sessions must be cleared.
   * @returns A promise that resolves once all tokens are revoked.
   */
  logoutAllSessions: (userId: string) => Promise<void>;

  /**
   * Creates an internal user (such as an manager or staff member).
   * No password is set at creation time; instead, an invitation token is
   * generated and stored. The token must later be used to set the user's
   * initial password through the invite acceptance flow.
   *
   * @param data - Information required to create the internal user.
   * @returns A promise that resolves once the user is created and the invite token is stored.
   * @throws HttpError if a user with the same email already exists.
   */
  createInternalUser: (data: InternalUserCreateDTO) => Promise<void>;

  /**
   * Completes the internal user onboarding process by validating an invitation
   * token and setting the user's password.
   * If the token is valid, the associated user’s password is updated and the
   * invitation token is deleted to prevent reuse.
   *
   * @param data - Contains the invite token and the new password to set.
   * @returns A promise that resolves once the password has been successfully set.
   * @throws HttpError if the token is invalid or expired.
   */
  setPasswordFromInvite: (data: { token: string; password: string }) => Promise<void>;
};
