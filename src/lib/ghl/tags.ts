import "server-only";

import type { GhlContact, GhlTagSyncResult } from "@/types/ghl";

import { getContactId } from "./contact-id";
import { ghlRequest } from "./request";

export function normalizeGhlTags(tags: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of tags) {
    const s = t.trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function mergeTags(existingTags: string[] | undefined, newTags: string[]): string[] {
  return normalizeGhlTags([...(existingTags ?? []), ...newTags]);
}

/** Add tags without replacing existing (POST /contacts/:id/tags). */
export async function addContactTags(contactId: string, tags: string[]): Promise<void> {
  const normalized = normalizeGhlTags(tags);
  if (!normalized.length) return;
  await ghlRequest(`/contacts/${encodeURIComponent(contactId)}/tags`, {
    method: "POST",
    body: { tags: normalized },
  });
}

export async function applyTagsToContact(
  contact: GhlContact,
  tags: string[],
): Promise<GhlTagSyncResult> {
  const contactId = getContactId(contact);
  if (!contactId) {
    throw new Error("Cannot apply tags: contact id is missing");
  }
  await addContactTags(contactId, tags);
  return {
    contactId,
    tagsApplied: normalizeGhlTags(tags),
    response: contact,
  };
}
