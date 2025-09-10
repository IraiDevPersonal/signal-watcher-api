type CacheKey = (string | undefined)[];

// implementacion para caching de datos en memoria (posibilidad de implementar redis desde aqui)
export class MemoryCache {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  private buildKey = (cacheKey: CacheKey) => {
    return cacheKey
      .filter((c) => c !== undefined)
      .map(String)
      .join("-");
  };

  set(key: CacheKey, data: any, ttlSeconds: number = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(this.buildKey(key), { data, expiresAt });
  }

  get<T>(key: CacheKey): T | null {
    const entry = this.cache.get(this.buildKey(key));

    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(this.buildKey(key));
      return null;
    }

    return entry.data as T;
  }

  del(key: CacheKey) {
    for (const k of this.cache.keys()) {
      if (k.includes(this.buildKey(key))) {
        this.cache.delete(k);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
