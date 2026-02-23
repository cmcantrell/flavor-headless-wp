/**
 * In-memory sliding window rate limiter.
 *
 * Tracks requests per IP using a Map with automatic cleanup.
 * Suitable for single-instance deployments. For multi-instance,
 * swap this for a Redis-backed implementation.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

const CLEANUP_INTERVAL = 60_000; // 1 minute
const cleanupTimers = new Map<string, NodeJS.Timeout>();

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);

    // Periodic cleanup of expired entries
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store!.entries()) {
        entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
        if (entry.timestamps.length === 0) {
          store!.delete(key);
        }
      }
    }, CLEANUP_INTERVAL);
    timer.unref();
    cleanupTimers.set(name, timer);
  }
  return store;
}

interface RateLimitConfig {
  /** Unique name for this limiter (e.g. "login", "register") */
  name: string;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig,
): RateLimitResult {
  const store = getStore(config.name);
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(ip);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}
