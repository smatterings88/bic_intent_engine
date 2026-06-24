import type { FaqSectionComponent } from "@/types/zenith-content";

export function FaqSection({ component }: { component: FaqSectionComponent }) {
  if (!component.faqs?.length) return null;
  return (
    <section className="my-12" aria-labelledby="zenith-faq-heading">
      <h2 id="zenith-faq-heading" className="font-serif text-2xl font-semibold text-slate-900">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 space-y-8">
        {component.faqs.map((f) => (
          <div key={f.question}>
            <h3 className="text-lg font-semibold text-slate-900">{f.question}</h3>
            <p className="mt-2 text-base leading-relaxed text-slate-700">{f.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
