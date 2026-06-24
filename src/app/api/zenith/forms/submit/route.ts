import { FieldValue } from "firebase-admin/firestore";

import { CONTENT_COLLECTIONS } from "@/lib/content/constants";
import { ensureFirebaseAdmin } from "@/lib/firebase/admin";
import { syncContactWithTags } from "@/lib/ghl/sync-contact";
import { GHLApiError } from "@/lib/ghl/errors";
import { getGhlApiBaseUrl, getGhlLocationId } from "@/lib/env";
import {
  resolveCtaDestination,
  resolveZenithFormGhlTags,
  sanitizeFormFields,
  validateEmail,
} from "@/lib/zenith/forms";
import { getZenithPageBySlug } from "@/lib/zenith/firestore";
import { findLeadFormThankYouPageUrl } from "@/lib/zenith/lead-form-rules";
import { resolveStoredFormSource, resolveSuccessRedirectUrl } from "@/lib/zenith/slot-config";
import { resolveThankYouPageUrlForLandingPage } from "@/lib/zenith/thank-you-link";
import type { GhlTagStrategy, ZenithPage } from "@/types/zenith-content";

export const runtime = "nodejs";

type SubmitBody = {
  pageSlug?: string;
  slot?: string;
  variant?: string;
  destination?: string;
  fields?: Record<string, unknown>;
  tracking?: Record<string, unknown>;
};

function sanitizeTracking(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const keys = [
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmTerm",
    "utmContent",
    "referrer",
    "path",
  ] as const;
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) {
      out[k] = v.trim().slice(0, 2000);
    }
  }
  return out;
}

