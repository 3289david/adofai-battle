"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  adofai_net_id: string | null;
  username: string;
  avatar_url: string | null;
  role: string;
  mmr: number;
  rank: string;
  peak_rank: string;
  peak_mmr: number;
  total_matches: number;
  wins: number;
  losses: number;
  best_accuracy: number;
  best_combo: number;
  tournaments_won: number;
  tournaments_played: number;
  ban_status: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isMod: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    await refresh();
    return {};
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isMod = user?.role === "moderator" || isAdmin;

  return (
    <AuthContext value={{ user, loading, login, logout, refresh, isAdmin, isMod }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
