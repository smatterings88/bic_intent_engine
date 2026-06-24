import { Link, Outlet } from "@tanstack/react-router";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/research", label: "Research" },
  { to: "/programs", label: "Programs" },
  { to: "/insights", label: "Insights" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-serif text-sm">
            S
          </span>
          <span className="font-serif text-base text-foreground">Sales Breakdown Institute</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 max-w-md">
          <div className="font-serif text-foreground text-lg">Sales Breakdown Institute</div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Sales Breakdown Institute is an independent research initiative focused on sales
            performance analysis and educational insights.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Sales Breakdown Institute, formerly known as the Digital Builders Association, is a
            registered 501(c)(3) nonprofit corporation in Washington, D.C.
          </p>
          <div className="mt-5 text-sm text-muted-foreground space-y-4">
            <div>research@salesbreakdowninstitute.com</div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground/80 mb-1">
                Mailing Address
              </div>
              <div>1968 S. Coast Hwy, #265</div>
              <div>Laguna Beach, CA 92651</div>
              <div>United States</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground/80 mb-1">
                Registered Office
              </div>
              <div>1717 N Street NW, STE 1</div>
              <div>Washington, D.C. 20036</div>
              <div>United States</div>
            </div>
          </div>
        </div>
        <div>
          <div className="eyebrow mb-3">Institute</div>
          <ul className="space-y-2 text-sm">
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/research">Research</FooterLink>
            <FooterLink to="/programs">Programs</FooterLink>
            <FooterLink to="/insights">Insights</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">Legal</div>
          <ul className="space-y-2 text-sm">
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/terms">Terms of Use</FooterLink>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Sales Breakdown Institute. All rights reserved.</div>
          <div>Independent research · Non-commercial</div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors">
        {children}
      </Link>
    </li>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl text-foreground leading-[1.1]">
          {title}
        </h1>
        {lede && (
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">{lede}</p>
        )}
      </div>
    </section>
  );
}
