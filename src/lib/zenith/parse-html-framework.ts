import type { ZenithHtmlFramework } from "@/types/zenith-content";

const KNOWN_FRAMEWORKS = new Set(["bootstrap", "plain", "custom"]);

export function parseZenithHtmlFramework(raw: unknown): ZenithHtmlFramework {
  if (typeof raw !== "string" || !raw.trim()) {
    return "plain";
  }
  const v = raw.trim();
  if (KNOWN_FRAMEWORKS.has(v)) {
    return v as ZenithHtmlFramework;
  }
  return v;
}

export function shouldLoadBootstrapCss(framework: ZenithHtmlFramework | undefined): boolean {
  return framework === "bootstrap";
}
