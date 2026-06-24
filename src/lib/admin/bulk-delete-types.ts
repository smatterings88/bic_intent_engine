export const BULK_DELETE_TARGETS = [
  "articles",
  "landing_pages",
  "lead_magnets",
  "zenith_pages",
] as const;

export type BulkDeleteTarget = (typeof BULK_DELETE_TARGETS)[number];

export type BulkDeleteResult = Record<BulkDeleteTarget, number>;

export type BulkDeleteCounts = Record<BulkDeleteTarget, number>;
