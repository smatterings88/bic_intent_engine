import type { SpeakerBlockComponent } from "@/types/zenith-content";

function initials(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function SpeakerBlock({ component }: { component: SpeakerBlockComponent }) {
  if (!component.name?.trim() && !component.bio?.trim()) return null;
  return (
    <section className="my-10 flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-start sm:p-8">
      {component.photoUrl?.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={component.photoUrl}
          alt=""
          className="h-28 w-28 shrink-0 rounded-full object-cover ring-2 ring-white/20"
          width={112}
          height={112}
        />
      ) : (
        <div
          className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white"
          aria-hidden
        >
          {initials(component.name)}
        </div>
      )}
      <div>
        {component.name ? (
          <h3 className="text-xl font-semibold text-white">{component.name}</h3>
        ) : null}
        {component.title ? (
          <p className="mt-1 text-sm font-medium uppercase tracking-wide text-white/70">
            {component.title}
          </p>
        ) : null}
        {component.bio ? (
          <p className="mt-4 text-base leading-relaxed text-white/85">{component.bio}</p>
        ) : null}
      </div>
    </section>
  );
}
