/**
 * Run: `npm run validate:content`
 * Parses seed examples against Zod contracts (Phase 3 smoke check).
 */
import { articleSchema, landingPageSchema, leadMagnetSchema } from "../src/lib/content/schemas";
import { exampleArticle, exampleLandingPage, exampleLeadMagnet } from "../src/lib/content/examples";

function main() {
  articleSchema.parse(exampleArticle);
  landingPageSchema.parse(exampleLandingPage);
  leadMagnetSchema.parse(exampleLeadMagnet);
  process.stdout.write("Content schema validation OK: article, landing page, lead magnet.\n");
}

main();
