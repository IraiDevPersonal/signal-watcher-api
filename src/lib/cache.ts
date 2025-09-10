// implementacion para caching de datos en memoria (posibilidad de implementar redis desde aqui)
type MemoryCacheImpl = {
  clear(): void;
  del(key: string): void;
  get<T>(key: string): T | null;
  delByPrefix(prefix: string): void;
  set(key: string, data: any, ttlSeconds: number): void;
  buildCacheKey(key: string, value: string[], type: "list" | "unique"): string;
};

export class MemoryCache implements MemoryCacheImpl {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  set(key: string, data: any, ttlSeconds: number = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.del(key);
      return null;
    }

    return entry.data as T;
  }

  del(key: string) {
    this.cache.delete(key);
  }

  delByPrefix(prefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.del(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }

  buildCacheKey(key: string, value: string[], type: "list" | "unique" = "unique"): string {
    return [`${key}:${type}`, value.join("-")].filter(Boolean).join(":");
  }
}

export const memoryCache = new MemoryCache();
