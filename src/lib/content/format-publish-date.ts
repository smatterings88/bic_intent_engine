const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** e.g. "2026-07-01" → "Published July 2026" */
export function formatPublishedLabel(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    return "Published";
  }
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `Published ${month} ${year}`;
}

export function toIsoDateOnly(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
