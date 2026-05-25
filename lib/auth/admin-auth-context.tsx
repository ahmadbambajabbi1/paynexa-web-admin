"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as adminApi from "@/lib/api/admin";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";

export type AdminUser = adminApi.LoginResponse["user"];

type AdminAuthContextValue = {
  token: string | null;
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    const t = window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    setToken(t);
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await adminApi.fetchAdminMe(t);
      setUser(me.user);
    } catch {
      window.localStorage.removeItem(STORAGE_ADMIN_ACCESS_TOKEN);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminApi.loginRequest(email, password);
    window.localStorage.setItem(STORAGE_ADMIN_ACCESS_TOKEN, res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_ADMIN_ACCESS_TOKEN);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      logout,
      refreshUser,
    }),
    [token, user, loading, login, logout, refreshUser],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
