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
    <section className="bic-page-hero">
      <div className="site-container">
        <div className="bic-page-hero-inner">
          <p className="section-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lede ? <p>{lede}</p> : null}
        </div>
      </div>
    </section>
  );
}
