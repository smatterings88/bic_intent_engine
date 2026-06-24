import "server-only";

import type { GhlContact, GhlCreateContactInput, GhlUpdateContactInput } from "@/types/ghl";

import { createContact, findExactContactByEmail, updateContact } from "./contacts";
import { getContactId } from "./contact-id";
import { GHLApiError } from "./errors";
import { applyTagsToContact, normalizeGhlTags } from "./tags";

import { siteConfig } from "@/lib/site";

const DEFAULT_SOURCE = siteConfig.name;

export type SyncContactWithTagsResult = {
  contact: GhlContact;
  contactId: string | null;
  tagsApplied: string[];
  mode: "found" | "created" | "updated";
};

function buildPatch(input: GhlCreateContactInput): GhlUpdateContactInput {
  const patch: GhlUpdateContactInput = {};
  if (input.firstName?.trim()) patch.firstName = input.firstName.trim();
  if (input.lastName?.trim()) patch.lastName = input.lastName.trim();
  if (input.phone?.trim()) patch.phone = input.phone.trim();
  if (input.source?.trim()) patch.source = input.source.trim();
  return patch;
}

/**
 * Search-first sync: update existing contacts (PUT + POST tags), create new ones
 * (POST /contacts/, then upsert fallback). Avoids relying on POST /contacts/upsert alone.
 */
export async function syncContactWithTags(
  input: GhlCreateContactInput,
  tags: string[],
): Promise<SyncContactWithTagsResult> {
  const baseInput: GhlCreateContactInput = {
    ...input,
    source: input.source ?? DEFAULT_SOURCE,
  };
  const tagsToApply = normalizeGhlTags(tags);

  const existing = await findExactContactByEmail(baseInput.email);
  const existingId = existing ? getContactId(existing) : undefined;

  if (existingId) {
    let contact: GhlContact = { ...existing!, id: existingId };
    const patch = buildPatch(baseInput);
    if (Object.keys(patch).length > 0) {
      const updated = await updateContact(existingId, patch);
      contact = { ...contact, ...updated, id: existingId };
    }

    if (!tagsToApply.length) {
      return {
        contact,
        contactId: existingId,
        tagsApplied: [],
        mode: Object.keys(patch).length > 0 ? "updated" : "found",
      };
    }

    const tagged = await applyTagsToContact(contact, tagsToApply);
    return {
      contact,
      contactId: tagged.contactId ?? existingId,
      tagsApplied: tagged.tagsApplied,
      mode: "updated",
    };
  }

  let contact = await createContact({ ...baseInput, tags: undefined });
  let contactId = getContactId(contact);

  if (!contactId) {
    const again = await findExactContactByEmail(baseInput.email);
    if (again) {
      contact = again;
      contactId = getContactId(again) ?? undefined;
    }
  }

  if (!contactId) {
    throw new GHLApiError(
      "GoHighLevel create succeeded but returned no contact id",
      422,
      contact,
      "MISSING_CONTACT_ID",
      { method: "POST", path: "/contacts/" },
    );
  }

  if (!tagsToApply.length) {
    return { contact, contactId, tagsApplied: [], mode: "created" };
  }

  const tagged = await applyTagsToContact({ ...contact, id: contactId }, tagsToApply);
  return {
    contact,
    contactId: tagged.contactId ?? contactId,
    tagsApplied: tagged.tagsApplied,
    mode: "created",
  };
}
