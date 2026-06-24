import type { Metadata } from "next";
import { AccountClient } from "@/components/app/AccountClient";

export const metadata: Metadata = {
  title: "Account — Sales Breakdown Institute",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground sm:text-4xl">Account</h1>
      <AccountClient />
    </div>
  );
}
