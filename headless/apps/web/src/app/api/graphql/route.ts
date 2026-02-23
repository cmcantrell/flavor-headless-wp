import { NextRequest, NextResponse } from "next/server";
import {
  getRedisClient,
  shouldCache,
  generateCacheKey,
  extractOperationName,
  getTTL,
} from "@flavor/core/lib/redis";

/**
 * GraphQL Proxy with Optional Redis Caching
 *
 * - Proxies client requests to WordPress (avoids CORS in production)
 * - Caches read-only queries in Redis when configured
 * - Skips cache for mutations and authenticated requests
 */
export async function POST(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    return NextResponse.json(
      { errors: [{ message: "GraphQL endpoint not configured" }] },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const query: string = body.query || "";
    const variables = body.variables;

    // Forward auth: explicit header takes priority, then fall back to httpOnly cookie
    let authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      const authToken = request.cookies.get("auth_token")?.value;
      if (authToken) {
        authHeader = `Bearer ${authToken}`;
      }
    }

    const canCache = shouldCache(query, authHeader);
    const redis = canCache ? await getRedisClient() : null;
    const cacheKey = canCache ? generateCacheKey(query, variables) : null;

    const operationName = extractOperationName(query);
    const ttl = getTTL(operationName);

    const cacheHeaders = (status: "HIT" | "MISS" | "BYPASS") => {
      const headers: Record<string, string> = { "X-Cache": status };
      if (canCache && ttl > 0) {
        headers["Cache-Control"] =
          `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`;
        if (operationName) {
          headers["Cache-Tag"] = `graphql,${operationName}`;
        }
      } else {
        headers["Cache-Control"] = "private, no-store";
      }
      return headers;
    };

    // Try cache
    if (redis && cacheKey) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json(JSON.parse(cached), {
            headers: cacheHeaders("HIT"),
          });
        }
      } catch (err) {
        console.warn("Redis get error:", err);
      }
    }

    // Fetch from WordPress
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Cache successful responses
    if (redis && cacheKey && !data.errors) {
      try {
        await redis.setex(cacheKey, ttl, JSON.stringify(data));
      } catch (err) {
        console.warn("Redis set error:", err);
      }
    }

    return NextResponse.json(data, {
      headers: cacheHeaders(redis && cacheKey ? "MISS" : "BYPASS"),
    });
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      { errors: [{ message: "Failed to fetch from WordPress" }] },
      { status: 500 }
    );
  }
}
