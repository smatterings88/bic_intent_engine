import { ImageResponse } from "@vercel/og";

import { getZenithPageBySlug } from "@/lib/zenith/firestore";
import { resolveOgImageTemplate } from "@/lib/zenith/og";
import { buildAbsoluteUrl } from "@/lib/zenith/routes";
import type { OgImageTemplate } from "@/types/zenith-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

const NAVY = "#071229";
const NAVY_SOFT = "#0f2744";
const TEXT = "#f4f7fb";
const MUTED = "#9db3cc";
const ACCENT = "#3d7ea6";

function ForensicAccent() {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: 6,
        height: "100%",
        background: `linear-gradient(180deg, ${ACCENT} 0%, transparent 70%)`,
      }}
    />
  );
}

function Mark() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: 1.2 }}>
        BUSINESS IMPACT CANADA
      </div>
      <div style={{ fontSize: 14, color: MUTED, letterSpacing: 2 }}>BIC</div>
    </div>
  );
}

function FallbackOg() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 72,
        backgroundColor: NAVY,
        position: "relative",
      }}
    >
      <ForensicAccent />
      <Mark />
      <div style={{ marginTop: 48, fontSize: 64, fontWeight: 800, color: TEXT, lineHeight: 1.05 }}>
        Business Impact Canada
      </div>
      <div style={{ marginTop: 20, fontSize: 32, color: MUTED }}>Free Communication Education</div>
    </div>
  );
}

function TemplateLayout({
  eyebrow,
  headline,
  subhead,
  signal,
  template,
}: {
  eyebrow?: string;
  headline: string;
  subhead?: string;
  signal?: string;
  template: OgImageTemplate;
}) {
  const bg = template === "lead-magnet" ? NAVY_SOFT : NAVY;
  const showSignal = Boolean(signal) && template !== "lead-magnet" && template !== "cta-upload";
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        backgroundColor: bg,
        position: "relative",
      }}
    >
      <ForensicAccent />
      <Mark />
      {eyebrow ? (
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            fontWeight: 600,
            color: ACCENT,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          marginTop: eyebrow ? 16 : 48,
          fontSize: template === "cta-upload" ? 68 : 58,
          fontWeight: 800,
          color: TEXT,
          lineHeight: 1.05,
          maxWidth: 1000,
        }}
      >
        {headline}
      </div>
      {subhead ? (
        <div style={{ marginTop: 20, fontSize: 30, color: MUTED, maxWidth: 980 }}>{subhead}</div>
      ) : null}
      {showSignal ? (
        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 56,
            fontSize: 22,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            color: MUTED,
            maxWidth: 900,
          }}
        >
          {signal}
        </div>
      ) : null}
      {template === "forensic-article" ? (
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: 56,
            width: 220,
            height: 2,
            background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
          }}
        />
      ) : null}
    </div>
  );
}

function eyebrowForTemplate(t: OgImageTemplate): string | undefined {
  switch (t) {
    case "webinar-event":
      return "LIVE EVENT";
    case "lead-magnet":
      return "FREE GUIDE";
    case "research-report":
      return "RESEARCH";
    default:
      return undefined;
  }
}

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await context.params;
  const slug = decodeURIComponent(rawSlug);

  if (slug === "default") {
    return new ImageResponse(<FallbackOg />, {
      ...SIZE,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  const page = await getZenithPageBySlug(slug);
  if (!page) {
    return new ImageResponse(<FallbackOg />, {
      ...SIZE,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const cdn = page.ogImage?.cdnUrl?.trim();
  if (cdn) {
    const target =
      cdn.startsWith("http://") || cdn.startsWith("https://")
        ? cdn
        : buildAbsoluteUrl(cdn.startsWith("/") ? cdn : `/${cdn}`);
    return Response.redirect(target, 302);
  }

  const template = resolveOgImageTemplate(page);
  const headline = page.ogImage?.headline?.trim() || page.title?.trim() || "Business Impact Canada";
  const subhead = page.ogImage?.subhead?.trim() || page.seo?.ogDescription?.trim();
  const signal = page.ogImage?.signal?.trim();
  const eyebrow = eyebrowForTemplate(template);

  const cache =
    page.status === "published"
      ? "public, s-maxage=600, stale-while-revalidate=86400"
      : "private, no-store";

  return new ImageResponse(
    <TemplateLayout
      template={template}
      eyebrow={eyebrow}
      headline={headline}
      subhead={subhead}
      signal={signal}
    />,
    {
      ...SIZE,
      headers: { "Cache-Control": cache },
    },
  );
}
