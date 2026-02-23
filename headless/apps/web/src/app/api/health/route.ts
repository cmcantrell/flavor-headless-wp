import { NextResponse } from "next/server";

/**
 * Health check endpoint for load balancers, uptime monitors, and orchestrators.
 *
 * GET /api/health
 * - Returns 200 when the app is running and WordPress is reachable
 * - Returns 503 when WordPress is unreachable
 */
export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    return NextResponse.json(
      { status: "error", wordpress: "not configured" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ generalSettings { title } }`,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "degraded", wordpress: "unreachable" },
        { status: 503 },
      );
    }

    return NextResponse.json({ status: "ok", wordpress: "connected" });
  } catch {
    return NextResponse.json(
      { status: "degraded", wordpress: "unreachable" },
      { status: 503 },
    );
  }
}
