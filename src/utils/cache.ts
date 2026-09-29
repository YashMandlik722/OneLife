/**
 * High-performance Cache Utility with Stale-While-Revalidate (SWR) support.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export const TTL = {
  USER_PROFILE: 10 * 60 * 1000,  // 10 minutes
  DASHBOARD: 3 * 60 * 1000,      // 3 minutes
  LEADERBOARD: 5 * 60 * 1000,    // 5 minutes (300,000ms)
};

/**
 * Save data into cache with a Time-To-Live (TTL)
 */
export function setCache<T>(key: string, data: T, ttlMs: number = TTL.DASHBOARD): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

/**
 * Get data from cache if present and not expired
 */
export function getCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > entry.ttl;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Execute API call with RAM Caching:
 * 1. Returns cached data immediately without network call if valid data exists in RAM.
 * 2. Fetches from API only when cache is expired or forceRefresh is true.
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<{ success: boolean; data?: T; message?: string }>,
  ttlMs: number = TTL.DASHBOARD,
  onFreshData?: (freshData: T) => void,
  forceRefresh: boolean = false
): Promise<{ data: T | null; isCached: boolean; error?: string }> {
  // 1. Check RAM cache first if forceRefresh is false
  if (!forceRefresh) {
    const cachedData = getCache<T>(cacheKey);
    if (cachedData) {
      // Return fresh RAM cached data without hitting network
      return { data: cachedData, isCached: true };
    }
  }

  // 2. Fetch from network when cache is missing/expired or forceRefresh is true
  const apiRes = await fetchFn();
  if (apiRes.success && apiRes.data) {
    setCache(cacheKey, apiRes.data, ttlMs);
    if (onFreshData) {
      onFreshData(apiRes.data);
    }
    return { data: apiRes.data, isCached: false };
  }

  return { data: null, isCached: false, error: apiRes.message };
}

/**
 * Clear all cached data (e.g. on logout)
 */
export function clearCache(): void {
  memoryCache.clear();
}
