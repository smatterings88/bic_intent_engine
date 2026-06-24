import type { LandingPage } from "@/types/landing-page";

export function LandingSections({ landingPage }: { landingPage: LandingPage }) {
  if (!landingPage.sections.length) return null;
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-4xl py-14 page-gutter md:py-16">
        <div className="space-y-14">
          {landingPage.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="font-serif text-2xl text-foreground">{section.heading}</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">{section.body}</p>
              {section.bullets?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
