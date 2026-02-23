import { NextResponse } from "next/server";
import { getAuthToken, getRefreshToken, setAuthToken, clearAuthCookies, getTokenLifetimes } from "@flavor/core/lib/auth/cookies";
import { GET_VIEWER, REFRESH_TOKEN } from "@flavor/core/lib/wordpress/queries/auth";
import type { ViewerResponse, RefreshTokenResponse } from "@flavor/core/lib/wordpress/types";

async function fetchViewer(endpoint: string, token: string): Promise<ViewerResponse | null> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: GET_VIEWER }),
  });

  const json = await response.json();
  if (json.errors) return null;
  return json.data as ViewerResponse;
}

async function refreshAuthToken(endpoint: string, refreshToken: string): Promise<string | null> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: REFRESH_TOKEN,
      variables: { refreshToken },
    }),
  });

  const json = await response.json();
  if (json.errors) return null;
  const data = json.data as RefreshTokenResponse;
  return data.refreshToken.authToken;
}

export async function GET() {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ user: null });
  }

  try {
    const { authMaxAge } = await getTokenLifetimes();
    const authToken = await getAuthToken();

    // Try current auth token
    if (authToken) {
      const data = await fetchViewer(endpoint, authToken);
      if (data?.viewer) {
        return NextResponse.json({ user: data.viewer, authTokenLifetime: authMaxAge });
      }
    }

    // Auth token expired or missing — try refresh
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return NextResponse.json({ user: null });
    }

    const newAuthToken = await refreshAuthToken(endpoint, refreshToken);
    if (!newAuthToken) {
      await clearAuthCookies();
      return NextResponse.json({ user: null });
    }

    // Save new auth token and retry viewer
    await setAuthToken(newAuthToken);
    const data = await fetchViewer(endpoint, newAuthToken);
    if (data?.viewer) {
      return NextResponse.json({ user: data.viewer, authTokenLifetime: authMaxAge });
    }

    await clearAuthCookies();
    return NextResponse.json({ user: null });
  } catch (error) {
    // Transient errors (network, WP down) should NOT clear cookies or log the user out.
    // Return a 503 so the client-side fetcher throws and SWR retries with previous data.
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Session check failed" },
      { status: 503 }
    );
  }
}
