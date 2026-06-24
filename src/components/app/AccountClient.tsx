"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export function AccountClient() {
  const { user } = useAuth();
  return (
    <div className="surface-card mt-8 max-w-lg space-y-6 border-border/80 p-5 text-sm sm:p-6">
      <div>
        <div className="eyebrow mb-2 text-xs">Email</div>
        <div className="font-medium text-foreground">{user?.email ?? "—"}</div>
      </div>
      <div className="border-t border-border/80 pt-6">
        <div className="eyebrow mb-2 text-xs">Role</div>
        <div className="leading-relaxed text-muted-foreground">
          Role is managed in Firestore (placeholder for future profile UI).
        </div>
      </div>
    </div>
  );
}
