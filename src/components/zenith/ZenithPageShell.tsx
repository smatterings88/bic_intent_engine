import type { ReactNode } from "react";

/**
 * Shared layout wrapper for Zenith marketing pages (optional outer chrome).
 * Per–content-type shells live in Zenith*Shell.tsx files.
 */
export function ZenithPageShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
