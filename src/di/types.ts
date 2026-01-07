const TYPES = {
  AuthController: Symbol.for("AuthController"),
  TenantController: Symbol.for("TenantController"),
  AuthService: Symbol.for("AuthService"),
  UserRepository: Symbol.for("UserRepository"),
  TenantRepository: Symbol.for("TenantRepository"),
  TokenRepository: Symbol.for("TokenRepository"),
  OtpService: Symbol.for("OtpService"),
  RedisClient: Symbol.for("RedisClient"),
  AuthHelper: Symbol.for("AuthHelper"),
  TenantService: Symbol.for("TenantService"),
};

export default TYPES;
