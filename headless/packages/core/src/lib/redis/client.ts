/**
 * Redis Client for GraphQL Response Caching
 *
 * Optional — if REDIS_URL is not set, caching is gracefully disabled.
 */

type RedisClient = {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, ttl: number, value: string) => Promise<string>;
  del: (key: string) => Promise<number>;
  on: (event: string, callback: (err?: Error) => void) => void;
};

let redisClient: RedisClient | null = null;
let redisAvailable: boolean | null = null;
let redisInitializing: Promise<RedisClient | null> | null = null;

export async function getRedisClient(): Promise<RedisClient | null> {
  if (redisAvailable === false) return null;
  if (redisClient) return redisClient;
  if (redisInitializing) return redisInitializing;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    redisAvailable = false;
    return null;
  }

  redisInitializing = (async () => {
    try {
      const Redis = (await import("ioredis")).default;

      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times: number) => {
          if (times > 1) {
            redisAvailable = false;
            return null;
          }
          return 100;
        },
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      client.on("error", (err: Error) => {
        console.warn("Redis error (caching disabled):", err.message);
        redisAvailable = false;
      });

      client.on("connect", () => {
        redisAvailable = true;
      });

      try {
        await client.connect();
        await client.ping();
        redisClient = client;
        redisAvailable = true;
        console.log("Redis connected");
        return client;
      } catch {
        console.warn("Redis unavailable, caching disabled");
        redisAvailable = false;
        return null;
      }
    } catch {
      redisAvailable = false;
      return null;
    } finally {
      redisInitializing = null;
    }
  })();

  return redisInitializing;
}

export function isRedisAvailable(): boolean {
  return redisAvailable === true;
}

/**
 * Cache TTL by operation name (seconds)
 */
export const CACHE_TTL: Record<string, number> = {
  // Stable (5 min)
  GetSiteSettings: 300,
  GetMenuByLocation: 300,
  GetMenuBySlug: 300,

  // Semi-stable (2 min)
  GetPages: 120,
  GetPosts: 120,

  // Individual content (1 min)
  GetPageByUri: 60,
  GetPostBySlug: 60,

  // Comments (30s — fresher than posts)
  GetCommentsByPost: 30,

  // WooCommerce products (2 min listings, 1 min single)
  GetProducts: 120,
  GetProductsByCategory: 120,
  GetProductBySlug: 60,
  GetProductCategoryBySlug: 60,
  GetProductCategories: 300,

  default: 60,
};

/**
 * Operations that should never be cached
 */
export const NEVER_CACHE = new Set([
  // Mutations (Phase 2: WooCommerce)
  "AddToCart",
  "UpdateCartItems",
  "RemoveCartItems",
  "Checkout",
  "Login",
  "Register",
  // Comments
  "CreateComment",
  // Preview / authenticated
  "GetPreview",
]);

export function extractOperationName(query: string): string | null {
  const match = query.match(/(?:query|mutation)\s+(\w+)/);
  return match ? match[1] : null;
}

export function generateCacheKey(
  query: string,
  variables?: Record<string, unknown>
): string {
  const operationName = extractOperationName(query) || "unknown";
  const varsHash = variables ? JSON.stringify(variables) : "";
  const hash = Buffer.from(operationName + varsHash)
    .toString("base64")
    .slice(0, 32);
  return `gql:${operationName}:${hash}`;
}

export function getTTL(operationName: string | null): number {
  if (!operationName) return CACHE_TTL.default;
  return CACHE_TTL[operationName] ?? CACHE_TTL.default;
}

export function shouldCache(query: string, authHeader: string | null): boolean {
  if (authHeader && authHeader.startsWith("Bearer ")) return false;
  if (query.trim().startsWith("mutation")) return false;
  const operationName = extractOperationName(query);
  if (operationName && NEVER_CACHE.has(operationName)) return false;
  return true;
}
