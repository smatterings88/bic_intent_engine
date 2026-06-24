import type { FaqItem } from "@/types/content";

export function FAQBlock({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs.length) return null;
  return (
    <section className="border-t border-border bg-secondary/25">
      <div className="mx-auto max-w-4xl py-14 page-gutter md:py-16">
        <h2 className="font-serif text-2xl text-foreground sm:text-[1.65rem]">
          Frequently asked questions
        </h2>
        <dl className="mt-8 space-y-4 md:mt-10 md:space-y-5">
          {faqs.map((f) => (
            <div
              key={f.question}
              className="surface-card border-border/70 p-5 transition-shadow duration-200 hover:shadow-sm sm:p-6"
            >
              <dt className="font-medium text-foreground">{f.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {f.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
