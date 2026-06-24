import { z } from "zod";

import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { adminBulkDeleteContent, getBulkDeleteCounts } from "@/lib/admin/bulk-delete";
import { BULK_DELETE_TARGETS } from "@/lib/admin/bulk-delete-types";

const CONFIRM_TEXT = "DELETE";

const postBodySchema = z.object({
  confirmText: z.literal(CONFIRM_TEXT),
  targets: z.array(z.enum(BULK_DELETE_TARGETS)).min(1),
});

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await assertCurrentUserIsAdmin(request);
    const counts = await getBulkDeleteCounts();
    return Response.json({ ok: true, counts });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await assertCurrentUserIsAdmin(request);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, error: { message: "Invalid JSON" } }, { status: 400 });
    }
    const parsed = postBodySchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.flatten().fieldErrors.confirmText?.[0] ??
        "Validation failed. Type DELETE exactly and select at least one content type.";
      return Response.json(
        { ok: false, error: { message, details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    const deleted = await adminBulkDeleteContent({ targets: parsed.data.targets });
    return Response.json({ ok: true, deleted });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
