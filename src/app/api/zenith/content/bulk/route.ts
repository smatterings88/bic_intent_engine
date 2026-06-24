import { assertZenithSecret } from "@/lib/zenith/content-auth";
import { getZenithPageBySlug, saveZenithDraftPage } from "@/lib/zenith/firestore";
import {
  finalizeBulkWithRelationships,
  normalizeZenithBulkRequestBody,
  parseAndValidateZenithBulkPages,
  validateBulkSlugsReserved,
} from "@/lib/zenith/batch-ingest";
import { resolveThankYouPageUrl } from "@/lib/zenith/lead-form-rules";
import {
  successBehaviorToThankYouPath,
  validateSlotRedirectTargets,
} from "@/lib/zenith/slot-config";
import type { ZenithPage } from "@/types/zenith-content";

export const runtime = "nodejs";

type BulkItemResult = {
  id: string;
  slug: string;
  contentType: string;
  renderMode?: string;
  status: "draft";
  mode?: "created" | "updated";
  thankYouPageUrl?: string;
  warnings?: string[];
};

function landingThankYouUrl(page: ZenithPage): string | undefined {
  if (page.contentType !== "landing_page") return undefined;
  for (const c of page.components) {
    if (c.type === "lead-form") {
      const url = resolveThankYouPageUrl(c.thankYouPageUrl, c.redirect);
      if (url) return url;
    }
    if (c.type === "forensic-download-section" && c.form?.thankYouPageUrl?.trim()) {
      return c.form.thankYouPageUrl.trim();
    }
  }
  for (const slot of page.slots ?? []) {
    if (slot.type !== "lead-form") continue;
    const url =
      successBehaviorToThankYouPath(slot.successBehavior) ??
      resolveThankYouPageUrl(slot.thankYouPageUrl, slot.redirect);
    if (url) return url;
  }
  return undefined;
}

async function collectStoredRedirectSlugs(pages: ZenithPage[]): Promise<Set<string>> {
  const known = new Set(pages.map((p) => p.slug));
  const toCheck = new Set<string>();
  for (const page of pages) {
    for (const slot of page.slots ?? []) {
      if (slot.successBehavior?.type === "redirect") {
        const target = slot.successBehavior.targetSlug?.trim();
        if (target && !known.has(target)) {
          toCheck.add(target.replace(/^\/+|\/+$/g, ""));
        }
      }
    }
  }
  const extra = new Set<string>();
  for (const slug of toCheck) {
    const stored = await getZenithPageBySlug(slug);
    if (stored) {
      extra.add(stored.slug);
    }
  }
  return extra;
}

export async function POST(request: Request) {
  const auth = assertZenithSecret(request);
  if (!auth.ok) {
    return Response.json({ ok: false, errors: [auth.message] }, { status: auth.status });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, errors: ["Invalid JSON body"] }, { status: 400 });
  }

  const normalized = normalizeZenithBulkRequestBody(body);
  if (!normalized) {
    return Response.json(
      {
        ok: false,
        error: "Validation failed",
        details: ["Body must include pages or items array"],
      },
      { status: 400 },
    );
  }

  const parsed = parseAndValidateZenithBulkPages(normalized.pages);
  finalizeBulkWithRelationships(parsed, normalized.relationships);

  const okPages = parsed.filter((p) => p.page && p.errors.length === 0).map((p) => p.page!);
  const reserved = validateBulkSlugsReserved(okPages);
  if (reserved) {
    return Response.json(
      { ok: false, error: "Validation failed", details: [reserved] },
      { status: 400 },
    );
  }

  const storageSlugs = await collectStoredRedirectSlugs(okPages);
  const relErrors: string[] = [];
  const relWarnings: string[] = [];
  validateSlotRedirectTargets(okPages, relErrors, relWarnings, storageSlugs);
  if (relErrors.length) {
    for (const entry of parsed) {
      if (entry.page) {
        entry.errors.push(...relErrors);
      }
    }
  }
  for (const entry of parsed) {
    entry.warnings.push(...relWarnings);
  }

  const validationFailures = parsed.filter((p) => p.errors.length > 0);
  if (validationFailures.length) {
    const details = validationFailures.flatMap((p) =>
      p.errors.map((e) => (p.slug ? `${p.slug}: ${e}` : e)),
    );
    return Response.json({ ok: false, error: "Validation failed", details }, { status: 400 });
  }

  const saved: BulkItemResult[] = [];
  for (const entry of parsed) {
    const page = entry.page;
    if (!page) continue;
    try {
      const { mode } = await saveZenithDraftPage(page);
      saved.push({
        id: page.id,
        slug: page.slug,
        contentType: page.contentType,
        renderMode: page.renderMode,
        status: "draft",
        mode,
        thankYouPageUrl: landingThankYouUrl(page),
        warnings: entry.warnings.length ? entry.warnings : undefined,
      });
    } catch (e) {
      return Response.json(
        {
          ok: false,
          error: "Save failed",
          details: [e instanceof Error ? e.message : "Save failed"],
        },
        { status: 500 },
      );
    }
  }

  let status = 200;
  if (saved.some((s) => s.mode === "created")) {
    status = 201;
  }

  return Response.json(
    {
      ok: true,
      batchId: normalized.batchId,
      items: saved,
      relationships: normalized.relationships ?? [],
    },
    { status },
  );
}
