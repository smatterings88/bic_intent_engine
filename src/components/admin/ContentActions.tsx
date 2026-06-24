"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { archiveContent, publishContent, unpublishContent } from "@/lib/admin/client-actions";

type ContentType = "article" | "landing_page" | "lead_magnet";

export function ContentActions({
  contentType,
  id,
  onDone,
}: {
  contentType: ContentType;
  id: string;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(
    fn: (
      args: { contentType: ContentType; id: string },
      token: string,
    ) => Promise<{ ok: boolean; error?: string }>,
  ) {
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fn({ contentType, id }, token);
      if (!res.ok) {
        setErr(res.error ?? "Action failed");
        return;
      }
      onDone();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(publishContent)}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
        >
          Publish
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(unpublishContent)}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
        >
          Unpublish
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run(archiveContent)}
          className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
        >
          Archive
        </button>
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
