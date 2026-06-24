# Phase 3 — Content Models and Validation

## Summary

This phase defines **data contracts only** for the Sales Breakdown Institute intent content engine: TypeScript types, **Zod** validation schemas, Firestore collection naming, path helpers, slug rules, and **seed examples** that parse cleanly. No ingestion HTTP routes, no ISR pages, no GHL sync, no uploads, no breakdown pipeline, and no admin UI were added.

---

## Files Created

| Path                                  | Purpose                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/types/article.ts`                | `Article`, `ArticleDraftInput`                                                                                |
| `src/types/landing-page.ts`           | `LandingPage`, `LandingPageDraftInput`, landing keyword intent subset                                         |
| `src/types/lead-magnet.ts`            | `LeadMagnet`, `LeadMagnetDraftInput`                                                                          |
| `src/types/zenith.ts`                 | `ZenithIngestion`, payload types, Zenith enums                                                                |
| `src/types/lead.ts`                   | `Lead` (GHL fields are structural only)                                                                       |
| `src/types/submission.ts`             | `Submission`                                                                                                  |
| `src/types/breakdown.ts`              | `Breakdown`                                                                                                   |
| `src/types/index.ts`                  | Barrel exports (content + domain types + `user`)                                                              |
| `src/lib/content/schemas.ts`          | Zod schemas for enums, articles, landing pages, lead magnets, Zenith payloads, leads, submissions, breakdowns |
| `src/lib/content/constants.ts`        | `CONTENT_COLLECTIONS`, `RESERVED_TOP_LEVEL_ROUTES`, default revalidate constants                              |
| `src/lib/content/slug.ts`             | `normalizeSlug`, `isValidSlug`, `assertValidSlug`, `isReservedTopLevelSlug`, `SLUG_REGEX`                     |
| `src/lib/content/paths.ts`            | Firestore document path helpers                                                                               |
| `src/lib/content/examples.ts`         | `exampleArticle`, `exampleLandingPage`, `exampleLeadMagnet`                                                   |
| `scripts/validate-content-schemas.ts` | Smoke-parse examples against schemas                                                                          |
| `docs/phase-3-content-models.md`      | This document                                                                                                 |

---

## Files Changed

| Path                                 | Change                                                                                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/content.ts`               | Expanded shared primitives (`ContentStatus`, `SearchIntent`, `KeywordSet`, `SeoFields`, `AeoFields`, etc.); `ArticleStatus` kept as deprecated alias of `ContentStatus` |
| `firestore.rules`                    | Per-collection **TODO** comments for future rules (still deny-by-default outside `users`)                                                                               |
| `package.json` / `package-lock.json` | Added `validate:content` script and devDependency `tsx`                                                                                                                 |

---

## Content Types

| Type                | Role                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Article**         | Authority / SEO / AEO / research body, internal linking metadata, optional related landing page + lead magnet      |
| **LandingPage**     | Campaign / conversion page, hero + sections, **primary** + secondary lead magnets, conversion + next-step metadata |
| **LeadMagnet**      | Reusable asset (delivery type, GHL tag placeholder, optional file URL)                                             |
| **ZenithIngestion** | Future audit log for inbound ZenithMind writes                                                                     |
| **Zenith\*Payload** | Request-shaped bundles referencing draft inputs (no API in this phase)                                             |
| **Lead**            | Future opt-in record with UTM + **structural** GHL sync fields                                                     |
| **Submission**      | Future transcript/upload record                                                                                    |
| **Breakdown**       | Future analysis output linked to a submission                                                                      |

---

## Firestore Collections

Document paths (see `CONTENT_COLLECTIONS` and `paths.ts`):

