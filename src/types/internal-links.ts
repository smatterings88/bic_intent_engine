export type InternalLinkReason =
  | "required"
  | "same_cluster"
  | "related_cluster"
  | "explicit_related"
  | "fallback";

export type RotatingArticleLink = {
  slug: string;
  title: string;
  description?: string;
  reason: InternalLinkReason;
};

export type RotatingArticleLinkResult = {
  selectedAt: string;
  rotationKey: string;
  links: RotatingArticleLink[];
};
