import { z } from "zod";

import { AdminApiError, assertCurrentUserIsAdmin } from "@/lib/admin/auth";
import { adminArchiveContent } from "@/lib/admin/mutations";
import { revalidateArticlePublicPaths } from "@/lib/articles/revalidate";
import { revalidateLandingPagePublicPaths } from "@/lib/landing-pages/revalidate";

const bodySchema = z.object({
  contentType: z.enum(["article", "landing_page", "lead_magnet"]),
  id: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { uid } = await assertCurrentUserIsAdmin(request);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, error: { message: "Invalid JSON" } }, { status: 400 });
    }
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { ok: false, error: { message: "Validation failed", details: parsed.error.flatten() } },
        { status: 400 },
      );
    }
    await adminArchiveContent({ ...parsed.data, actorUid: uid });
    if (parsed.data.contentType === "article") {
      revalidateArticlePublicPaths(parsed.data.id);
    }
    if (parsed.data.contentType === "landing_page") {
      revalidateLandingPagePublicPaths(parsed.data.id);
    }
    return Response.json({ ok: true, contentType: parsed.data.contentType, id: parsed.data.id });
  } catch (e) {
    if (e instanceof AdminApiError) {
      return Response.json({ ok: false, error: { message: e.message } }, { status: e.statusCode });
    }
    const msg = e instanceof Error ? e.message : "Internal error";
    return Response.json({ ok: false, error: { message: msg } }, { status: 500 });
  }
}
