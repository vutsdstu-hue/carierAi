import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User as FrontendUser } from "@/types";
import { apiFetch } from "./api";
import { clearAuthToken, getAuthToken, setAuthToken } from "./authStorage";

export type Role = "USER" | "MODERATOR" | "ADMIN";

export type AuthUser = FrontendUser & {
  role: Role;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    location?: string;
    position?: string;
    experience?: string;
    level?: string;
    avatar?: string;
    joinDate?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const t = getAuthToken();
    if (!t) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Temporarily set token so apiFetch attaches it
      setToken(t);
      const res = await apiFetch<{ user: AuthUser }>("/api/auth/me", { method: "GET" });
      setUser(res.user);
    } catch {
      clearAuthToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message ?? "Login failed");
    }

    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    location?: string;
    position?: string;
    experience?: string;
    level?: string;
    avatar?: string;
    joinDate?: string;
  }) => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message ?? "Registration failed");
    }

    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, login, register, logout, refreshMe }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}

