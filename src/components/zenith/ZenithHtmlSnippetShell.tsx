import type { ReactNode } from "react";

/** Full-bleed wrapper for Zenith html_snippet pages (no marketing max-width constraint). */
export function ZenithHtmlSnippetShell({ children }: { children: ReactNode }) {
  return <div className="zenith-html-page-fullbleed w-full">{children}</div>;
}
