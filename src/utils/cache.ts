interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  delByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  flush(): void {
    this.store.clear();
  }
}

export const cache = new SimpleCache();

export const CACHE_KEYS = {
  CATEGORIES: 'categories:active',
  POPULAR_ITEMS_PREFIX: 'menu_items:popular',
  popularItems: (limit: number) => `menu_items:popular:${limit}`,
} as const;

export const CACHE_TTL = {
  CATEGORIES: 300, // 5 minutes
  POPULAR_ITEMS: 300, // 5 minutes
} as const;
