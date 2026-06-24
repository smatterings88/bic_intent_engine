import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="eyebrow">Error 404</div>
          <h1 className="mt-3 font-serif text-4xl text-foreground">Page not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sales Breakdown Institute — Independent Sales Performance Research" },
      {
        name: "description",
        content:
          "An independent research initiative analyzing where sales conversations break down and why deals fail.",
      },
      {
        property: "og:title",
        content: "Sales Breakdown Institute — Independent Sales Performance Research",
      },
      {
        property: "og:description",
        content:
          "An independent research initiative analyzing where sales conversations break down and why deals fail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "twitter:title",
        content: "Sales Breakdown Institute — Independent Sales Performance Research",
      },
      {
        name: "twitter:description",
        content:
          "An independent research initiative analyzing where sales conversations break down and why deals fail.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f4e3ecee-4dc8-4b88-b451-e8fa3c0ce67b/id-preview-accc1b82--5bdd300a-b5f7-4fe2-a65f-6dc14eb054f7.lovable.app-1777976080769.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f4e3ecee-4dc8-4b88-b451-e8fa3c0ce67b/id-preview-accc1b82--5bdd300a-b5f7-4fe2-a65f-6dc14eb054f7.lovable.app-1777976080769.png",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:wght@400;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  );
}
