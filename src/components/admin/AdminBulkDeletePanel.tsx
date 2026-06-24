"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  bulkDeleteContent,
  fetchBulkDeleteCounts,
  type BulkDeleteCounts,
} from "@/lib/admin/bulk-delete-client";
import { BULK_DELETE_TARGETS, type BulkDeleteTarget } from "@/lib/admin/bulk-delete-types";

const TARGET_LABELS: Record<BulkDeleteTarget, string> = {
  articles: "Articles",
  landing_pages: "Landing pages",
  lead_magnets: "Lead magnets",
  zenith_pages: "Zenith pages",
};

const CONFIRM_TEXT = "DELETE";

export function AdminBulkDeletePanel() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [counts, setCounts] = useState<BulkDeleteCounts | null>(null);
  const [selected, setSelected] = useState<Set<BulkDeleteTarget>>(
    () => new Set(BULK_DELETE_TARGETS),
  );
  const [confirmInput, setConfirmInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const result = await fetchBulkDeleteCounts(token);
    if (result.ok) {
      setCounts(result.counts);
      setError(null);
    } else {
      setError(result.error);
      setCounts(null);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    void loadCounts();
  }, [authLoading, user, loadCounts]);

  function toggle(target: BulkDeleteTarget) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(target)) next.delete(target);
      else next.add(target);
      return next;
    });
    setSuccess(null);
  }

  const canDelete = selected.size > 0 && confirmInput === CONFIRM_TEXT && !busy && Boolean(user);

  const selectedTotal = counts ? [...selected].reduce((sum, t) => sum + (counts[t] ?? 0), 0) : null;

  async function handleDelete() {
    if (!user || !canDelete) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const token = await user.getIdToken();
      const result = await bulkDeleteContent(
        { confirmText: CONFIRM_TEXT, targets: [...selected] },
        token,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const parts = BULK_DELETE_TARGETS.filter((t) => selected.has(t)).map(
        (t) => `${TARGET_LABELS[t]}: ${result.deleted[t]}`,
      );
      setSuccess(`Deleted from Firestore — ${parts.join("; ")}.`);
      setConfirmInput("");
      await loadCounts();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !user) {
    return null;
  }

  return (
    <section className="mt-10 border-t border-destructive/40 pt-8">
      <h2 className="font-serif text-xl text-destructive">Danger zone</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Permanently remove documents from Firestore. This does not delete leads, ingestions, or form
        submissions. Type <span className="font-mono text-foreground">{CONFIRM_TEXT}</span> to
        confirm.
      </p>

      <ul className="mt-4 space-y-2">
        {BULK_DELETE_TARGETS.map((target) => (
          <li key={target} className="flex items-center gap-2 text-sm">
            <input
              id={`bulk-delete-${target}`}
              type="checkbox"
              checked={selected.has(target)}
              onChange={() => toggle(target)}
              disabled={busy}
              className="size-4 rounded border-border"
            />
            <label htmlFor={`bulk-delete-${target}`} className="cursor-pointer">
              {TARGET_LABELS[target]}
              {counts != null ? (
                <span className="ml-1 text-muted-foreground">({counts[target]})</span>
              ) : null}
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-3 sm:max-w-md">
        <label htmlFor="bulk-delete-confirm" className="text-sm text-muted-foreground">
          Confirmation
        </label>
        <input
          id="bulk-delete-confirm"
          type="text"
          value={confirmInput}
          onChange={(e) => {
            setConfirmInput(e.target.value);
            setSuccess(null);
          }}
          placeholder={CONFIRM_TEXT}
          disabled={busy}
          autoComplete="off"
          className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={!canDelete}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete selected from Firestore"}
        </button>
        {selectedTotal != null && selected.size > 0 ? (
          <p className="text-xs text-muted-foreground">
            {selectedTotal} document{selectedTotal === 1 ? "" : "s"} will be deleted.
          </p>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-foreground">{success}</p> : null}
    </section>
  );
}