| Collection         | Document ID      | Notes                                                 |
| ------------------ | ---------------- | ----------------------------------------------------- |
| `articles`         | `{slug}`         | URL slug as stable key                                |
| `landingPages`     | `{slug}`         | Same; must not collide with reserved top-level routes |
| `leadMagnets`      | `{leadMagnetId}` | Independent IDs (slug-style in examples)              |
| `zenithIngestions` | `{ingestionId}`  | Ingestion audit rows                                  |
| `leads`            | `{leadId}`       | Lead records                                          |
| `submissions`      | `{submissionId}` | Upload/transcript pipeline                            |
| `breakdowns`       | `{breakdownId}`  | Analysis artifacts                                    |

---

## Article vs Landing Page

- **Articles** build **topical authority**: long-form narrative, FAQ/AEO blocks, internal linking clusters, related articles, optional pointer to a landing page or lead magnet.
- **Landing pages** optimize for **traffic and conversion**: campaign type, hero + proof, explicit **lead magnet** set, conversion block (form type, thank-you, next step), related articles/landings for cross-sell.

---

## Lead Magnet Reuse

- A **single** `LeadMagnet` document can be referenced from **many** articles (`leadMagnetId`) and **many** landing pages (`primaryLeadMagnetId` + `leadMagnetIds`).
- There is **no** assumed one-to-one mapping between articles and landing pages.

---

## Rotating Cross-Article Links

- `Article.internalLinking` carries **cluster** metadata, optional required/excluded link slugs, **`rotationStrategy`**, and **`maxLinks`** (validated between 1 and 12).
- Actual rotation / link injection logic is **out of scope** for Phase 3 and will ship in a later rendering or publishing phase.

---

## ZenithMind Payload Assumptions

- **`ZenithArticlePayload`**: `{ article: ArticleDraftInput }`
- **`ZenithLandingPagePayload`**: `{ landingPage: LandingPageDraftInput }`
- **`ZenithLeadMagnetPayload`**: `{ leadMagnet: LeadMagnetDraftInput }`
- **`ZenithBatchPayload`**: optional arrays of each draft type (schemas only; no HTTP ingestion yet).

---

## Validation Rules (summary)

| Area                     | Rule (practical, draft-friendly)                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **Slugs**                | `^[a-z0-9]+(?:-[a-z0-9]+)*$` for article/landing slugs and related slug arrays where enforced |
| **SEO**                  | `metaTitle` ≤ 70 chars, `metaDescription` ≤ 170 chars; `canonicalPath` must start with `/`    |
| **AEO**                  | `answerBlock` minimum length 40; at least one FAQ item                                        |
| **Article body**         | At least one section; intro/conclusion minimum length 10                                      |
| **Landing sections**     | At least one section                                                                          |
| **Internal linking**     | `maxLinks` integer 1–12                                                                       |
| **Landing lead magnets** | `leadMagnetIds` non-empty; **`primaryLeadMagnetId` must appear in `leadMagnetIds`**           |
| **Lead**                 | Valid email                                                                                   |
| **Breakdown**            | Optional `score` in 0–100; at least one key failure moment                                    |

---

## What This Phase Does Not Implement

- ZenithMind **ingestion HTTP endpoints**
- **ISR** or dynamic routes for `/articles/[slug]` or `/[landingPageSlug]`
- **GHL** API or sync jobs
- Lead **capture forms** or client submit flows
- **Upload** or transcript storage flows
- **Breakdown** analysis jobs
- **Admin** content UI or publishing workflow
- Changes to **public marketing copy** or layout

---

## Phase 4 Readiness

Phase 4 can implement **ZenithMind ingestion endpoints** (e.g. App Router `route.ts` or server actions) that:

1. Accept payloads validated by `zenithArticlePayloadSchema`, `zenithLandingPagePayloadSchema`, `zenithLeadMagnetPayloadSchema`, and `zenithBatchPayloadSchema`.
2. Write through Admin SDK to paths from `paths.ts` using `CONTENT_COLLECTIONS`.
3. Append **`zenithIngestions`** rows for traceability.
4. Tighten **`firestore.rules`** alongside auth claims or server-only writes.

---

## Dependencies

- **`tsx`** (dev): runs `npm run validate:content` for schema smoke tests.
