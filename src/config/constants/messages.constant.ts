export const MESSAGES = {
  REGISTER_SUCCESS: "User registered successfully.",
  LOGIN_SUCCESS: "User logged in successfully.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_ALREADY_EXISTS: "Email already registered.",
  UNAUTHORIZED: "Unauthorized access.",
  TOKEN_EXPIRED: "Access token expired.",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token.",
  INTERNAL_SERVER_ERROR: "Something went wrong, please try again later.",
  TOO_MANY_REQUESTS: "Too many requests. Please try again later.",
  BAD_REQUEST: "Invalid request parameters.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
} as const;
