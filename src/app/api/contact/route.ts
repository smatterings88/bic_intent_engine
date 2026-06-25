import { contactInquirySchema } from "@/lib/contact/schema";
import { sendContactInquiryEmail } from "@/lib/contact/send-inquiry-email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = contactInquirySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    return Response.json({ ok: false, error: message }, { status: 400 });
  }

  try {
    await sendContactInquiryEmail(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send inquiry";
    console.error("[api/contact] send failed", { error: message });
    return Response.json({ ok: false, error: message }, { status: 503 });
  }

  return Response.json({ ok: true });
}
