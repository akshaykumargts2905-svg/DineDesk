"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService, clearSession, getToken, request, setSession, User } from "@/services/api";

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const publicPaths = ["/login", "/register"];
const canVisit = (role: User["role"], pathname: string) => {
  if (pathname === "/") return role === "RESTAURANT_ADMIN" || role === "MANAGER";
  if (pathname.startsWith("/menu-management") || pathname.startsWith("/table-management")) {
    return role === "RESTAURANT_ADMIN" || role === "MANAGER";
  }
  if (pathname.startsWith("/kitchen")) return ["RESTAURANT_ADMIN", "MANAGER", "KITCHEN_STAFF"].includes(role);
  if (pathname.startsWith("/tracking")) return ["RESTAURANT_ADMIN", "MANAGER", "FRONT_OF_HOUSE"].includes(role);
  if (pathname.startsWith("/new-order") || pathname.startsWith("/all-orders")) return role !== "KITCHEN_STAFF";
  return true;
};
const homeForRole = (role: User["role"]) =>
  role === "KITCHEN_STAFF" ? "/kitchen" : role === "FRONT_OF_HOUSE" ? "/all-orders" : "/";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const isPublic = publicPaths.includes(pathname);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      if (isPublic) {
        setReady(true);
        return;
      }
      if (!getToken()) {
        setReady(true);
        router.replace("/login");
        return;
      }
      try {
        const currentUser = await authService.me();
        if (active) setUser(currentUser);
      } catch {
        clearSession();
        if (active) {
          setUser(null);
          router.replace("/login");
        }
      } finally {
        if (active) setReady(true);
      }
    }
    restoreSession();
    return () => { active = false; };
  }, [isPublic, pathname, router]);

  useEffect(() => {
    if (!isPublic && user && !canVisit(user.role, pathname)) {
      router.replace(homeForRole(user.role));
    }
  }, [isPublic, pathname, router, user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    ready,
    signIn: (token, nextUser) => {
      setSession(token, nextUser);
      setUser(nextUser);
      setReady(true);
    },
    signOut: async () => {
      try { await request("/auth/logout", { method: "POST" }); } catch {}
      clearSession();
      setUser(null);
      router.replace("/login");
    },
  }), [user, ready, router]);

  if (!isPublic && (!ready || !user)) {
    return <div className="min-h-screen bg-[#F3F4F8]" aria-label="Loading" />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
