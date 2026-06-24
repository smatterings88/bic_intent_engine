/** Split sanitized HTML on empty `<div data-sbi-slot="…"></div>` placeholders. */
export type HtmlSlotSegment = { kind: "html"; html: string } | { kind: "slot"; slotId: string };

const SLOT_DIV_RE = /<div\b[^>]*\bdata-sbi-slot\s*=\s*["']([^"']+)["'][^>]*>\s*<\/div>/gi;

export function splitHtmlBySbiSlots(sanitizedHtml: string): HtmlSlotSegment[] {
  const segments: HtmlSlotSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(SLOT_DIV_RE.source, "gi");
  while ((match = re.exec(sanitizedHtml)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "html", html: sanitizedHtml.slice(lastIndex, match.index) });
    }
    segments.push({ kind: "slot", slotId: match[1].trim() });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < sanitizedHtml.length) {
    segments.push({ kind: "html", html: sanitizedHtml.slice(lastIndex) });
  }
  if (segments.length === 0 && sanitizedHtml.trim()) {
    segments.push({ kind: "html", html: sanitizedHtml });
  }
  return segments;
}
