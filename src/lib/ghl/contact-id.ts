import type { GhlContact } from "@/types/ghl";

/** GHL responses use `id`, `contactId`, or nested shapes depending on API version. */
export function getContactIdFromPayload(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;

  const direct = readIdField(o);
  if (direct) return direct;

  if (o.contact && typeof o.contact === "object" && !Array.isArray(o.contact)) {
    const nested = readIdField(o.contact as Record<string, unknown>);
    if (nested) return nested;
  }

  const inner = o.data;
  if (inner && typeof inner === "object") {
    const d = inner as Record<string, unknown>;
    const fromData = readIdField(d);
    if (fromData) return fromData;
    if (d.contact && typeof d.contact === "object" && !Array.isArray(d.contact)) {
      return readIdField(d.contact as Record<string, unknown>);
    }
  }

  return undefined;
}

function readIdField(o: Record<string, unknown>): string | undefined {
  for (const key of ["id", "contactId"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function getContactId(contact: GhlContact): string | undefined {
  return getContactIdFromPayload(contact);
}
