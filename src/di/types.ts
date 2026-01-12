const TYPES = {
  AuthController: Symbol.for("AuthController"),
  TenantController: Symbol.for("TenantController"),
  UserController: Symbol.for("UserController"),
  OperationsManagerController: Symbol.for("OperationsManagerController"),
  DriverController: Symbol.for("DriverController"),
  AuthService: Symbol.for("AuthService"),
  UserService: Symbol.for("UserService"),
  OperationsManagerService: Symbol.for("OperationsManagerService"),
  DriverService: Symbol.for("DriverService"),
  UserRepository: Symbol.for("UserRepository"),
  TenantRepository: Symbol.for("TenantRepository"),
  TokenRepository: Symbol.for("TokenRepository"),
  OtpService: Symbol.for("OtpService"),
  RedisClient: Symbol.for("RedisClient"),
  AuthHelper: Symbol.for("AuthHelper"),
  TenantService: Symbol.for("TenantService"),
  KafkaProducer: Symbol.for("KafkaProducer"),
  EventPublisherService: Symbol.for("EventPublisherService"),
};

export default TYPES;
