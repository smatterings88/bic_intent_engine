import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Business Impact Canada — Independent Sales Performance Research" },
      {
        name: "description",
        content:
          "An independent research initiative studying where sales conversations break down and why deals are lost.",
      },
    ],
  }),
  component: Index,
});

const researchAreas = [
  {
    title: "Conversation Breakdowns",
    body: "Identifying the precise moments in a sales dialogue where engagement, trust, or clarity collapses.",
  },
  {
    title: "Revenue Loss Patterns",
    body: "Quantifying the economic impact of failed deals across industries, deal sizes, and conversation types.",
  },
  {
    title: "Behavioral Signals",
    body: "Studying linguistic and behavioral cues that precede pipeline stalls, objections, and disengagement.",
  },
  {
    title: "Post-Pricing Dynamics",
    body: "Examining how pricing discussions reshape the trajectory of an opportunity—often invisibly.",
  },
];

const findings = [
  {
    tag: "Working Paper · 2026",
    title: "Why Deals Break After Pricing Discussions",
    summary:
      "An analysis of 4,200 conversation transcripts shows a measurable shift in buyer engagement within the 72 hours following price disclosure.",
  },
  {
    tag: "Field Study · 2025",
    title: "The Hidden Cost of \u201CSend Me Information\u201D",
    summary:
      "Requests for follow-up materials are commonly interpreted as interest. Our data suggests the opposite outcome in 68% of observed cases.",
  },
  {
    tag: "Brief · 2025",
    title: "Mid-Conversation Failures in Sales Calls",
    summary:
      "A taxonomy of the structural moments—questions, transitions, silences—where deals most often lose momentum.",
  },
];

function Index() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 pt-24 pb-20">
          <div className="eyebrow">Independent Research Initiative</div>
          <h1 className="mt-5 font-serif text-4xl md:text-6xl text-foreground leading-[1.05] max-w-3xl">
            Studying where sales conversations break down—and why deals are lost.
          </h1>
          <p className="mt-7 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            The Business Impact Canada is a non-commercial research initiative examining the
            structural, behavioral, and linguistic patterns that cause sales conversations to fail.
            Our work supports a clearer, evidence-based understanding of revenue loss.
          </p>
          <div className="mt-10 flex items-center gap-6 text-sm">
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Explore research →
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About the institute
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-6 py-20 grid md:grid-cols-3 gap-12">
          <div>
            <div className="eyebrow">Mission</div>
            <h2 className="mt-3 font-serif text-2xl text-foreground">What we study</h2>
          </div>
          <div className="md:col-span-2 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Most analysis of sales performance focuses on outcomes—win rates, quotas, pipeline
              coverage. The Institute focuses instead on the moments inside a conversation where
              outcomes are quietly determined.
            </p>
            <p>
              Through systematic review of anonymized conversations, structured interviews, and
              longitudinal pipeline studies, we publish findings intended to advance the
              understanding of conversational failure as a measurable economic phenomenon.
            </p>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="eyebrow">Why this research matters</div>
          <h2 className="mt-3 font-serif text-3xl text-foreground max-w-2xl">
            Lost conversations are an unmeasured cost of doing business.
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-10">
            {[
              {
                stat: "$2.3T",
                label:
                  "Estimated annual revenue lost to preventable conversation breakdowns across global B2B sales (Institute estimate, 2025).",
              },
              {
                stat: "61%",
                label:
                  "of qualified opportunities never reach a documented decision—they simply fade after a critical conversational moment.",
              },
              {
                stat: "4.7x",
                label:
                  "more likely a deal stalls when pricing is introduced before a shared definition of value is established.",
              },
            ].map((s) => (
              <div key={s.stat} className="border-t border-border pt-6">
                <div className="font-serif text-4xl text-primary">{s.stat}</div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research areas */}
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <div className="eyebrow">Research Areas</div>
              <h2 className="mt-3 font-serif text-3xl text-foreground">Active fields of inquiry</h2>
            </div>
            <Link to="/research" className="text-sm text-primary hover:underline">
              View all research →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
            {researchAreas.map((a) => (
              <div key={a.title} className="bg-background p-8">
                <h3 className="font-serif text-xl text-foreground">{a.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest findings */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="eyebrow">Latest Findings</div>
              <h2 className="mt-3 font-serif text-3xl text-foreground">Recent publications</h2>
            </div>
            <Link to="/insights" className="text-sm text-primary hover:underline">
              All insights →
            </Link>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {findings.map((f) => (
              <li key={f.title} className="py-7 grid md:grid-cols-[180px_1fr] gap-6">
                <div className="text-xs uppercase tracking-wider text-muted-foreground pt-1">
                  {f.tag}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{f.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
