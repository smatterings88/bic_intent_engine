import "server-only";

import type { GhlContact, GhlCreateContactInput, GhlUpdateContactInput } from "@/types/ghl";

import { getContactId, getContactIdFromPayload } from "./contact-id";
import { GHLApiError } from "./errors";
import { ghlLocationId, ghlRequest } from "./request";

import { siteConfig } from "@/lib/site";

const DEFAULT_SOURCE = siteConfig.name;

export function normalizeGhlContactsResponse(data: unknown): GhlContact[] {
  if (Array.isArray(data)) {
    return data as GhlContact[];
  }
  if (!data || typeof data !== "object") {
    return [];
  }
  const root = data as Record<string, unknown>;

  if (Array.isArray(root.contacts)) {
    return root.contacts as GhlContact[];
  }
  if (root.contact) {
    const c = root.contact;
    if (Array.isArray(c)) {
      return c as GhlContact[];
    }
    if (typeof c === "object") {
      return [c as GhlContact];
    }
  }

  const inner = root.data;
  if (inner && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    if (Array.isArray(d.contacts)) {
      return d.contacts as GhlContact[];
    }
    if (d.contact) {
      const c = d.contact;
      if (Array.isArray(c)) {
        return c as GhlContact[];
      }
      if (typeof c === "object") {
        return [c as GhlContact];
      }
    }
  }

  return [];
}

function extractContactPayload(data: unknown): GhlContact {
  if (!data || typeof data !== "object") {
    return {};
  }
  const o = data as Record<string, unknown>;
  if (o.contact && typeof o.contact === "object" && !Array.isArray(o.contact)) {
    return o.contact as GhlContact;
  }
  if (typeof o.id === "string" || typeof o.email === "string" || typeof o.contactId === "string") {
    return o as GhlContact;
  }
  const inner = o.data;
  if (inner && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    if (d.contact && typeof d.contact === "object" && !Array.isArray(d.contact)) {
      return d.contact as GhlContact;
    }
  }
  const id = getContactIdFromPayload(data);
  if (id) {
    return { ...(o as GhlContact), id };
  }
  return {};
}

/** v2 email lookup — GET /contacts/ often 404 on LeadConnector; use POST /contacts/search. */
export async function searchContactsByEmail(email: string): Promise<GhlContact[]> {
  const trimmed = email.trim();
  if (!trimmed) return [];

  const raw = await ghlRequest("/contacts/search", {
    method: "POST",
    body: {
      locationId: ghlLocationId(),
      query: trimmed,
      pageLimit: 20,
      page: 1,
    },
  });
  return normalizeGhlContactsResponse(raw);
}

/** @deprecated Legacy GET search — kept as fallback when POST /contacts/search is unavailable. */
async function searchContactsByEmailLegacyGet(email: string): Promise<GhlContact[]> {
  const raw = await ghlRequest("/contacts/", {
    method: "GET",
    query: {
      locationId: ghlLocationId(),
      query: email.trim(),
      limit: 20,
    },
  });
  return normalizeGhlContactsResponse(raw);
}

function normEmail(e: string | undefined): string {
  return (e ?? "").trim().toLowerCase();
}

export async function findExactContactByEmail(email: string): Promise<GhlContact | null> {
  const want = normEmail(email);
  if (!want) return null;

  let list: GhlContact[];
  try {
    list = await searchContactsByEmail(email);
  } catch (e) {
    if (e instanceof GHLApiError && e.statusCode === 404) {
      try {
        list = await searchContactsByEmailLegacyGet(email);
      } catch (legacy) {
        if (legacy instanceof GHLApiError && legacy.statusCode === 404) {
          return null;
        }
        throw legacy;
      }
    } else {
      throw e;
    }
  }

  return list.find((c) => normEmail(c.email) === want) ?? null;
}

function buildContactWriteBody(
  input: GhlCreateContactInput,
  options?: { includeTags?: boolean },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    locationId: input.locationId ?? ghlLocationId(),
    email: input.email.trim(),
    firstName: input.firstName?.trim() || undefined,
    lastName: input.lastName?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    source: (input.source ?? DEFAULT_SOURCE).trim(),
  };
  if (options?.includeTags && input.tags?.length) {
    body.tags = input.tags;
  }
  return body;
}

/** POST /contacts/upsert — fallback when POST /contacts/ returns 404. */
export async function upsertContact(input: GhlCreateContactInput): Promise<GhlContact> {
  const raw = await ghlRequest("/contacts/upsert", {
    method: "POST",
    body: buildContactWriteBody(input, { includeTags: Boolean(input.tags?.length) }),
  });
  return extractContactPayload(raw);
}

/**
 * Create contact (official PIT example: POST /contacts/).
 * Falls back to POST /contacts/upsert on 404.
 */
export async function createContact(input: GhlCreateContactInput): Promise<GhlContact> {
  try {
    const raw = await ghlRequest("/contacts/", {
      method: "POST",
      body: buildContactWriteBody(input, { includeTags: Boolean(input.tags?.length) }),
    });
    return extractContactPayload(raw);
  } catch (e) {
    if (!(e instanceof GHLApiError) || e.statusCode !== 404) {
      throw e;
    }
  }
  return upsertContact(input);
}

export async function updateContact(
  contactId: string,
  input: GhlUpdateContactInput,
): Promise<GhlContact> {
  const body: Record<string, unknown> = {};
  if (input.firstName !== undefined) body.firstName = input.firstName;
  if (input.lastName !== undefined) body.lastName = input.lastName;
  if (input.phone !== undefined) body.phone = input.phone;
  if (input.source !== undefined) body.source = input.source;
  if (input.tags !== undefined) body.tags = input.tags;
  const raw = await ghlRequest(`/contacts/${encodeURIComponent(contactId)}`, {
    method: "PUT",
    body,
  });
  return extractContactPayload(raw);
}

export async function upsertContactByEmail(
  input: GhlCreateContactInput,
): Promise<{ contact: GhlContact; mode: "found" | "created" | "updated" }> {
  const existing = await findExactContactByEmail(input.email);
  const existingId = existing ? getContactId(existing) : undefined;
  if (!existingId) {
    const created = await createContact({
      ...input,
      source: input.source ?? DEFAULT_SOURCE,
      tags: input.tags,
    });
    return { contact: created, mode: "created" };
  }

  const patch: GhlUpdateContactInput = {};
  if (input.firstName?.trim()) patch.firstName = input.firstName.trim();
  if (input.lastName?.trim()) patch.lastName = input.lastName.trim();
  if (input.phone?.trim()) patch.phone = input.phone.trim();
  if (input.source?.trim()) patch.source = input.source.trim();

  if (Object.keys(patch).length > 0) {
    try {
      const updated = await updateContact(existingId, patch);
      return { contact: { ...existing, ...updated, id: existingId }, mode: "updated" };
    } catch (e) {
      if (e instanceof GHLApiError && e.statusCode === 404) {
        const created = await createContact({
          ...input,
          source: input.source ?? DEFAULT_SOURCE,
          tags: input.tags,
        });
        return { contact: created, mode: "created" };
      }
      throw e;
    }
  }
  return { contact: { ...existing, id: existingId }, mode: "found" };
}
