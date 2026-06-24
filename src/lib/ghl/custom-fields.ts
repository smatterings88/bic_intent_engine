import type { GhlContact } from "@/types/ghl";

import { ghlLocationId, ghlRequest } from "./request";

export type GhlCustomFieldDefinition = {
  id: string;
  name?: string;
  fieldKey: string;
  dataType?: string;
  placeholder?: string;
  position?: number;
  picklistOptions?: string[];
};

let definitionsCache: Record<string, string> | null = null;

/**
 * v2: GET /locations/{locationId}/customFields
 * Maps field id → normalized key (strips `contact.` prefix).
 */
export async function getCustomFieldDefinitions(): Promise<Record<string, string>> {
  if (definitionsCache) {
    return definitionsCache;
  }
  const data = await ghlRequest<{ customFields?: GhlCustomFieldDefinition[] }>(
    `/locations/${encodeURIComponent(ghlLocationId())}/customFields`,
  );
  const fieldMap: Record<string, string> = {};
  for (const field of data.customFields ?? []) {
    if (!field.id || !field.fieldKey) continue;
    const normalizedKey = field.fieldKey.startsWith("contact.")
      ? field.fieldKey.slice(8)
      : field.fieldKey;
    fieldMap[field.id] = normalizedKey;
  }
  definitionsCache = fieldMap;
  return fieldMap;
}

/** Clear cached definitions (tests / diagnose). */
export function clearCustomFieldDefinitionsCache(): void {
  definitionsCache = null;
}

export function getCustomFieldValue(
  contact: GhlContact,
  fieldName: string,
  fieldDefinitions: Record<string, string>,
): string {
  const fields = contact.customFields;
  if (Array.isArray(fields)) {
    for (const field of fields) {
      if (!field || typeof field !== "object") continue;
      const o = field as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : undefined;
      if (id && fieldDefinitions[id] === fieldName) {
        const v = o.value ?? o.field_value ?? o.fieldValue;
        return v != null ? String(v) : "";
      }
    }
  }
  if (Array.isArray(contact.customField)) {
    for (const field of contact.customField) {
      if (!field || typeof field !== "object") continue;
      const o = field as Record<string, unknown>;
      const id = typeof o.id === "string" ? o.id : undefined;
      if (id && fieldDefinitions[id] === fieldName) {
        const v = o.value ?? o.field_value;
        return v != null ? String(v) : "";
      }
    }
  }
  const direct = (contact as Record<string, unknown>)[fieldName];
  return direct != null ? String(direct) : "N/A";
}

/**
 * v2: PUT /contacts/{id} with `customFields: [{ id, field_value }]`.
 * Text/number: plain values. Date: ISO strings. Multi-select: arrays.
 */
export async function updateContactCustomField(
  contactId: string,
  fieldName: string,
  fieldValue: unknown,
): Promise<GhlContact> {
  const definitions = await getCustomFieldDefinitions();
  const fieldId = Object.entries(definitions).find(([, key]) => key === fieldName)?.[0];
  if (!fieldId) {
    throw new Error(`Custom field "${fieldName}" not found`);
  }

  const data = await ghlRequest<{ contact: GhlContact }>(
    `/contacts/${encodeURIComponent(contactId)}`,
    {
      method: "PUT",
      body: {
        customFields: [{ id: fieldId, field_value: fieldValue }],
      },
    },
  );
  return data.contact ?? (data as unknown as GhlContact);
}
