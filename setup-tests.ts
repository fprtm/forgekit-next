import { mock } from "bun:test";

// Mock server-only globally so it doesn't throw when Next.js files are imported in tests
mock.module("server-only", () => ({}));

// Mock env module so dynamic imports in event-dispatcher don't fail in Bun test env
mock.module("@/shared/config/env", () => ({
  env: {
    DATABASE_URL: "postgresql://localhost:5432/test",
    AUTH_SECRET: "test-secret",
    AUTH_GOOGLE_ID: "test",
    AUTH_GOOGLE_SECRET: "test",
    LOG_LEVEL: "info",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_ENABLE_OAUTH: "false",
  },
}));
