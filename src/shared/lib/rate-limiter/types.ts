export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface IRateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}
