"use client";

import type { ZenithContentType, ZenithPageStatus } from "@/types/zenith-content";

export type ZenithPageFilterValue = {
  status: "all" | ZenithPageStatus;
  contentType: "all" | ZenithContentType;
  q: string;
};

export function ZenithPageFilters({
  value,
  onChange,
  onRefresh,
  disabled,
}: {
  value: ZenithPageFilterValue;
  onChange: (next: ZenithPageFilterValue) => void;
  onRefresh: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <input
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="Search by title or slug"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <select
            value={value.status}
            onChange={(e) =>
              onChange({ ...value, status: e.target.value as "all" | ZenithPageStatus })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Content type</label>
          <select
            value={value.contentType}
            onChange={(e) =>
              onChange({ ...value, contentType: e.target.value as "all" | ZenithContentType })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">All</option>
            <option value="article">Article</option>
            <option value="landing_page">Landing Page</option>
            <option value="lead_magnet_page">Lead Magnet</option>
            <option value="webinar_page">Webinar</option>
            <option value="cta_page">CTA</option>
            <option value="research_page">Research</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onRefresh}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          Refresh
        </button>
        <p className="text-xs text-muted-foreground">
          Tip: use publish/unpublish actions to control public visibility.
        </p>
      </div>
    </div>
  );
}
