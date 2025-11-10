const TYPES = {
  AuthController: Symbol.for("AuthController"),
  AuthService: Symbol.for("AuthService"),
  UserRepository: Symbol.for("UserRepository"),
  TokenRepository: Symbol.for("TokenRepository"),
  OtpService: Symbol.for("OtpService"),
  RedisClient: Symbol.for("RedisClient"),
};

export default TYPES;
