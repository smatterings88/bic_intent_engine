import type { LeadAdminFilterInput } from "@/types/admin-leads";

const GHL_STATUSES = ["pending", "found", "created", "updated", "tagged", "failed"];

export function LeadFilters({
  value,
  onChange,
}: {
  value: LeadAdminFilterInput;
  onChange: (next: LeadAdminFilterInput) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">GHL status</span>
        <select
          className="rounded-md border border-input bg-background px-2 py-1.5"
          value={value.ghlStatus ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              ghlStatus: e.target.value || undefined,
            })
          }
        >
          <option value="">Any</option>
          {GHL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[140px] flex-col gap-1">
        <span className="text-xs text-muted-foreground">Landing slug</span>
        <input
          className="rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
          placeholder="slug"
          value={value.landingPageSlug ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              landingPageSlug: e.target.value.trim() || undefined,
            })
          }
        />
      </label>
      <label className="flex min-w-[140px] flex-col gap-1">
        <span className="text-xs text-muted-foreground">Lead magnet ID</span>
        <input
          className="rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
          placeholder="id"
          value={value.leadMagnetId ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              leadMagnetId: e.target.value.trim() || undefined,
            })
          }
        />
      </label>
      <label className="flex min-w-[120px] flex-col gap-1">
        <span className="text-xs text-muted-foreground">Campaign</span>
        <input
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
          placeholder="type"
          value={value.campaignType ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              campaignType: e.target.value.trim() || undefined,
            })
          }
        />
      </label>
    </div>
  );
}
