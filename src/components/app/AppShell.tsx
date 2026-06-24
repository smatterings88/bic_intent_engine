"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { signOut } from "firebase/auth";
import { ensureFirebaseClient } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAuthenticated, initError } = useAuth();

  const isLogin = pathname === "/app/login";

  useEffect(() => {
    if (loading || isLogin || initError) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/app/login");
    }
  }, [loading, isAuthenticated, isLogin, router, initError]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background px-6 text-muted-foreground">
        <div
          className="h-9 w-9 animate-pulse rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm">Loading workspace…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background px-6 text-sm text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center justify-between gap-3 py-2 page-gutter sm:min-h-0 sm:h-14 sm:py-0">
          <Link
            href="/app/dashboard"
            className="font-serif text-sm font-medium text-foreground transition-opacity duration-200 hover:opacity-90"
          >
            Institute App
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-x-1 gap-y-2 text-sm sm:gap-x-4">
            <Link
              href="/app/admin"
              className="rounded-md px-2 py-2 text-muted-foreground transition-colors duration-200 hover:bg-muted/50 hover:text-foreground sm:px-3"
            >
              Admin
            </Link>
            <Link
              href="/app/dashboard"
              className="rounded-md px-2 py-2 text-muted-foreground transition-colors duration-200 hover:bg-muted/50 hover:text-foreground sm:px-3"
            >
              Dashboard
            </Link>
            <Link
              href="/app/account"
              className="rounded-md px-2 py-2 text-muted-foreground transition-colors duration-200 hover:bg-muted/50 hover:text-foreground sm:px-3"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={async () => {
                const { auth } = ensureFirebaseClient();
                await signOut(auth);
                router.replace("/app/login");
              }}
              className="rounded-md border border-border bg-background px-3 py-2 text-muted-foreground transition-colors duration-200 hover:border-muted-foreground/30 hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 py-8 page-gutter sm:py-10">{children}</main>
    </div>
  );
}
