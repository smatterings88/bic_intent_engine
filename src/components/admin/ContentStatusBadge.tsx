import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  published: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  archived: "bg-secondary text-secondary-foreground",
  received: "bg-muted text-muted-foreground",
  validated: "bg-blue-500/15 text-blue-900 dark:text-blue-200",
  saved: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
  failed: "bg-destructive/15 text-destructive",
};

export function ContentStatusBadge({ status }: { status: string }) {
  const key = status in styles ? status : "draft";
  return (
    <span
      className={cn(
        "inline-flex min-h-[1.5rem] items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-black/5 dark:ring-white/10",
        styles[key] ?? styles.draft,
      )}
    >
      {status}
    </span>
  );
}
