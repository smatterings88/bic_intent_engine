export function AnswerBlock({ text }: { text: string }) {
  return (
    <section className="border-b border-border bg-muted/25">
      <div className="mx-auto max-w-4xl py-12 page-gutter md:py-14">
        <div className="rounded-xl border border-border/80 border-l-4 border-l-primary bg-card/90 p-6 shadow-sm backdrop-blur-[2px] sm:p-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Direct answer
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground sm:text-xl">{text}</p>
        </div>
      </div>
    </section>
  );
}
