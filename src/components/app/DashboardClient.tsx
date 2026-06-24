"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function DashboardClient() {
  const { user } = useAuth();
  return (
    <div className="surface-card mt-6 max-w-md border-border/80 p-5 sm:p-6">
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{user?.email ?? "—"}</span>
      </p>
    </div>
  );
}
