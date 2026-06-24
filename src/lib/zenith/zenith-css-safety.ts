export const MAX_ZENITH_CSS_BYTES = 100 * 1024;

export const ZENITH_HTML_SNIPPET_CLASS = "zenith-html-snippet";

const FORBIDDEN_CSS_PATTERNS: { re: RegExp; message: string }[] = [
  { re: /@import\b/i, message: "CSS @import is not allowed" },
  { re: /javascript:/i, message: "CSS javascript: URLs are not allowed" },
  { re: /expression\s*\(/i, message: "CSS expression() is not allowed" },
  { re: /behavior\s*:/i, message: "CSS behavior: is not allowed" },
  { re: /-moz-binding/i, message: "CSS -moz-binding is not allowed" },
  {
    re: /url\s*\(\s*['"]?\s*(?:https?:|\/\/|data:)/i,
    message: "CSS external or data url() references are not allowed",
  },
  { re: /@font-face\b/i, message: "CSS @font-face is not allowed" },
];

const GLOBAL_SELECTOR_RE = /^(html|body|:root)\b/i;

/** Attribute selector value for scoping (slug is already URL-safe). */
export function zenithHtmlScopeSelector(pageSlug: string): string {
  const slug = pageSlug.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `.${ZENITH_HTML_SNIPPET_CLASS}[data-zenith-page="${slug}"]`;
}

export function assertSafeZenithCssRaw(css: string): void {
  const trimmed = css.trim();
  if (!trimmed) return;
  if (Buffer.byteLength(trimmed, "utf8") > MAX_ZENITH_CSS_BYTES) {
    throw new Error(`html.css exceeds maximum size (${MAX_ZENITH_CSS_BYTES} bytes)`);
  }
  for (const { re, message } of FORBIDDEN_CSS_PATTERNS) {
    if (re.test(trimmed)) {
      throw new Error(message);
    }
  }
}

export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n\r]*/g, "");
}

export function prefixZenithCssSelectors(selectorList: string, scope: string): string {
  return selectorList
    .split(",")
    .map((part) => {
      const sel = part.trim();
      if (!sel) return sel;
      if (GLOBAL_SELECTOR_RE.test(sel)) {
        throw new Error(`CSS global selector is not allowed: ${sel}`);
      }
      if (sel.startsWith(scope)) {
        return sel;
      }
      return `${scope} ${sel}`;
    })
    .join(", ");
}

function findMatchingBrace(css: string, openIndex: number): number {
  let depth = 1;
  for (let j = openIndex + 1; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}") {
      depth--;
      if (depth === 0) return j;
    }
  }
  return -1;
}

function isKeyframesPrelude(prelude: string): boolean {
  const lower = prelude.trim().toLowerCase();
  return lower.startsWith("@keyframes") || lower.startsWith("@-webkit-keyframes");
}

function isNestableAtRule(prelude: string): boolean {
  const lower = prelude.trim().toLowerCase();
  return (
    lower.startsWith("@media") ||
    lower.startsWith("@supports") ||
    lower.startsWith("@layer") ||
    lower.startsWith("@container")
  );
}

function isForbiddenAtRule(prelude: string): boolean {
  const lower = prelude.trim().toLowerCase();
  return lower.startsWith("@import") || lower.startsWith("@charset");
}

/**
 * Prefix rule selectors with the page scope. @keyframes blocks are passed through unchanged.
 */
export function scopeZenithCss(css: string, pageSlug: string): string {
  const scope = zenithHtmlScopeSelector(pageSlug);
  const stripped = stripCssComments(css).trim();
  if (!stripped) return "";

  assertSafeZenithCssRaw(stripped);

  const out: string[] = [];
  let i = 0;

  while (i < stripped.length) {
    while (i < stripped.length && /\s/.test(stripped[i]!)) i++;
    if (i >= stripped.length) break;

    const brace = stripped.indexOf("{", i);
    if (brace === -1) {
      const tail = stripped.slice(i).trim();
      if (tail) {
        throw new Error("Invalid CSS: unexpected trailing content");
      }
      break;
    }

    const prelude = stripped.slice(i, brace).trim();
    const close = findMatchingBrace(stripped, brace);
    if (close === -1) {
      throw new Error("Invalid CSS: unclosed block");
    }

    const inner = stripped.slice(brace + 1, close);
    i = close + 1;

    if (isForbiddenAtRule(prelude)) {
      throw new Error("CSS @import is not allowed");
    }

    if (isKeyframesPrelude(prelude)) {
      out.push(`${prelude}{${inner}}`);
      continue;
    }

    if (isNestableAtRule(prelude)) {
      const scopedInner = scopeZenithCss(inner, pageSlug);
      out.push(`${prelude}{${scopedInner}}`);
      continue;
    }

    if (prelude.startsWith("@")) {
      if (inner.includes("{")) {
        out.push(`${prelude}{${scopeZenithCss(inner, pageSlug)}}`);
      } else {
        out.push(`${prelude}{${inner}}`);
      }
      continue;
    }

    const prefixed = prefixZenithCssSelectors(prelude, scope);
    out.push(`${prefixed}{${inner}}`);
  }

  return out.join("");
}

export function sanitizeZenithCss(raw: string, pageSlug: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  return scopeZenithCss(trimmed, pageSlug);
}
