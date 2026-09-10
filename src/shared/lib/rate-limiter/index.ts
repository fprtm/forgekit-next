import { env } from "@/shared/config/env";
import { MemoryRateLimiter } from "./memory-limiter";
import { UpstashRateLimiter } from "./upstash-limiter";
import { RedisRateLimiter } from "./redis-limiter";
import type { IRateLimiter } from "./types";

function createLimiter(name: string, maxRequests: number, windowMs: number): IRateLimiter {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return new UpstashRateLimiter(name, maxRequests, windowMs);
  }
  if (env.REDIS_URL) {
    return new RedisRateLimiter(maxRequests, windowMs);
  }
  return new MemoryRateLimiter(maxRequests, windowMs);
}

export const loginLimiter = createLimiter("login", 5, 60_000);
export const registerLimiter = createLimiter("register", 3, 60_000);
export const impersonateLimiter = createLimiter("impersonate", 10, 60_000);
