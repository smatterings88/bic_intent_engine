import type { LandingPage } from "@/types/landing-page";

export function LandingProofBlock({ landingPage }: { landingPage: LandingPage }) {
  const proof = landingPage.proof;
  if (!proof?.length) return null;
  return (
    <section className="border-b border-border bg-secondary/15">
      <div className="mx-auto max-w-4xl py-14 page-gutter">
        <h2 className="font-serif text-2xl text-foreground">Evidence</h2>
        <ul className="mt-8 space-y-8">
          {proof.map((item, i) => (
            <li key={i} className="border-l-2 border-primary/40 pl-5">
              {item.stat ? (
                <p className="font-serif text-xl text-foreground leading-snug">{item.stat}</p>
              ) : null}
              {item.explanation ? (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.explanation}
                </p>
              ) : null}
              {item.sourceLabel ? (
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {item.sourceLabel}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
