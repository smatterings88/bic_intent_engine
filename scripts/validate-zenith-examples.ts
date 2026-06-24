import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateZenithPagePayload } from "../src/lib/zenith/validation";
import {
  validateZenithArticlePayload,
  validateZenithBatchPayload,
  validateZenithLandingPagePayload,
  validateZenithLeadMagnetPayload,
} from "../src/lib/zenith/validate";

const root = process.cwd();

function loadJson(name: string): unknown {
  const raw = readFileSync(join(root, "docs", "examples", name), "utf8");
  return JSON.parse(raw) as unknown;
}

function main() {
  const article = validateZenithArticlePayload(loadJson("zenith-article-request.json"));
  if (!article.ok) throw new Error(`article: ${JSON.stringify(article.issues)}`);
  const landing = validateZenithLandingPagePayload(loadJson("zenith-landing-page-request.json"));
  if (!landing.ok) throw new Error(`landing: ${JSON.stringify(landing.issues)}`);
  const magnet = validateZenithLeadMagnetPayload(loadJson("zenith-lead-magnet-request.json"));
  if (!magnet.ok) throw new Error(`leadMagnet: ${JSON.stringify(magnet.issues)}`);
  const batch = validateZenithBatchPayload(loadJson("zenith-batch-request.json"));
  if (!batch.ok) throw new Error(`batch: ${JSON.stringify(batch.issues)}`);

  const lp1 = validateZenithPagePayload(loadJson("zenith-lp1-forensic-landing-page-request.json"));
  if (!lp1.ok) throw new Error(`lp1: ${JSON.stringify(lp1.errors)}`);

  const htmlCss = validateZenithPagePayload(loadJson("zenith-html-snippet-custom-css.json"), {
    deferLandingThankYou: true,
  });
  if (!htmlCss.ok) throw new Error(`html-css: ${JSON.stringify(htmlCss.errors)}`);

  process.stdout.write("Zenith example JSON payloads validate OK.\n");
}

main();
