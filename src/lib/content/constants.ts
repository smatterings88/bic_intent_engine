export const CONTENT_COLLECTIONS = {
  articles: "articles",
  landingPages: "landingPages",
  leadMagnets: "leadMagnets",
  zenithIngestions: "zenithIngestions",
  leads: "leads",
  submissions: "submissions",
  breakdowns: "breakdowns",
  zenithPages: "zenithPages",
  zenithFormSubmissions: "zenithFormSubmissions",
} as const;

/** Top-level URL segments reserved by the marketing app, API, or future engines */
export const RESERVED_TOP_LEVEL_ROUTES = [
  "about",
  "research",
  "programs",
  "insights",
  "contact",
  "privacy",
  "terms",
  "where-deals-break",
  "app",
  "api",
  "articles",
  "admin",
  "guides",
  "webinars",
  "cta",
  "preview",
] as const;

export const DEFAULT_ARTICLE_REVALIDATE_SECONDS = 3600;
export const DEFAULT_LANDING_PAGE_REVALIDATE_SECONDS = 900;
