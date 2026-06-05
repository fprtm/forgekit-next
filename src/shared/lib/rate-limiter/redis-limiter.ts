import Redis from "ioredis";
import type { IRateLimiter, RateLimitResult } from "./types";

export class RedisRateLimiter implements IRateLimiter {
  private redis: Redis;

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowKey = `ratelimit:${key}:${Math.floor(now / this.windowMs)}`;

    const multi = this.redis.multi();
    multi.incr(windowKey);
    multi.pexpire(windowKey, this.windowMs);
    multi.ttl(windowKey);

    const execResults = await multi.exec();
    if (!execResults) return { success: true, limit: this.maxRequests, remaining: this.maxRequests - 1, reset: Date.now() + this.windowMs };

    const countEntry = execResults[0];
    const ttlEntry = execResults[2];

    const count = (countEntry?.[1] as number) ?? 1;
    const ttl = (ttlEntry?.[1] as number) ?? this.windowMs / 1000;
    const reset = now + ttl * 1000;

    if (count > this.maxRequests) {
      return { success: false, limit: this.maxRequests, remaining: 0, reset };
    }

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - count,
      reset,
    };
  }
}
