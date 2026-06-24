import Link from "next/link";

import { AdminBulkDeletePanel } from "@/components/admin/AdminBulkDeletePanel";
import { AdminHomeLeadsSummary } from "@/components/admin/leads/AdminHomeLeadsSummary";

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-foreground">Admin Console</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Review ZenithMind content, publish when ready. Public ISR previews ship in later phases.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>
          <Link href="/app/admin/zenith" className="text-primary underline">
            Zenith Pages
          </Link>
        </li>
        <li>
          <Link href="/app/admin/articles" className="text-primary underline">
            Articles
          </Link>
        </li>
        <li>
          <Link href="/app/admin/landing-pages" className="text-primary underline">
            Landing pages
          </Link>
        </li>
        <li>
          <Link href="/app/admin/lead-magnets" className="text-primary underline">
            Lead magnets
          </Link>
        </li>
        <li>
          <Link href="/app/admin/ingestions" className="text-primary underline">
            Ingestions
          </Link>
        </li>
        <li>
          <Link href="/app/admin/leads" className="text-primary underline">
            Leads
          </Link>
        </li>
      </ul>
      <AdminHomeLeadsSummary />
      <AdminBulkDeletePanel />
    </div>
  );
}
