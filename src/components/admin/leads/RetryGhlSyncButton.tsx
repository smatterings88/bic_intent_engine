"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { retryLeadGhlSync } from "@/lib/admin/lead-client-actions";

export function RetryGhlSyncButton({
  leadId,
  ghlStatus,
  onComplete,
}: {
  leadId: string;
  ghlStatus: string;
  onComplete: () => void | Promise<void>;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (ghlStatus !== "failed") {
    return null;
  }

  async function onClick() {
    if (!user) {
      setMessage("You must be signed in.");
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const result = await retryLeadGhlSync(token, leadId);
      if (!result.ok) {
        setMessage(result.error ?? "Retry failed");
        return;
      }
      setMessage("Sync completed.");
      await onComplete();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void onClick()}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {loading ? "Retrying…" : "Retry GHL sync"}
      </button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
