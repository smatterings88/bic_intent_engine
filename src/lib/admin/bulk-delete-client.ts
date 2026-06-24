import type {
  BulkDeleteCounts,
  BulkDeleteResult,
  BulkDeleteTarget,
} from "@/lib/admin/bulk-delete-types";

export type { BulkDeleteCounts } from "@/lib/admin/bulk-delete-types";

export async function fetchBulkDeleteCounts(
  idToken: string,
): Promise<{ ok: true; counts: BulkDeleteCounts } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/content/bulk-delete", {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    counts?: BulkDeleteCounts;
    error?: { message?: string };
  };
  if (!res.ok || !json.ok || !json.counts) {
    return {
      ok: false,
      error: json.error?.message ?? res.statusText ?? "Failed to load counts",
    };
  }
  return { ok: true, counts: json.counts };
}

export async function bulkDeleteContent(
  args: { confirmText: "DELETE"; targets: BulkDeleteTarget[] },
  idToken: string,
): Promise<{ ok: true; deleted: BulkDeleteResult } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/content/bulk-delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(args),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    deleted?: BulkDeleteResult;
    error?: { message?: string };
  };
  if (!res.ok || !json.ok || !json.deleted) {
    return {
      ok: false,
      error: json.error?.message ?? res.statusText ?? "Delete failed",
    };
  }
  return { ok: true, deleted: json.deleted };
}
