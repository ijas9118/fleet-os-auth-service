jest.mock("@/config/logger", () => ({
  warn: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock("@/config/redis.config", () => ({
  initRedisClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("@/config/validate-env", () => ({
  NODE_ENV: "development",
}));
