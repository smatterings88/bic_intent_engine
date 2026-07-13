/**
 * BIC article html_snippets are often exported as full mini-pages (top bar, header/nav,
 * breadcrumbs, hero, footer). When rendered under the global SiteLayout on /articles/*,
 * that chrome must be removed so only the article body remains.
 */
export function stripEmbeddedSiteChromeFromArticleHtml(html: string): string {
  let out = html.trim();
  if (!out) return out;

  // Nonprofit banner line above the embedded header.
  out = out.replace(/^<div[^>]*>[\s\S]*?Registered Canadian Nonprofit[\s\S]*?<\/div>\s*/i, "");

  // Embedded site header (logo + nav).
  out = out.replace(/<header>[\s\S]*?<\/header>\s*/i, "");

  // Breadcrumb row (Home › Resources › …).
  out = out.replace(
    /<div>\s*<div>\s*<a\s+href="\/"[^>]*>\s*Home\s*<\/a>[\s\S]*?<\/div>\s*<\/div>\s*/i,
    "",
  );

  // Hero section immediately before the article body.
  out = out.replace(/<section>[\s\S]*?<h1[\s\S]*?<\/h1>[\s\S]*?<\/section>\s*(?=<article\b)/i, "");

  // Embedded page footer (mini-page export includes a duplicate site footer).
  out = out.replace(/<footer>[\s\S]*?<\/footer>\s*/gi, "");

  // Unwrap outer <article> so ZenithArticleShell owns the semantic article element.
  out = out.replace(/^<article>\s*/i, "").replace(/<\/article>\s*/i, "");

  return out.trim();
}
