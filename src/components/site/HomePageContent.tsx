import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    id: "p1",
    num: "Program 01",
    title: "Marketing Mastery",
    body: "How to communicate your value to the people who need it — in language they recognize, through channels they trust.",
  },
  {
    id: "p2",
    num: "Program 02",
    title: "Sales Mastery",
    body: "Why good conversations don't close — and what's actually happening in the moments buyers go quiet.",
  },
  {
    id: "p3",
    num: "Program 03",
    title: "Mindset & Leadership",
    body: "The internal clarity that makes external communication possible. You can't lead people you haven't learned to speak to.",
  },
  {
    id: "p4",
    num: "Program 04",
    title: "Strategy & Execution",
    body: "A plan nobody understands doesn't get executed. Strategy is communication — from priorities to calendar.",
  },
] as const;

const testimonials = [
  {
    id: "sarah",
    quote:
      "I'd been in business four years. I thought my marketing problem was a budget problem. Turned out it was a message problem. The Marketing Mastery program rewired how I talk about what I do — in 90 minutes.",
    name: "Sarah M.",
    role: "Freelance Consultant, Ontario",
  },
  {
    id: "david",
    quote:
      "Three sales calls in a row that felt perfect — and didn't close. After the Sales Mastery materials I understood exactly what was happening. It was a communication moment I was missing every time.",
    name: "David R.",
    role: "B2B Founder, British Columbia",
  },
  {
    id: "priya",
    quote:
      "I knew what I wanted to build. I just couldn't get my team moving in the same direction. The Strategy & Execution module was the clearest framework I've found — and it's free.",
    name: "Priya K.",
    role: "Startup Founder, Alberta",
  },
] as const;

export function HomePageContent() {
  return (
    <>
      <section className="bic-hero" aria-label="Mission statement">
        <div className="site-container">
          <div className="bic-hero-inner">
            <span className="bic-hero-eyebrow">Nonprofit · Free · Canadian</span>
            <h1>
              Every Business Problem Is a Communication Problem <em>in Disguise</em>
            </h1>
            <p className="bic-hero-sub">
              Free communication education for entrepreneurs who are ready to make the impact they
              came here to make.
            </p>
            <div className="bic-hero-ctas">
              <Link href="/resources" className="btn-primary">
                Access Free Resources
              </Link>
              <Link href="/about" className="btn-ghost">
                About Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="programs-section" aria-label="Program areas">
        <div className="site-container">
          <div className="mb-11">
            <p className="section-eyebrow">Free Programs</p>
            <h2 className="section-title">Four Areas. One Root Cause.</h2>
            <p className="section-sub mt-3">
              Every program comes back to the same insight: most business problems are communication
              problems in disguise. We teach you to find them.
            </p>
          </div>
          <div className="programs-grid">
            {programs.map((program) => (
              <div key={program.id} className={`program-card ${program.id}`}>
                <span className="program-num">{program.num}</span>
                <h3>{program.title}</h3>
                <p>{program.body}</p>
                <Link href="/programs" className="program-link">
                  Explore program
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" aria-label="About Business Impact Canada">
        <div className="site-container">
          <div className="about-grid">
            <div>
              <Image
                src="/images/ken.jpg"
                alt="Ken Krell, founder of Business Impact Canada"
                width={320}
                height={320}
                className="ken-photo"
                priority
              />
              <p className="ken-photo-caption">Ken Krell — Founder, Business Impact Canada</p>
            </div>
            <div className="about-content">
              <p className="section-eyebrow">Who We Are</p>
              <h2 className="section-title mb-4">
                Built by People Who Know What Poor Communication Costs
              </h2>
              <p>
                Business Impact Canada was founded on a specific observation: the entrepreneurs who
                struggle most aren&apos;t short on passion, intelligence, or work ethic.
                They&apos;re short on communication clarity — in their marketing, in their sales
                conversations, in how they lead, and in how they execute on a strategy.
              </p>
              <p>
                They can&apos;t articulate their value in a way buyers understand. They have great
                sales conversations that somehow don&apos;t close. They set a direction but
                can&apos;t get their team — or themselves — to follow it. These aren&apos;t
                personality problems. They&apos;re communication problems. And they&apos;re
                solvable.
              </p>
              <p>
                Business school costs thousands. Coaches charge $500/month. We made the good stuff
                free — because the world needs more businesses that actually work.
              </p>
              <Link href="/about" className="about-link">
                Read our full story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section" aria-label="Entrepreneur feedback">
        <div className="site-container">
          <p className="section-eyebrow">Real Entrepreneurs</p>
          <h2 className="section-title">What Happens When the Communication Gap Closes</h2>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.id} className="testimonial-card">
                <p className="testimonial-quote">{t.quote}</p>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sherpa-section" aria-label="Featured partner resource">
        <div className="site-container">
          <div className="sherpa-box">
            <div>
              <span className="sherpa-tag">Featured Partner Resource</span>
              <h2>Your Sales Call Is a Communication Event. Do You Know Where Yours Broke Down?</h2>
              <p>
                Most lost deals are decided in a specific communication moment mid-call — a signal
                the buyer sent that went unread, a question that wasn&apos;t asked, a hesitation
                that got steamrolled. Our partner Alex The Sherpa takes a recording of a real sales
                call and identifies exactly where those moments were.
              </p>
              <p>
                This is a communication diagnostic on your specific conversation. We recommend it to
                every entrepreneur working through Sales Mastery.
              </p>
              <p className="sherpa-note">
                Free resource from our partner · No cost, no commitment · External link to
                alexthesherpa.com
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2.5">
              <a
                href="https://alexthesherpa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sherpa"
              >
                Get Your Free
                <br />
                Sales Analysis →
              </a>
              <span className="sherpa-link-note">Opens alexthesherpa.com in a new tab</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
