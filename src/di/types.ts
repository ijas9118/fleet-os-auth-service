const TYPES = {
  AuthController: Symbol.for("AuthController"),
  TenantController: Symbol.for("TenantController"),
  UserController: Symbol.for("UserController"),
  OperationsManagerController: Symbol.for("OperationsManagerController"),
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  OperationsManagerService: Symbol.for("OperationsManagerService"),
  UserRepository: Symbol.for("UserRepository"),
  TenantRepository: Symbol.for("TenantRepository"),
  TokenRepository: Symbol.for("TokenRepository"),
  OtpService: Symbol.for("OtpService"),
  RedisClient: Symbol.for("RedisClient"),
  AuthHelper: Symbol.for("AuthHelper"),
  TenantService: Symbol.for("TenantService"),
};

export default TYPES;
