/**
 * Permanently remove Sherpa branding from the four SBI landing pages in Firestore.
 *
 * Run: `npm run patch:sherpa-branding`
 *
 * Requires Firebase Admin env (same as Next server).
 */
import { FieldValue } from "firebase-admin/firestore";

import { CONTENT_COLLECTIONS } from "../src/lib/content/constants";
import { ensureFirebaseAdmin } from "../src/lib/firebase/admin";
import { sanitizeZenithPageSherpaBranding } from "../src/lib/zenith/strip-sherpa-branding";
import type { ZenithPage } from "../src/types/zenith-content";

const TARGET_SLUGS = [
  "what-your-recordings-reveal",
  "why-you-keep-losing-deals",
  "sales-objection-handling",
  "cold-call-script",
] as const;

function pageChanged(before: ZenithPage, after: ZenithPage): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

async function main() {
  const { adminDb } = ensureFirebaseAdmin();
  const collection = adminDb.collection(CONTENT_COLLECTIONS.zenithPages);

  for (const slug of TARGET_SLUGS) {
    const ref = collection.doc(slug);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`skip: ${slug} (not found)`);
      continue;
    }

    const before = { ...(snap.data() as ZenithPage), slug };
    const after = sanitizeZenithPageSherpaBranding(before);

    if (!pageChanged(before, after)) {
      console.log(`ok: ${slug} (no Sherpa strings)`);
      continue;
    }

    await ref.set(
      {
        ...after,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: false },
    );
    console.log(`patched: ${slug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
