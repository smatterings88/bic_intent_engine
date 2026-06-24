import Link from "next/link";
import { SiteLayout } from "@/components/site/SiteLayout";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className="flex min-h-[60vh] items-center justify-center page-gutter">
        <div className="max-w-md text-center">
          <div className="eyebrow">Error 404</div>
          <h1 className="mt-3 font-serif text-4xl text-foreground">Page not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Link href="/" className="btn-primary">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
