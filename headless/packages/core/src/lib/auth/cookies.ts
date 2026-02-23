/**
 * Auth Cookie Helpers (server-only)
 *
 * All token storage uses httpOnly cookies — tokens are never exposed to client JS.
 * Lifetimes are pulled from WP Headless settings; constants below are fallbacks.
 */

import { cookies } from "next/headers";
import { wpFetch } from "../wordpress/client";
import { GET_SITE_SETTINGS } from "../wordpress/queries/site";
import type { SiteSettingsResponse } from "../wordpress/types";

const AUTH_TOKEN_COOKIE = "auth_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

// Fallbacks if WP is unreachable
const DEFAULT_AUTH_MAX_AGE = 60 * 60; // 60 minutes
const DEFAULT_REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const isProduction = process.env.NODE_ENV === "production";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Fetch configured token lifetimes from WP.
 * Uses ISR caching so this doesn't add a round-trip on every auth call.
 */
export async function getTokenLifetimes(): Promise<{
  authMaxAge: number;
  refreshMaxAge: number;
}> {
  try {
    const data = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    return {
      authMaxAge: data.headlessConfig?.authTokenLifetime || DEFAULT_AUTH_MAX_AGE,
      refreshMaxAge: data.headlessConfig?.refreshTokenLifetime || DEFAULT_REFRESH_MAX_AGE,
    };
  } catch {
    return {
      authMaxAge: DEFAULT_AUTH_MAX_AGE,
      refreshMaxAge: DEFAULT_REFRESH_MAX_AGE,
    };
  }
}

export async function setAuthCookies(authToken: string, refreshToken: string) {
  const { authMaxAge, refreshMaxAge } = await getTokenLifetimes();
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, authToken, cookieOptions(authMaxAge));
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(refreshMaxAge));
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function setAuthToken(authToken: string) {
  const { authMaxAge } = await getTokenLifetimes();
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, authToken, cookieOptions(authMaxAge));
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
