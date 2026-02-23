// @flavor/core — barrel export

// WordPress client & types
export { wpFetch } from "./lib/wordpress/client";
export * from "./lib/wordpress/types";

// SWR utilities
export { SWRProvider, graphqlFetcher, defaultSWRConfig } from "./lib/swr";

// Context providers & hooks
export { AuthProvider, useAuth } from "./context/AuthContext";
export { SiteProvider, useSiteSettings } from "./context/SiteContext";

// Hooks
export { useLoadMore } from "./lib/hooks/useLoadMore";

// Redis
export {
  getRedisClient,
  isRedisAvailable,
  shouldCache,
  generateCacheKey,
  extractOperationName,
  getTTL,
} from "./lib/redis";
