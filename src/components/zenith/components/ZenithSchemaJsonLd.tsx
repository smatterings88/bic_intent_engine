import { buildZenithJsonLd } from "@/lib/zenith/schema";
import type { ZenithPage } from "@/types/zenith-content";

export function ZenithSchemaJsonLd({ page, baseUrl }: { page: ZenithPage; baseUrl?: string }) {
  const blocks = buildZenithJsonLd(page, baseUrl);
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
