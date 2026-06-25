import "server-only";

import { siteConfig } from "@/lib/site";

import type { ContactInquiry } from "./schema";

function buildPlainText(inquiry: ContactInquiry): string {
  const lines = [
    "New contact inquiry from businessimpactcanada.com",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
  ];

  if (inquiry.affiliation?.trim()) {
    lines.push(`Affiliation: ${inquiry.affiliation.trim()}`);
  }

  lines.push(`Subject: ${inquiry.subject}`, "", inquiry.message);

  return lines.join("\n");
}

function getFromAddress(): string {
  const configured = process.env.CONTACT_FROM_EMAIL?.trim();
  if (configured) {
    return configured;
  }

  const hostname = new URL(siteConfig.url).hostname;
  return `${siteConfig.name} <noreply@${hostname}>`;
}

export async function sendContactInquiryEmail(inquiry: ContactInquiry): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Contact email delivery is not configured (missing RESEND_API_KEY)");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [siteConfig.supportEmail],
      reply_to: inquiry.email,
      subject: `[Contact inquiry] ${inquiry.subject}`,
      text: buildPlainText(inquiry),
    }),
  });

  if (!response.ok) {
    let detail = `Resend API error (${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message?.trim()) {
        detail = payload.message.trim();
      }
    } catch {
      // ignore JSON parse failures
    }
    throw new Error(detail);
  }
}
