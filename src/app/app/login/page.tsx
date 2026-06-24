import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Business Impact Canada",
  description: "Sign in to Business Impact Canada app.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg py-16 page-gutter sm:py-20">
      <div className="eyebrow">Business Impact Canada</div>
      <h1 className="mt-4 font-serif text-3xl text-foreground sm:text-4xl">Sign in</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Use your email and password to access the app workspace.
      </p>
      <div className="mt-10">
        <LoginForm />
      </div>
    </div>
  );
}
