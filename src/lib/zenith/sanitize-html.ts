import sanitizeHtml from "sanitize-html";

const MAX_HTML_BYTES = 250 * 1024;

const ALLOWED_TAGS = [
  "main",
  "section",
  "div",
  "article",
  "header",
  "footer",
  "nav",
  "aside",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "small",
  "br",
  "hr",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "blockquote",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "code",
  "pre",
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  "*": [
    "class",
    "id",
    "role",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "data-sbi-slot",
  ],
  a: ["href", "target", "rel", "title"],
  img: ["src", "alt", "width", "height", "loading"],
  th: ["scope", "colspan", "rowspan"],
  td: ["colspan", "rowspan"],
};

const FORBIDDEN_TAG_RE =
  /<\s*(form|input|textarea|select|option|button|script|style|iframe|object|embed|link|meta|base)\b/i;
const EVENT_HANDLER_RE = /\s+on[a-z]+\s*=/i;
const JS_URL_RE = /(?:href|src|xlink:href)\s*=\s*["']\s*javascript:/i;

export function assertSafeZenithHtmlRaw(html: string): void {
  if (FORBIDDEN_TAG_RE.test(html)) {
    throw new Error("HTML contains forbidden tags (form, style, script, iframe, input, etc.)");
  }
  if (EVENT_HANDLER_RE.test(html)) {
    throw new Error("HTML contains inline event handlers");
  }
  if (JS_URL_RE.test(html)) {
    throw new Error("HTML contains javascript: URLs");
  }
}

export function sanitizeZenithHtmlBody(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("html.body is required and must be non-empty");
  }
  if (Buffer.byteLength(trimmed, "utf8") > MAX_HTML_BYTES) {
    throw new Error(`html.body exceeds maximum size (${MAX_HTML_BYTES} bytes)`);
  }
  assertSafeZenithHtmlRaw(trimmed);

  const clean = sanitizeHtml(trimmed, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => {
        const next = { ...attribs };
        if (next.target === "_blank") {
          next.rel = "noopener noreferrer";
        }
        return { tagName, attribs: next };
      },
    },
  });

  if (!clean.trim()) {
    throw new Error("html.body was empty after sanitization");
  }
  return clean;
}

export function extractSlotIdsFromHtml(html: string): string[] {
  const ids: string[] = [];
  const re = /data-sbi-slot=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const id = m[1]?.trim();
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}
