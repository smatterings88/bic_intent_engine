import type { ReactNode } from "react";

export function ZenithCtaShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-10 text-center sm:px-6 sm:pt-14">
      {children}
    </div>
  );
}
