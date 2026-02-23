"use client";

import { createContext, useContext, useCallback, useState, ReactNode } from "react";
import useSWR from "swr";
import type { AuthUser } from "../lib/wordpress/types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

interface SessionResponse {
  user: AuthUser | null;
  authTokenLifetime?: number;
}

// Default: refresh at 75% of a 60-min token
const DEFAULT_REFRESH_MS = 45 * 60 * 1000;

async function sessionFetcher(url: string): Promise<SessionResponse> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    // Network errors or non-JSON responses should not log the user out.
    // Throwing tells SWR to keep the previous data and retry later.
    throw err;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [refreshInterval, setRefreshInterval] = useState(DEFAULT_REFRESH_MS);

  const { data, isLoading, mutate } = useSWR<SessionResponse>(
    "/api/auth/session",
    sessionFetcher,
    {
      revalidateOnFocus: true,
      refreshInterval,
      dedupingInterval: 10000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      keepPreviousData: true,
      onSuccess: (res) => {
        if (res.authTokenLifetime) {
          // Refresh at 75% of token lifetime
          setRefreshInterval(Math.round(res.authTokenLifetime * 0.75) * 1000);
        }
      },
    }
  );

  const user = data?.user ?? null;

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Login failed");
      }

      await mutate({ user: responseData.user, authTokenLifetime: responseData.authTokenLifetime }, { revalidate: false });
    },
    [mutate]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Registration failed");
      }

      await mutate({ user: responseData.user }, { revalidate: false });
    },
    [mutate]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate({ user: null }, { revalidate: false });
  }, [mutate]);

  const refreshUser = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
