export function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Trusted structured data from our CMS
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