export async function POST(request: Request) {
  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const destination = typeof body.destination === "string" ? body.destination.trim() : "";
  const variant = typeof body.variant === "string" ? body.variant.trim() : "";
  const pageSlug = typeof body.pageSlug === "string" ? body.pageSlug.trim() : "";
  const slotId = typeof body.slot === "string" ? body.slot.trim() : "";

  if (!destination || !variant) {
    return Response.json(
      { ok: false, error: "destination and variant are required" },
      { status: 400 },
    );
  }

  const resolved = resolveCtaDestination(destination);
  if (resolved.kind === "unknown") {
    return Response.json({ ok: false, error: "Unknown destination" }, { status: 400 });
  }

  const fields = sanitizeFormFields(body.fields);

  let thankYou = "Thank you.";
  let thankYouPageUrl: string | undefined;
  let pageStrategy: GhlTagStrategy | undefined;
  let componentStrategy: GhlTagStrategy | undefined;
  let legacyComponentTags: string[] | undefined;
  let page: ZenithPage | null = null;

  if (pageSlug) {
    page = await getZenithPageBySlug(pageSlug);
    if (!page) {
      return Response.json({ ok: false, error: "Unknown page" }, { status: 400 });
    }

    const formSource = resolveStoredFormSource(page, {
      destination,
      variant,
      slot: slotId || undefined,
    });

    if (!formSource) {
      return Response.json(
        { ok: false, error: "Form configuration not found for this page" },
        { status: 400 },
      );
    }

    pageStrategy = formSource.pageStrategy;
    componentStrategy = formSource.componentStrategy;
    legacyComponentTags = formSource.legacyComponentTags;

    if (formSource.thankYouMessage?.trim()) {
      thankYou = formSource.thankYouMessage.trim();
    }

    if (formSource.successBehavior?.type === "inline_message") {
      thankYou = formSource.successBehavior.message;
      thankYouPageUrl = undefined;
    } else {
      thankYouPageUrl =
        resolveSuccessRedirectUrl(page, formSource) ??
        findLeadFormThankYouPageUrl(page, destination, variant) ??
        resolveThankYouPageUrlForLandingPage(page);
    }
  }

  const email = fields.email ?? "";
  const firstName = (fields.first_name ?? fields.firstName ?? "").trim();
  const name = fields.name ?? "";
  const message = fields.message ?? "";
  const isLandingPage = page?.contentType === "landing_page";

  if (resolved.kind === "lead-magnet") {
    if (isLandingPage) {
      const displayName = name.trim() || firstName;
      if (!displayName || !email || !validateEmail(email)) {
        return Response.json(
          { ok: false, error: "name and valid email are required" },
          { status: 400 },
        );
      }
    } else if (!email || !validateEmail(email)) {
      return Response.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    }
  } else if (resolved.kind === "webinar") {
    if (!firstName || !email || !validateEmail(email)) {
      return Response.json(
        { ok: false, error: "first_name and valid email are required" },
        { status: 400 },
      );
    }
  } else if (resolved.kind === "contact") {
    if (!name.trim() || !email || !validateEmail(email) || !message.trim()) {
      return Response.json(
        { ok: false, error: "name, valid email, and message are required" },
        { status: 400 },
      );
    }
  } else if (resolved.kind === "call-upload") {
    if (!email || !validateEmail(email)) {
      return Response.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    }
  }

  const intendedGhlTags = resolveZenithFormGhlTags({
    destination,
    pageStrategy,
    componentStrategy,
    legacyComponentTags,
  });

  const { adminDb } = ensureFirebaseAdmin();
  const docRef = await adminDb.collection(CONTENT_COLLECTIONS.zenithFormSubmissions).add({
    pageSlug: pageSlug || null,
    slot: slotId || null,
    variant,
    destination,
    fieldsSanitized: fields,
    tracking: sanitizeTracking(body.tracking),
    intendedGhlTags,
    ghlSyncStatus: "pending",
    ghlContactId: null,
    createdAt: FieldValue.serverTimestamp(),
    source: "zenith-content",
  });
  const submissionId = docRef.id;

  let ghlSyncStatus: "synced" | "failed" | "skipped" = "skipped";
  let ghlContactId: string | null = null;
  let ghlMessage: string | undefined;
  let ghlError: string | undefined;

  const needsEmail =
    resolved.kind === "lead-magnet" ||
    resolved.kind === "webinar" ||
    resolved.kind === "contact" ||
    resolved.kind === "call-upload";

  if (needsEmail && email) {
    try {
      const nameParts = name.trim().split(/\s+/);
      const first = firstName || nameParts[0] || "";
      const last =
        nameParts.length > 1
          ? nameParts.slice(1).join(" ")
          : (fields.last_name ?? "").trim() || undefined;
      const synced = await syncContactWithTags(
        {
          email,
          firstName: first || undefined,
          lastName: last,
          source: "Sales Breakdown Institute",
        },
        intendedGhlTags,
      );
      ghlContactId = synced.contactId;

      ghlSyncStatus = "synced";
      await docRef.set(
        {
          ghlSyncStatus: "synced",
          ghlContactId,
          intendedGhlTags,
        },
        { merge: true },
      );
    } catch (e) {
      ghlSyncStatus = "failed";
      ghlError = e instanceof Error ? e.message : "GHL sync failed";
      ghlMessage = "We saved your submission but could not sync to CRM. Our team will follow up.";
      const loc = getGhlLocationId();
      console.error("[zenith/forms/submit] GHL sync failed", {
        pageSlug: pageSlug || null,
        slot: slotId || null,
        destination,
        email,
        intendedGhlTags,
        error: ghlError,
        ghlStatusCode: e instanceof GHLApiError ? e.statusCode : undefined,
        ghlMethod: e instanceof GHLApiError ? e.request?.method : undefined,
        ghlPath: e instanceof GHLApiError ? e.request?.path : undefined,
        ghlBody: e instanceof GHLApiError ? e.body : undefined,
        ghlApiBaseUrl: getGhlApiBaseUrl(),
        ghlLocationIdSet: Boolean(loc),
        ghlLocationIdSuffix: loc ? loc.slice(-6) : null,
        ghlPitPrefix: process.env.GHL_PIT_TOKEN?.trim().startsWith("pit-") ? "pit" : "other",
      });
      await docRef.set(
        { ghlSyncStatus: "failed", ghlContactId: null, ghlError, intendedGhlTags },
        { merge: true },
      );
    }
  } else {
    await docRef.set(
      { ghlSyncStatus: "skipped", ghlContactId: null, intendedGhlTags },
      { merge: true },
    );
  }

  return Response.json({
    ok: true,
    submissionId,
    destination,
    thankYouMessage: thankYou,
    ...(thankYouPageUrl ? { thankYouPageUrl } : {}),
    ghlSyncStatus,
    intendedGhlTags,
    ...(ghlMessage ? { message: ghlMessage } : {}),
  });
}
