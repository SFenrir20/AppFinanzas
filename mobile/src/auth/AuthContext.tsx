import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client";
import { clearStoredToken, getStoredToken, storeToken } from "./tokenStore";

type UserProfile = {
  currency: string;
  monthly_salary: string;
};

export type User = {
  id: number;
  email: string;
  profile: UserProfile;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type TokenResponse = {
  access_token: string;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function applyToken(nextToken: string) {
    await storeToken(nextToken);
    setToken(nextToken);
    const me = await apiRequest<User>("/users/me", { token: nextToken });
    setUser(me);
  }

  async function refreshUser() {
    if (!token) return;
    setUser(await apiRequest<User>("/users/me", { token }));
  }

  async function signIn(email: string, password: string) {
    const response = await apiRequest<TokenResponse>("/auth/login", {
      body: { email, password },
    });
    await applyToken(response.access_token);
  }

  async function register(email: string, password: string) {
    const response = await apiRequest<TokenResponse>("/auth/register", {
      body: { email, password, currency: "PEN", monthly_salary: "0.00" },
    });
    await applyToken(response.access_token);
  }

  async function signOut() {
    await clearStoredToken();
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    getStoredToken()
      .then(async (storedToken) => {
        if (storedToken) {
          try {
            await applyToken(storedToken);
          } catch {
            await clearStoredToken();
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, signIn, register, signOut, refreshUser }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
