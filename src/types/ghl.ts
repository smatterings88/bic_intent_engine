import type { UtmFields } from "./content";
import type { GhlTagStrategy } from "./zenith-content";

export type GhlContact = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  tags?: string[];
  /** @deprecated v1 shape */
  customField?: Array<{ id?: string; value?: unknown; field_value?: unknown }>;
  /** v2: array on contact; legacy Record shape tolerated in parsers */
  customFields?:
    | Array<{ id?: string; value?: unknown; field_value?: unknown; fieldValue?: unknown }>
    | Record<string, unknown>;
};

export type GhlContactSearchResponse = {
  contacts?: GhlContact[];
  contact?: GhlContact | GhlContact[];
  data?: unknown;
};

export type GhlCreateContactInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  tags?: string[];
  locationId?: string;
};

export type GhlUpdateContactInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
  tags?: string[];
};

export type GhlTagSyncResult = {
  contactId?: string;
  tagsApplied: string[];
  response?: unknown;
};

export type GhlOptInSyncInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  sourcePage: string;
  landingPageSlug: string;
  leadMagnetId?: string;
  campaignType?: string;
  /** Stored landing-page tags (trusted). Merged when no `ghlTagStrategy`. */
  ghlTags?: string[];
  /** From `landingPage.conversion.ghlTagStrategy` only — not accepted from public opt-in bodies. */
  ghlTagStrategy?: GhlTagStrategy;
  utm?: UtmFields;
};

export type GhlOptInSyncResult = {
  status: "found" | "created" | "updated" | "tagged" | "failed";
  contactId?: string;
  mode?: "found" | "created" | "updated";
  tagsApplied: string[];
  error?: string;
};

export type GhlApiErrorShape = {
  message?: string;
  error?: string;
  statusCode?: number;
};
