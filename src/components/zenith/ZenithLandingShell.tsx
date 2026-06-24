import type { ReactNode } from "react";

export function ZenithLandingShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6 sm:pt-10">{children}</div>;
}
