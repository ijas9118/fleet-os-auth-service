const TYPES = {
  AuthController: Symbol.for("AuthController"),
  TenantController: Symbol.for("TenantController"),
  UserController: Symbol.for("UserController"),
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  UserRepository: Symbol.for("UserRepository"),
  TenantRepository: Symbol.for("TenantRepository"),
  TokenRepository: Symbol.for("TokenRepository"),
  OtpService: Symbol.for("OtpService"),
  RedisClient: Symbol.for("RedisClient"),
  AuthHelper: Symbol.for("AuthHelper"),
  TenantService: Symbol.for("TenantService"),
};

export default TYPES;
