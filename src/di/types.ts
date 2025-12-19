const TYPES = {
  AuthController: Symbol.for("AuthController"),
  AuthService: Symbol.for("AuthService"),
  UserRepository: Symbol.for("UserRepository"),
  TenantRepository: Symbol.for("TenantRepository"),
  TokenRepository: Symbol.for("TokenRepository"),
  OtpService: Symbol.for("OtpService"),
  RedisClient: Symbol.for("RedisClient"),
  AuthHelper: Symbol.for("AuthHelper"),
};

export default TYPES;
