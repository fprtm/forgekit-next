import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { IRateLimiter, RateLimitResult } from "./types";

export class UpstashRateLimiter implements IRateLimiter {
  private ratelimit: Ratelimit;

  constructor(name: string, maxRequests: number, windowMs: number) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs / 1000}s`),
      analytics: true,
      prefix: `forgekit:${name}`,
    });
  }

  async limit(key: string): Promise<RateLimitResult> {
    const result = await this.ratelimit.limit(key);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }
}
