import { CONTENT_COLLECTIONS } from "./constants";

export function getArticlePath(slug: string): string {
  return `${CONTENT_COLLECTIONS.articles}/${slug}`;
}

export function getLandingPagePath(slug: string): string {
  return `${CONTENT_COLLECTIONS.landingPages}/${slug}`;
}

export function getLeadMagnetPath(id: string): string {
  return `${CONTENT_COLLECTIONS.leadMagnets}/${id}`;
}

export function getZenithIngestionPath(id: string): string {
  return `${CONTENT_COLLECTIONS.zenithIngestions}/${id}`;
}

export function getLeadPath(id: string): string {
  return `${CONTENT_COLLECTIONS.leads}/${id}`;
}

export function getSubmissionPath(id: string): string {
  return `${CONTENT_COLLECTIONS.submissions}/${id}`;
}

export function getBreakdownPath(id: string): string {
  return `${CONTENT_COLLECTIONS.breakdowns}/${id}`;
}
