/**
 * SWR Configuration and GraphQL Fetcher
 *
 * Client-side caching layer:
 * - Deduplication: multiple components requesting same data = 1 fetch
 * - Stale-While-Revalidate: show cached data, refresh in background
 * - Error retry with backoff
 */

import { SWRConfiguration } from "swr";

export async function graphqlFetcher<T>(
  key: string | [string, Record<string, unknown>?, string?]
): Promise<T> {
  const [query, variables, token] = Array.isArray(key)
    ? key
    : [key, undefined, undefined];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL Error");
  }

  return json.data;
}

export const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 2000,
  keepPreviousData: true,
  errorRetryCount: 2,
  fetcher: graphqlFetcher,
};

/** Cart, checkout — shorter dedup window */
export const volatileSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 1000,
};

/** Categories, menus, site config — long cache */
export const stableSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  dedupingInterval: 30000,
  revalidateIfStale: false,
};
