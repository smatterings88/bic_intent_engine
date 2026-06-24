import type { Metadata } from "next";
import { DashboardClient } from "@/components/app/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Business Impact Canada",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground sm:text-4xl">
        Business Impact Canada App
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
        Dashboard foundation is ready.
      </p>
      <DashboardClient />
    </div>
  );
}
