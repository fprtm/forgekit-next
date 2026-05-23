import { mock } from "bun:test";

// Mock server-only globally so it doesn't throw when Next.js files are imported in tests
mock.module("server-only", () => ({}));
