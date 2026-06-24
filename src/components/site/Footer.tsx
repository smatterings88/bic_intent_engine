import Link from "next/link";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href}>{children}</Link>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <div className="site-footer-logo">
              Business Impact <span className="text-primary">Canada</span>
            </div>
            <p>
              Free business education for impact-driven entrepreneurs across Canada. A registered
              nonprofit foundation. All programs free — always.
            </p>
            <p className="mt-3 text-[11px] text-white/30">
              15213614 Canada Foundation
              <br />
              1771 Robson Street, Vancouver, BC V6G 3B7
            </p>
          </div>
          <div className="site-footer-col">
            <h4>Programs</h4>
            <ul>
              <FooterLink href="/programs">Marketing Mastery</FooterLink>
              <FooterLink href="/programs">Sales Mastery</FooterLink>
              <FooterLink href="/programs">Mindset &amp; Leadership</FooterLink>
              <FooterLink href="/programs">Strategy &amp; Execution</FooterLink>
            </ul>
          </div>
          <div className="site-footer-col">
            <h4>Organization</h4>
            <ul>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/resources">Free Resources</FooterLink>
              <FooterLink href="/donate">Donate</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </ul>
          </div>
        </div>
        <div className="site-footer-bottom">
          <span>
            © {new Date().getFullYear()} Business Impact Canada · 15213614 Canada Foundation · All
            programs free
          </span>
          <span>
            <a href="mailto:businessimpactcanada@gmail.com">businessimpactcanada@gmail.com</a>
            &nbsp;·&nbsp;
            <Link href="/privacy">Privacy</Link>
            &nbsp;·&nbsp;
            <Link href="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
