import type { ReactNode } from "react";

export function ZenithResearchShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">{children}</div>;
}
