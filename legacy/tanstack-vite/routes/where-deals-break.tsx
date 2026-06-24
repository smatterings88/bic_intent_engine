import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/SiteLayout";

export const Route = createFileRoute("/where-deals-break")({
  head: () => ({
    meta: [
      { title: "Where Deals Break — Sales Breakdown Institute" },
      {
        name: "description",
        content:
          "A behavioral analysis of sales conversation failure. A research report synthesizing observed patterns and published findings on where deals break down.",
      },
      {
        property: "og:title",
        content: "Where Deals Break: A Behavioral Analysis of Sales Conversation Failure",
      },
      {
        property: "og:description",
        content:
          "An independent research report on the early-stage conversational moments that determine the outcome of B2B sales opportunities.",
      },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research Report · 2026"
        title="Where Deals Break: A Behavioral Analysis of Sales Conversation Failure"
        lede="A synthesis of published research and observed conversational patterns examining when, where, and why B2B sales opportunities collapse."
      />

      <article className="mx-auto max-w-3xl px-6 py-16 prose-research">
        <Meta />

        <Section number="1" title="Executive Summary">
          <p>
            The conventional view of sales failure locates the decisive moment at the close—the
            point at which a buyer formally declines or disengages. The available evidence suggests
            otherwise. Deals are rarely lost at the close; they are lost much earlier, often within
            the first substantive conversation, and frequently in ways that neither party recognizes
            at the time.
          </p>
          <p>
            A consistent finding across published research is that a large share of B2B
            opportunities—commonly estimated between 40% and 60%—do not end in a competitive loss
            but in <em>no decision</em>. The buyer does not select another vendor. The buyer selects
            inaction. This pattern reframes the problem of sales failure: the primary competitor in
            most opportunities is not another provider but the status quo.
          </p>
          <p>
            This report synthesizes findings from major industry studies, academic work on buyer
            behavior, and internal observational analysis of sales conversations. Its purpose is not
            to prescribe a methodology but to describe, with appropriate caution, the structural and
            behavioral moments where deals most often break.
          </p>
        </Section>

        <Callout label="Key Finding">
          Across multiple datasets, an estimated 40–60% of qualified B2B opportunities end in no
          decision rather than a competitive loss.
        </Callout>

        <Section number="2" title="Where Deals Actually Break">
          <p>
            Comparative analyses of recorded sales conversations have produced a counterintuitive
            observation: closing calls in won and lost deals look broadly similar. The behavioral
            signatures of success or failure are not concentrated at the end of the cycle. They
            appear earlier, often in the first or second substantive exchange.
          </p>
          <p>
            Discovery depth—measured by question variety, topic coverage, and the proportion of
            conversation devoted to the buyer's situation rather than the seller's offering—emerges
            repeatedly as a differentiating variable between won and lost opportunities. Deals in
            which discovery is shallow or rushed are disproportionately represented in the
            population of opportunities that ultimately end in no decision.
          </p>
          <p>
            The implication is that by the time a deal reaches its formal close, much of its outcome
            has already been determined. The closing conversation is, in many cases, a ratification
            of dynamics established weeks earlier.
          </p>
        </Section>

        <Section number="3" title="Critical Moments Where Deals Collapse">
          <p>
            Within the broader trajectory of a sales cycle, four moments recur as points of
            structural fragility. Each is associated with a distinct mode of failure.
          </p>

          <Subsection title="Discovery Breakdown">
            <p>
              Discovery fails when the seller exits the conversation with an incomplete map of the
              buyer's situation: unidentified stakeholders, unstated constraints, unmeasured
              consequences of inaction. The deficit is rarely visible at the moment it occurs. It
              surfaces later, when proposals fail to address the buyer's actual decision criteria,
              or when internal champions cannot articulate the case for change.
            </p>
          </Subsection>

          <Subsection title="Pricing Inflection">
            <p>
              The disclosure of price functions as a structural inflection point in the
              conversation. Observational data indicate a measurable decline in buyer-initiated
              communication in the window following price disclosure. Where the value framing
              preceding the price is thin, the silence that follows tends to extend; where it is
              substantive, engagement more often resumes.
            </p>
          </Subsection>

          <Subsection title="Objection Handling">
            <p>
              Objections that are answered too quickly, or with rehearsed counters, often fail to
              resolve the underlying concern. The objection recedes from the conversation but
              persists in the buyer's deliberation. In lost deals, unresolved objections frequently
              reappear—reframed as procedural delays, budget questions, or requests for additional
              information.
            </p>
          </Subsection>

          <Subsection title="Engagement Loss">
            <p>
              Engagement loss is rarely declared. It is inferred from observable signals:
              lengthening response intervals, shorter messages, reduced stakeholder participation,
              and the substitution of substantive dialogue with administrative follow-up. Once these
              patterns appear, recovery is uncommon.
            </p>
          </Subsection>
        </Section>

        <Section number="4" title="The Speed of Failure">
          <p>
            The earliest moments of a sales conversation appear to exert a disproportionate
            influence on what follows. Studies of recorded calls suggest that patterns established
            in the opening minutes—the balance of speaking time, the texture of the seller's
            questions, the buyer's willingness to extend rather than truncate answers—correlate with
            downstream outcomes.
          </p>
          <p>
            Extended seller monologues are negatively correlated with success. Conversations
            characterized by frequent turn-taking, short seller utterances, and longer buyer
            responses are associated with more favorable outcomes. The directionality of the
            relationship is not fully established; interactive conversations may produce better
            outcomes, or buyers who are already inclined to engage may produce interactive
            conversations. Both interpretations are consistent with the data.
          </p>
          <p>
            Precise timing thresholds—how many minutes, how many seconds—are not reliably
            established in the public literature. The general shape of the relationship is well
            supported; the specific numbers are not.
          </p>
        </Section>

        <Section number="5" title="Behavioral Patterns in Lost Deals">
          <p>
            Across observed lost opportunities, a recurring set of behavioral patterns appears with
            sufficient regularity to warrant description.
          </p>

          <Subsection title="Over-talking">
            <p>
              Sellers occupy a disproportionate share of conversational time, often in response to
              discomfort with silence rather than as a deliberate choice. The buyer's opportunity to
              surface concerns contracts accordingly.
            </p>
          </Subsection>

          <Subsection title="Weak Discovery">
            <p>
              Questions are limited in number, narrow in scope, or concentrated on confirming the
              seller's hypothesis rather than exploring the buyer's situation. The conversation
              moves toward presentation before the underlying problem is fully articulated.
            </p>
          </Subsection>

          <Subsection title="Over-pitching">
            <p>
              The volume and specificity of product information presented exceeds what the buyer is
              positioned to evaluate. Detail substitutes for fit; the buyer disengages from material
              they cannot yet contextualize.
            </p>
          </Subsection>

          <Subsection title="Poor Objection Handling">
            <p>
              Objections are treated as obstacles to be overcome rather than signals to be
              understood. Responses are rapid, defensive, or dismissive. The objection is rarely
              resolved; it is simply displaced.
            </p>
          </Subsection>

          <Subsection title="Lack of Next Steps">
            <p>
              Conversations end without an explicit, mutually acknowledged next action. Follow-up
              depends on asynchronous initiative, which is unreliable. The opportunity drifts.
            </p>
          </Subsection>
        </Section>

        <Section number="6" title="Why These Failures Happen">
          <p>
            The behavioral patterns above are not primarily failures of skill. They are
            responses—often rational ones—to the cognitive conditions under which buyers make
            decisions. Several findings from behavioral economics and decision research are
            relevant.
          </p>

          <Subsection title="Loss Aversion">
            <p>
              The prospective pain of a wrong choice typically outweighs the prospective benefit of
              a right one. Buyers therefore evaluate change against an asymmetric cost function, in
              which inaction is systematically advantaged.
            </p>
          </Subsection>

          <Subsection title="Status Quo Bias">
            <p>
              Existing arrangements accrue a default advantage that is independent of their merits.
              The current state is familiar, its flaws are known, and its abandonment requires
              justification that its continuation does not.
            </p>
          </Subsection>

          <Subsection title="Decision Fatigue">
            <p>
              Complex purchases require sustained cognitive effort distributed across multiple
              stakeholders. As the decision extends, the marginal cost of further deliberation rises
              and the appeal of deferral grows.
            </p>
          </Subsection>

          <Subsection title="Risk Perception">
            <p>
              Buyers evaluate not only the proposed outcome but the personal and professional risk
              of being associated with a decision that fails. In environments where the cost of a
              visible error exceeds the reward for a successful change, the rational choice is often
              to remain still.
            </p>
          </Subsection>
        </Section>

        <Section number="7" title="Implications">
          <p>
            Deal failure is, to a substantial degree, a behavioral phenomenon rather than a
            structural one. The pipeline stage at which a loss is recorded is often a poor indicator
            of the moment at which the loss became likely.
          </p>
          <p>
            Small conversational behaviors—the length of a pause, the framing of a question, the
            speed of a response to an objection—accumulate into the trajectory of an opportunity.
            Their effects are not visible in any single exchange, but they are visible in aggregate.
          </p>
          <p>
            Most deals fail earlier than the participants believe. Recognizing this displaces
            attention from the close, where intervention has limited effect, toward the early-stage
            conversation, where it still has consequence.
          </p>
        </Section>

        <Section number="8" title="Research Limitations">
          <p>
            Several limitations apply to the findings discussed in this report and should be stated
            plainly.
          </p>
          <p>
            Much of the most granular data on sales conversations is proprietary, held by individual
            organizations or by vendors of recording infrastructure. Independent replication is
            consequently limited. Where public studies exist, they are frequently observational
            rather than experimental, which constrains causal inference.
          </p>
          <p>
            Timing precision—the exact intervals at which conversational shifts predict outcomes—is
            not reliably established. The directional relationships are well supported; the
            numerical thresholds frequently cited in industry materials are not.
          </p>
          <p>
            Findings should therefore be read as descriptive of consistent patterns rather than as
            quantitative laws.
          </p>
        </Section>

        <Section number="9" title="Observed Breakdown Patterns (Internal Analysis)">
          <p>
            Drawing on internal review of anonymized sales conversations, the following patterns
            recur with sufficient frequency to be noted. They are presented descriptively, without
            prescription.
          </p>
          <ul className="list-disc pl-6 space-y-3 my-6 text-muted-foreground">
            <li>
              <strong className="text-foreground font-medium">
                Hesitation at pricing moments.
              </strong>{" "}
              Sellers frequently pause, hedge, or restructure the price statement mid-sentence. The
              hesitation is itself a signal to the buyer, and it tends to elicit a corresponding
              withdrawal.
            </li>
            <li>
              <strong className="text-foreground font-medium">Vague follow-up requests.</strong> The
              phrase "send me some information" appears repeatedly in conversations that do not
              progress. It functions, in most observed cases, as a polite form of disengagement
              rather than a genuine request for material.
            </li>
            <li>
              <strong className="text-foreground font-medium">Shallow discovery.</strong> Discovery
              sequences often terminate after three to five questions, with the seller transitioning
              to presentation before the buyer's situation has been substantively mapped.
            </li>
            <li>
              <strong className="text-foreground font-medium">
                Loss of clarity or confidence.
              </strong>{" "}
              Audible shifts in seller cadence—filler words, sentence restarts, declining
              specificity—appear at moments when the conversation moves beyond prepared material.
              These shifts often precede a corresponding decline in buyer engagement.
            </li>
            <li>
              <strong className="text-foreground font-medium">Asymmetric closure.</strong>{" "}
              Conversations frequently end with the seller summarizing while the buyer offers
              minimal acknowledgment. The absence of a jointly stated next step is, in observed
              data, a stronger negative indicator than any single content failure within the call
              itself.
            </li>
          </ul>
        </Section>

        <hr className="my-16 border-border" />

        <p className="text-sm text-muted-foreground italic">
          This report is published by the Sales Breakdown Institute as part of its ongoing program
          of research into the behavioral and structural determinants of sales outcomes. Findings
          are intended for educational and analytical use.
        </p>
      </article>
    </>
  );
}

function Meta() {
  return (
    <div className="mb-12 grid grid-cols-2 gap-6 border-y border-border py-6 text-sm">
      <div>
        <div className="eyebrow mb-1">Published</div>
        <div className="text-foreground">May 2026</div>
      </div>
      <div>
        <div className="eyebrow mb-1">Category</div>
        <div className="text-foreground">Behavioral Analysis</div>
      </div>
      <div>
        <div className="eyebrow mb-1">Format</div>
        <div className="text-foreground">Research Report</div>
      </div>
      <div>
        <div className="eyebrow mb-1">Length</div>
        <div className="text-foreground">~3,000 words</div>
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-serif text-sm text-primary tabular-nums">
          {number.padStart(2, "0")}
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-tight">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="font-serif text-lg text-foreground mb-3">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Callout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <aside className="my-10 border-l-2 border-primary bg-secondary/50 px-6 py-5">
      <div className="eyebrow mb-2">{label}</div>
      <p className="text-foreground leading-relaxed m-0">{children}</p>
    </aside>
  );
}
