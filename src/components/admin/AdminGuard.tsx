"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import { ensureFirebaseClient } from "@/lib/firebase/client";
import { isAdminRole } from "@/lib/admin/roles";
import type { UserRole } from "@/types/user";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, initError } = useAuth();
  const [role, setRole] = useState<UserRole | null | "pending">("pending");

  useEffect(() => {
    if (authLoading || initError || !user) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { db } = ensureFirebaseClient();
        const snap = await getDoc(doc(db, "users", user.uid));
        const r = (snap.data()?.role as UserRole | undefined) ?? "user";
        if (!cancelled) setRole(r);
      } catch {
        if (!cancelled) setRole("user");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, initError]);

  if (initError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Firebase is not configured in this environment.
      </div>
    );
  }

  if (authLoading || (user && role === "pending")) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
        Loading admin…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        You must be signed in to access the admin console.
      </div>
    );
  }

  if (!isAdminRole(role)) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-6 text-sm">
        <p className="font-medium text-foreground">Access denied</p>
        <p className="mt-2 text-muted-foreground">
          Your account does not have admin privileges. Ask an owner to set{" "}
          <code className="rounded bg-muted px-1">{`users/{uid}.role`}</code> to{" "}
          <code className="rounded bg-muted px-1">admin</code> or{" "}
          <code className="rounded bg-muted px-1">super_admin</code> in Firestore.
        </p>
        <Link href="/app/dashboard" className="mt-4 inline-block text-sm text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
