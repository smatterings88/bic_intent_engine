import type { LeadAdminDetail } from "@/types/admin-leads";

import { GhlStatusBadge } from "./GhlStatusBadge";

export function LeadDetailPanel({ lead }: { lead: LeadAdminDetail }) {
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Contact
        </h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="font-mono text-xs">{lead.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd className="text-xs">
              {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Phone</dt>
            <dd className="text-xs">{lead.phone ?? "—"}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Source
        </h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Source page</dt>
            <dd className="break-all font-mono text-xs">{lead.sourcePage}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Landing page slug</dt>
            <dd className="font-mono text-xs">{lead.landingPageSlug ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Lead magnet ID</dt>
            <dd className="font-mono text-xs">{lead.leadMagnetId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Campaign type</dt>
            <dd className="text-xs">{lead.campaignType ?? "—"}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">UTM</h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {(["source", "medium", "campaign", "term", "content"] as const).map((k) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="break-all text-xs">{lead.utm[k] ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          GoHighLevel
        </h2>
        <dl className="mt-2 space-y-2">
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <GhlStatusBadge status={lead.ghlStatus} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contact ID</dt>
            <dd className="font-mono text-xs">{lead.ghlContactId ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tags applied</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {lead.tagsApplied.length ? (
                lead.tagsApplied.map((t) => (
                  <span key={t} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
          {lead.ghlError ? (
            <div>
              <dt className="text-xs text-destructive">Last error</dt>
              <dd className="mt-1 rounded border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                {lead.ghlError}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
      <section>
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Timestamps
        </h2>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Created</dt>
            <dd className="text-xs text-muted-foreground">{lead.createdAt || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Updated</dt>
            <dd className="text-xs text-muted-foreground">{lead.updatedAt || "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
