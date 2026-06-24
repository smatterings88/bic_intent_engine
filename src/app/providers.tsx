"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth/AuthProvider";

/**
 * Global client providers. Auth must wrap any route that calls `useAuth()`
 * (e.g. `/app/**`, `/preview/**`, admin Zenith clients).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
