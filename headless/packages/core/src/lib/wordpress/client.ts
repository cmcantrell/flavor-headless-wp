/**
 * WordPress GraphQL Client
 *
 * Server-side fetch helper for WPGraphQL with ISR caching.
 * Adapted from the Magento headless client pattern.
 */

const ISR_REVALIDATE = parseInt(
  process.env.ISR_REVALIDATE_SECONDS || "300",
  10
);

export async function wpFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number | false }
): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_GRAPHQL_ENDPOINT is not defined");
  }

  const revalidate = options?.revalidate ?? ISR_REVALIDATE;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: revalidate === 0 ? { revalidate: 0 } : { revalidate },
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    console.error("GraphQL Errors:", json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL Error");
  }

  return json.data;
}
