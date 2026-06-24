import type { ZenithPageStatus } from "@/types/zenith-content";

export function ZenithStatusBadge({ status }: { status: ZenithPageStatus | string }) {
  const s = String(status);
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
  if (s === "draft") {
    return <span className={`${base} border-amber-300 bg-amber-50 text-amber-900`}>Draft</span>;
  }
  if (s === "published") {
    return (
      <span className={`${base} border-emerald-300 bg-emerald-50 text-emerald-900`}>Published</span>
    );
  }
  return <span className={`${base} border-border bg-muted/40 text-muted-foreground`}>{s}</span>;
}
