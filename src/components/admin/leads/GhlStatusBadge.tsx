const STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  found: "bg-blue-500/15 text-blue-800 dark:text-blue-200",
  created: "bg-blue-500/15 text-blue-800 dark:text-blue-200",
  updated: "bg-blue-500/15 text-blue-800 dark:text-blue-200",
  tagged: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  failed: "bg-destructive/15 text-destructive",
};

export function GhlStatusBadge({ status }: { status: string }) {
  const cls = STYLES[status] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}
