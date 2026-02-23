import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@flavor/core/lib/auth/cookies";
import { REGISTER_USER, LOGIN_USER } from "@flavor/core/lib/wordpress/queries/auth";
import { checkRateLimit } from "@flavor/core/lib/rateLimit";
import type { RegisterUserResponse, LoginResponse } from "@flavor/core/lib/wordpress/types";

export async function POST(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ error: "GraphQL endpoint not configured" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(ip, { name: "register", maxRequests: 3, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 });
    }

    // Register the user
    const registerResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: REGISTER_USER,
        variables: { username, email, password },
      }),
    });

    const registerJson = await registerResponse.json();

    if (registerJson.errors) {
      return NextResponse.json(
        { error: registerJson.errors[0]?.message || "Registration failed" },
        { status: 400 }
      );
    }

    const registerData = registerJson.data as RegisterUserResponse;

    // Auto-login after registration to get tokens
    const loginResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: LOGIN_USER,
        variables: { username, password },
      }),
    });

    const loginJson = await loginResponse.json();

    if (loginJson.errors) {
      // Registration succeeded but auto-login failed — still return the user
      return NextResponse.json({ user: registerData.registerUser.user });
    }

    const loginData = loginJson.data as LoginResponse;
    const { authToken, refreshToken, user } = loginData.login;

    await setAuthCookies(authToken, refreshToken);

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
