export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

export class MemoryCacheService implements ICacheService {
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();

  public async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

export const memoryCacheService = new MemoryCacheService();
