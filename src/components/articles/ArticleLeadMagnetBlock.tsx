export function ArticleLeadMagnetBlock({ leadMagnetId }: { leadMagnetId?: string }) {
  if (!leadMagnetId) return null;
  return (
    <aside className="surface-card mx-auto my-12 max-w-4xl border-border/70 px-4 py-6 sm:my-14 sm:px-8 sm:py-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Related resource
      </h2>
      <p className="mt-2 font-medium text-foreground">Resource ID: {leadMagnetId}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Lead magnet integration and opt-in will be activated in a later phase. For now, this is a
        placeholder tied to the linked asset in our content system.
      </p>
    </aside>
  );
}
