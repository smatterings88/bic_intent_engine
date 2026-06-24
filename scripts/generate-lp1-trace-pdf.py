#!/usr/bin/env python3
"""Generate PDF for why-good-calls-dont-close#download CTA trace."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parent.parent / "docs" / "why-good-calls-dont-close-download-trace.pdf"


class TracePDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "SBI Intent Page Engine - CTA Trace", align="R", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def h1(self, text: str):
        self.set_x(self.l_margin)
        self.ln(4)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(30, 53, 96)
        self.multi_cell(0, 9, text)
        self.ln(2)

    def h2(self, text: str):
        self.set_x(self.l_margin)
        self.ln(3)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(30, 53, 96)
        self.multi_cell(0, 7, text)
        self.ln(1)

    def h3(self, text: str):
        self.set_x(self.l_margin)
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def body(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, text)
        self.ln(1)

    def bullet(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, f"  - {text}")

    def code_block(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Courier", "", 8)
        self.set_fill_color(245, 245, 245)
        self.set_text_color(20, 20, 20)
        for line in text.split("\n"):
            self.set_x(self.l_margin)
            self.cell(0, 4.5, line, new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(2)

    def table_row(self, col1: str, col2: str, header: bool = False):
        if header:
            self.set_font("Helvetica", "B", 9)
            self.set_fill_color(230, 235, 245)
        else:
            self.set_font("Helvetica", "", 9)
            self.set_fill_color(255, 255, 255)
        self.set_text_color(30, 30, 30)
        w1, w2 = 55, 135
        x0 = self.l_margin
        y0 = self.get_y()
        self.set_xy(x0, y0)
        self.multi_cell(w1, 5, col1, border=1, fill=True)
        y1 = self.get_y()
        self.set_xy(x0 + w1, y0)
        self.multi_cell(w2, 5, col2, border=1, fill=True)
        y2 = self.get_y()
        self.set_xy(x0, max(y1, y2))


def main():
    pdf = TracePDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    pdf.h1("CTA Trace: why-good-calls-dont-close#download")
    pdf.body("Page: https://businessimpactcanada.com/why-good-calls-dont-close#download")
    pdf.body("Generated: June 10, 2026")

    pdf.h2("Page profile")
    rows = [
        ("Slug", "why-good-calls-dont-close"),
        ("contentType", "landing_page"),
        ("renderMode", "html_snippet (custom HTML + scoped CSS)"),
        ("leadMagnetId", "the-call-felt-fine"),
        ("Form destination", "lead-magnet:the-call-felt-fine"),
        ("Form anchor", "#zenith-form-lead-magnet-the-call-felt-fine"),
        ("#download target", '<section class="download" id="download">'),
        ("Global footer", "Hidden (layout.hideGlobalFooter: true)"),
    ]
    pdf.table_row("Field", "Value", header=True)
    for a, b in rows:
        pdf.table_row(a, b)
    pdf.ln(3)
    pdf.body(
        "Production LP1 is ingested as html_snippet, not the structured components[] layout "
        "in the repo example JSON. There is one form on the page, inside #download."
    )

    pdf.h2("What #download does")
    pdf.body("The URL hash is browser-only - it is never sent to the server.")
    for step in [
        "Browser requests GET /why-good-calls-dont-close (200)",
        "Server returns full page HTML",
        "Browser paints the page",
        'Browser scrolls to id="download"',
        "User sees the download card + LeadForm",
    ]:
        pdf.bullet(step)
    pdf.ln(2)

    pdf.h2("1. Page load")
    pdf.body("Route: src/app/(marketing)/[slug]/page.tsx")
    for step in [
        "getPublishedZenithPageBySlug loads published doc from Firestore",
        "ZenithPageRenderer dispatches to html_snippet flow",
        "ZenithHtmlSnippetShell - full-bleed wrapper (no max-w marketing shell)",
        "ZenithHtmlRenderer injects scoped html.css + sanitized html.body",
        "data-sbi-slot placeholders replaced in-place with React LeadForm",
        "Middleware + SiteLayout hide global marketing footer via SSR",
    ]:
        pdf.bullet(step)
    pdf.ln(1)
    pdf.body("There is no embedded page JSON in public HTML. Config is loaded server-side from Firestore.")

    pdf.h2("2. CTA types")
    pdf.h3("A. Scroll CTAs -> #download (no API call)")
    pdf.table_row("CTA label", "Location / behavior", header=True)
    pdf.table_row(
        "See What The Recording Captured ->",
        "Hero - <a href=\"#download\"> scrolls to form",
    )
    pdf.table_row(
        "See All Seven Moments ->",
        "Mid-page - <a href=\"#download\"> scrolls to form",
    )
    pdf.ln(2)
    pdf.body("#download is the only in-page hash on this page.")

    pdf.h3("B. Conversion CTA - form submit (API + GHL)")
    pdf.body("Inside #download, inside .dl-card:")
    for item in [
        "Fields: Name, Email (landing_page rule)",
        "Submit: Download The Analysis Guide ->",
        "Form id: zenith-form-lead-magnet-the-call-felt-fine",
        "App LeadForm injected via slots[] lead-form entry",
    ]:
        pdf.bullet(item)

    pdf.h2("3. Full conversion trace (submit)")
    pdf.h3("Step 1 - Client validation")
    pdf.body("LeadForm validates name + email locally. No API call if validation fails.")

    pdf.h3("Step 2 - POST body")
    pdf.code_block(
        "POST /api/zenith/forms/submit\n"
        '{\n'
        '  "pageSlug": "why-good-calls-dont-close",\n'
        '  "slot": "<slot-id from Firestore>",\n'
        '  "variant": "lead-magnet-capture",\n'
        '  "destination": "lead-magnet:the-call-felt-fine",\n'
        '  "fields": { "name": "...", "email": "..." },\n'
        '  "tracking": { "utmSource", "path", "referrer", ... }\n'
        "}"
    )

    pdf.h3("Step 3 - Server processing")
    for step in [
        "Load ZenithPage from Firestore by pageSlug",
        "resolveStoredFormSource - tags/redirect from stored slot only",
        "Validate name + valid email for lead-magnet landing_page",
        "resolveZenithFormGhlTags (default: lead_magnet:the-call-felt-fine)",
        "Write zenithFormSubmissions document in Firestore",
        "syncContactWithTags -> GoHighLevel",
        "Return thankYouPageUrl or thankYouMessage",
    ]:
        pdf.bullet(step)
    pdf.body("Tags and redirect URLs come from stored config, not the client body.")

    pdf.h3("Step 4 - Client after success")
    pdf.body("Redirect to thankYouPageUrl via window.location.assign(), or show inline success message.")
    pdf.body("Expected redirect: /cta/thank-you-the-call-felt-fine")
    pdf.body(
        "Production note (June 2026): That thank-you URL currently returns HTTP 500. "
        "Submissions may still save and sync to GHL, but redirect may fail until TY page is fixed."
    )

    pdf.h2("4. Typical user journeys")
    for journey in [
        "A - Direct #download link: load -> scroll to form -> submit -> API + GHL -> redirect",
        "B - Hero CTA: click See What The Recording Captured -> scroll -> submit",
        "C - Mid-page CTA: click See All Seven Moments -> scroll -> submit",
    ]:
        pdf.bullet(journey)
    pdf.body("All paths converge on the same single form in #download.")

    pdf.h2("5. What does NOT happen")
    pdf.table_row("Action", "Result", header=True)
    for a, b in [
        ("Visit #download", "Browser scroll only"),
        ("Click scroll CTAs", "Browser scroll; no API"),
        ("Client custom GHL tags", "Ignored - server uses stored slot config"),
        ("Client custom redirect", "Ignored - server uses stored successBehavior"),
        ("ZenithCtaButton auto-scroll", "Not used - raw HTML anchors only"),
    ]:
        pdf.table_row(a, b)

    pdf.h2("6. LP1 vs repo example JSON")
    pdf.body(
        "docs/examples/zenith-lp1-forensic-landing-page-request.json describes a components page. "
        "Production uses html_snippet with CTAs scrolling to #download and one slot-backed LeadForm."
    )

    pdf.h2("7. Verify in admin Raw JSON")
    for item in [
        "slots[].slot - id sent in POST body",
        "slots[].successBehavior - redirect vs inline message",
        "slots[].ghlTagStrategy - exact GHL tags",
        "/cta/thank-you-the-call-felt-fine published and returns 200",
    ]:
        pdf.bullet(item)

    pdf.h2("Key source files")
    for item in [
        "src/app/(marketing)/[slug]/page.tsx - public route",
        "src/components/zenith/ZenithHtmlRenderer.tsx - HTML + slots",
        "src/components/zenith/components/LeadForm.tsx - client submit",
        "src/app/api/zenith/forms/submit/route.ts - server + GHL",
        "src/lib/zenith/slot-config.ts - stored form resolution",
        "src/lib/zenith/resolve-public-layout.ts - footer hide SSR",
    ]:
        pdf.bullet(item)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
