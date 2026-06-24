"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ensureFirebaseClient } from "@/lib/firebase/client";
import { syncUserProfileAfterAuth } from "@/lib/firebase/auth-actions";
import { useAuth } from "@/components/auth/AuthProvider";

export function LoginForm() {
  const router = useRouter();
  const { loading, initError, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/app/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { auth } = ensureFirebaseClient();
      const cred =
        mode === "signin"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);
      try {
        await syncUserProfileAfterAuth(
          cred.user.uid,
          cred.user.email ?? email,
          cred.user.displayName,
        );
      } catch (syncErr) {
        setError(
          syncErr instanceof Error
            ? `Signed in, but profile sync failed: ${syncErr.message}. Check server Firebase env.`
            : "Signed in, but profile sync failed.",
        );
        setPending(false);
        return;
      }
      router.replace("/app/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span
          className="inline-block h-4 w-4 animate-pulse rounded-full bg-primary/40 motion-reduce:animate-none"
          aria-hidden
        />
        Checking session…
      </div>
    );
  }

  return (
    <div className="surface-card max-w-md space-y-6 border-border/80 p-6 sm:p-8">
      {initError && (
        <div
          className="rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Firebase is not configured for this environment: {initError.message}
        </div>
      )}
      <div
        className="flex rounded-lg border border-border bg-muted/25 p-1 text-sm"
        role="tablist"
        aria-label="Authentication mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={
            "min-h-10 flex-1 rounded-md px-3 py-2 font-medium transition-colors duration-200 " +
            (mode === "signin"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={
            "min-h-10 flex-1 rounded-md px-3 py-2 font-medium transition-colors duration-200 " +
            (mode === "signup"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
        >
          Create account
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Email
          </span>
          <input
            required
            type="email"
            autoComplete="email"
            className="input-research"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Password
          </span>
          <input
            required
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            className="input-research"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? (
          <p
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !!initError}
          aria-busy={pending}
          className="btn-primary w-full disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
