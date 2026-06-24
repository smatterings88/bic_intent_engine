"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { ensureFirebaseClient } from "@/lib/firebase/client";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  initError: Error | null;
  reload: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const { auth } = ensureFirebaseClient();
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      setInitError(null);
    } catch (e) {
      setInitError(e instanceof Error ? e : new Error(String(e)));
      setUser(null);
      setLoading(false);
    }
    return () => {
      unsub?.();
    };
  }, [tick]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      initError,
      reload,
    }),
    [user, loading, initError, reload],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
