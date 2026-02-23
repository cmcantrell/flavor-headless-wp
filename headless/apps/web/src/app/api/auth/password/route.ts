import { NextRequest, NextResponse } from "next/server";
import { getAuthToken } from "@flavor/core/lib/auth/cookies";
import { LOGIN_USER, UPDATE_USER_PASSWORD } from "@flavor/core/lib/wordpress/queries/auth";
import { checkRateLimit } from "@flavor/core/lib/rateLimit";
import type { LoginResponse, UpdateUserPasswordResponse } from "@flavor/core/lib/wordpress/types";

export async function POST(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ error: "GraphQL endpoint not configured" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(ip, { name: "password", maxRequests: 5, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const { username, currentPassword, newPassword } = await request.json();

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Username, current password, and new password are required" },
        { status: 400 }
      );
    }

    // Step 1: Verify current password by attempting login
    const loginRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: LOGIN_USER,
        variables: { username, password: currentPassword },
      }),
    });

    const loginJson = await loginRes.json();

    if (loginJson.errors) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const loginData = loginJson.data as LoginResponse;
    const userId = loginData.login.user.id;

    // Step 2: Update password using the auth token from cookie
    const authToken = await getAuthToken();
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const updateRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        query: UPDATE_USER_PASSWORD,
        variables: { id: userId, password: newPassword },
      }),
    });

    const updateJson = await updateRes.json();

    if (updateJson.errors) {
      return NextResponse.json(
        { error: updateJson.errors[0]?.message || "Failed to update password" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
