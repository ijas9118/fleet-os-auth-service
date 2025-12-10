export const MESSAGES = {
  AUTH: {
    TENANT_REGISTER_SUCCESS: "Tenant registered successfully.",
    USER_REGISTER_SUCCESS: "User registered successfully.",
    LOGIN_SUCCESS: "User logged in successfully.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    TENANT_ALREADY_EXISTS: "Tenant already registered.",
    EMAIL_ALREADY_EXISTS: "Email already registered.",
    LOGOUT_SUCCESS: "Logged out successfully",
    LOGOUT_ALL_SUCCESS: "Logged out from all sessions successfully",
    INVITE_REQUEST_SENT: "Invitation has been sent",
  },
  TOKEN: {
    EXPIRED: "Access token expired.",
    INVALID_REFRESH_TOKEN: "Invalid or expired refresh token.",
    NEW_TOKENS: "New tokens generated",
  },
  OTP: {
    SENT: "OTP sent to your email.",
    INVALID: "Invalid OTP.",
    EXPIRED: "OTP expired or not found.",
  },
  ERROR: {
    INTERNAL_SERVER_ERROR: "Something went wrong, please try again later.",
    TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
    BAD_REQUEST: "Invalid request parameters.",
    NOT_FOUND: "Resource not found.",
  },
} as const;
