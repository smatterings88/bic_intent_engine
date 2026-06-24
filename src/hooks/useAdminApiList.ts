"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export function useAdminApiList<T>(path: string) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(path, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as {
        ok?: boolean;
        items?: T[];
        error?: { message?: string };
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message ?? res.statusText);
      }
      setData(json.items ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [path, user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  return { data, loading: loading || authLoading, error, reload: load };
}
