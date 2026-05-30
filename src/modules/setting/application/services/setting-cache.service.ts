export class SettingCacheService {
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();

  /**
   * Mock cache service for Application Settings.
   * Demonstrates utilizing application services for cross-cutting non-domain concerns (performance).
   */
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

export const settingCacheService = new SettingCacheService();
