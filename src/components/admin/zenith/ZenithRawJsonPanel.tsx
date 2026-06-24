"use client";

import { useState } from "react";

import type { ZenithPage } from "@/types/zenith-content";

export function ZenithRawJsonPanel({ page }: { page: ZenithPage }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">Raw JSON</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? (
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
          {JSON.stringify(page, null, 2)}
        </pre>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">Collapsed by default.</p>
      )}
    </section>
  );
}
