import type { WebinarUrgencyBlockComponent } from "@/types/zenith-content";

import { WebinarCountdown } from "@/components/zenith/components/WebinarCountdown";
import { ZenithCtaButton } from "@/components/zenith/components/ZenithCtaButton";
import type { ZenithComponentRenderContext } from "@/components/zenith/types";

export function WebinarUrgencyBlock({
  component,
  page,
}: {
  component: WebinarUrgencyBlockComponent;
  page: ZenithComponentRenderContext["page"];
}) {
  if (
    !component.message &&
    !component.eventDate &&
    component.seatsRemaining == null &&
    !component.cta
  ) {
    return null;
  }
  return (
    <section className="my-10 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-5 py-6 sm:px-8">
      {component.eventDate ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">Event date</p>
      ) : null}
      {component.eventDate ? (
        <p className="mt-1 text-lg font-semibold text-white">{component.eventDate}</p>
      ) : null}
      <WebinarCountdown eventDate={component.eventDate} />
      {component.seatsRemaining != null ? (
        <p className="mt-3 text-sm text-white/80">Seats remaining: {component.seatsRemaining}</p>
      ) : null}
      {component.message ? (
        <p className="mt-4 text-base text-white/90">{component.message}</p>
      ) : null}
      {component.cta ? (
        <div className="mt-6">
          <ZenithCtaButton cta={component.cta} page={page} variant="light" />
        </div>
      ) : null}
    </section>
  );
}
