import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies, getTokenLifetimes } from "@flavor/core/lib/auth/cookies";
import { LOGIN_USER } from "@flavor/core/lib/wordpress/queries/auth";
import { checkRateLimit } from "@flavor/core/lib/rateLimit";
import type { LoginResponse } from "@flavor/core/lib/wordpress/types";

export async function POST(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ error: "GraphQL endpoint not configured" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(ip, { name: "login", maxRequests: 5, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: LOGIN_USER,
        variables: { username, password },
      }),
    });

    const json = await response.json();

    if (json.errors) {
      return NextResponse.json(
        { error: json.errors[0]?.message || "Login failed" },
        { status: 401 }
      );
    }

    const data = json.data as LoginResponse;
    const { authToken, refreshToken, user } = data.login;

    await setAuthCookies(authToken, refreshToken);

    const { authMaxAge } = await getTokenLifetimes();
    return NextResponse.json({ user, authTokenLifetime: authMaxAge });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
