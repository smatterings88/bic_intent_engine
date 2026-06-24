"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { publishAdminZenithPage } from "@/lib/admin/zenith-client-actions";

export function ZenithPublishButton({
  slug,
  disabled,
  onDone,
}: {
  slug: string;
  disabled?: boolean;
  onDone: (result: { ok: boolean; warnings?: string[]; errors?: string[]; error?: string }) => void;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    if (!user) return;
    if (!confirm("Publish this Zenith page?")) return;
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await publishAdminZenithPage(token, slug);
      if (!res.ok) {
        const msg = res.error ?? res.errors?.join("; ") ?? "Publish failed";
        setErr(msg);
      }
      onDone({ ok: res.ok, warnings: res.warnings, errors: res.errors, error: res.error });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      onDone({ ok: false, error: msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => void onClick()}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
      >
        {busy ? "Publishing…" : "Publish"}
      </button>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
