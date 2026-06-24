# UI/UX Polish Audit

## Summary

This pass focused on **mobile-first navigation**, **consistent spacing and max-widths**, **premium-but-calm surfaces** (subtle gradients, soft borders, restrained shadows), **form and table polish**, **readable research layouts** for articles and landings, **accessible focus-visible rings**, **reduced-motion–safe micro-animations**, and **admin usability** on small screens—without changing routes, APIs, auth, GHL, Zenith, or copy.

## Pages Reviewed

| Area             | Route / location                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| Public marketing | `/`, `/about`, `/research`, `/programs`, `/insights`, `/contact`, `/privacy`, `/terms`, `/where-deals-break` |
| Articles         | `/articles`, `/articles/[slug]`                                                                              |
| Landing          | `/[slug]` (ISR landing template)                                                                             |
| App auth         | `/app/login`, `/app/dashboard`, `/app/account`                                                               |
| Admin            | `/app/admin`, articles, landing-pages, lead-magnets, ingestions, leads, submissions                          |
| Errors           | `not-found`                                                                                                  |

## Issues Found

| Area               | Issue                                                                | Severity | Fix                                                                                   |
| ------------------ | -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| Site header        | No mobile navigation; nav hidden below `md` with no alternative      | High     | Hamburger + full-width panel under header; close on route change                      |
| Global             | No explicit `focus-visible` system; inconsistent keyboard affordance | Medium   | Base-layer focus-visible outline using `--ring`                                       |
| Global             | No `prefers-reduced-motion` for custom animations                    | Medium   | Respect reduced motion for scroll + fade-in utility                                   |
| Global             | Flat body background on long pages                                   | Low      | Subtle radial wash on `main` (marketing layout shell)                                 |
| Page header        | Hero padding tight on small phones                                   | Low      | `px-4` + responsive vertical rhythm                                                   |
| Footer             | Same; long lines on narrow viewports                                 | Low      | Consistent `px-4 sm:px-6`                                                             |
| Homepage           | Primary/secondary CTAs lack shared elevation and focus parity        | Low      | Shared button utilities + transitions                                                 |
| Articles index     | List reads as flat dividers; weak scan on mobile                     | Medium   | Card-style rows, hover/focus polish                                                   |
| Article body       | Line length at `max-w-4xl` for body text                             | Medium   | Inner `max-w-[65ch]` for paragraphs                                                   |
| Answer blocks      | Visually similar to body; weak “direct answer” affordance            | Medium   | Accent border + softer card surface                                                   |
| FAQ                | Wall of `dl` spacing only                                            | Low      | Per-question bordered cards                                                           |
| Related research   | Plain links                                                          | Low      | Card rows with hover state                                                            |
| Lead magnet blocks | Plain bordered box                                                   | Low      | Refined radius, shadow, spacing                                                       |
| Landing opt-in     | Inputs missing unified focus ring / loading / success motion         | Medium   | Shared `input-research`, loading `aria-busy`, success `animate-fade-in` (motion-safe) |
| Login              | Form not visually grouped; mode toggle low affordance                | Medium   | Card shell + segmented mode control                                                   |
| App shell          | Nav can crowd on narrow widths; sign-out looks like plain text       | Medium   | Wrap nav, button styling for sign-out                                                 |
| App loading        | Plain “Loading…” text                                                | Low      | Subtle pulse skeleton (respects reduced motion)                                       |
| Admin nav          | Fixed vertical width; awkward on mobile beside content               | Medium   | Horizontal scroll + pill links on small screens                                       |
| Admin tables       | Raw overflow scroll only                                             | Low      | Softer container, optional hint in audit for future card-stacking                     |

## Design Principles Applied

- **Mobile-first**: Touch-friendly targets (min 44px where practical), readable base sizes, horizontal nav where vertical nav failed.
- **Premium research feel**: Serif headlines, muted body, restrained color, evidence-of-care in spacing—not marketing hype.
- **Accessibility**: Visible `focus-visible`, labels preserved, contrast maintained, `aria-expanded` / `sr-only` for menu control.
- **Restrained motion**: Short CSS transitions; fade-in only when `prefers-reduced-motion: no-preference`.
- **Consistent spacing**: `px-4 sm:px-6` alignment with `max-w-*` content columns.
- **Conversion clarity**: Landing CTAs and opt-in success state slightly elevated without loud gradients.

## Files Changed

| Path                                                      | Change                                                                                                                                                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/ui-ux-polish-audit.md`                              | New audit + outcomes (this file)                                                                                                                                         |
| `src/app/globals.css`                                     | Smooth scroll, selection, focus-visible, utilities (`page-gutter`, `surface-card`, `btn-primary`, `btn-secondary`, `input-research`), fade-in animation + reduced-motion |
| `src/components/site/SiteLayout.tsx`                      | Subtle radial wash on `main`                                                                                                                                             |
| `src/components/site/Header.tsx`                          | Mobile menu, sticky polish, nav active states                                                                                                                            |
| `src/components/site/Footer.tsx`                          | `page-gutter`, link tap targets, rhythm                                                                                                                                  |
| `src/components/site/PageHeader.tsx`                      | Responsive type + gradient band                                                                                                                                          |
| `src/app/(marketing)/page.tsx`                            | Gutter, hero CTAs, research grid polish                                                                                                                                  |
| `src/app/(marketing)/articles/page.tsx`                   | Card list, empty state, gutter                                                                                                                                           |
| `src/app/(marketing)/about/page.tsx`                      | Gutter                                                                                                                                                                   |
| `src/app/(marketing)/contact/page.tsx`                    | Gutter + responsive grid gap                                                                                                                                             |
| `src/app/(marketing)/insights/page.tsx`                   | Gutter                                                                                                                                                                   |
| `src/app/(marketing)/programs/page.tsx`                   | Gutter                                                                                                                                                                   |
| `src/app/(marketing)/privacy/page.tsx`                    | Gutter                                                                                                                                                                   |
| `src/app/(marketing)/terms/page.tsx`                      | Gutter                                                                                                                                                                   |
| `src/app/(marketing)/research/page.tsx`                   | Featured card, gutter                                                                                                                                                    |
| `src/app/(marketing)/where-deals-break/page.tsx`          | Gutter                                                                                                                                                                   |
| `src/components/articles/*`                               | Header, body measure, answer block, FAQ cards, related cards, lead magnet surface                                                                                        |
| `src/components/landing-pages/LandingHero.tsx`            | Shared buttons, gutter, type scale                                                                                                                                       |
| `src/components/landing-pages/LandingAnswerBlock.tsx`     | Match article answer treatment                                                                                                                                           |
| `src/components/landing-pages/LandingLeadMagnetBlock.tsx` | Surface + spacing                                                                                                                                                        |
| `src/components/landing-pages/LandingOptInForm.tsx`       | Inputs, errors, success animation, `aria-*`                                                                                                                              |
| `src/components/landing-pages/LandingProofBlock.tsx` etc. | `page-gutter` alignment                                                                                                                                                  |
| `src/components/auth/LoginForm.tsx`                       | Card, segmented mode, inputs, loading pulse                                                                                                                              |
| `src/app/app/login/page.tsx`                              | Gutter + hierarchy                                                                                                                                                       |
| `src/components/app/AppShell.tsx`                         | Loading state, nav wrap, sign-out button                                                                                                                                 |
| `src/components/app/DashboardClient.tsx`                  | Summary card                                                                                                                                                             |
| `src/components/app/AccountClient.tsx`                    | Summary card                                                                                                                                                             |
| `src/app/app/dashboard/page.tsx`                          | Heading scale                                                                                                                                                            |
| `src/app/app/account/page.tsx`                            | Heading scale                                                                                                                                                            |
| `src/components/admin/AdminNav.tsx`                       | Horizontal scroll on small screens, pill states                                                                                                                          |
| `src/components/admin/AdminContentTable.tsx`              | Container + thead polish                                                                                                                                                 |
| `src/components/admin/ContentStatusBadge.tsx`             | Ring + min height                                                                                                                                                        |
| `src/app/app/admin/layout.tsx`                            | Spacing between nav and content                                                                                                                                          |
| `src/app/not-found.tsx`                                   | Gutter + primary button utility                                                                                                                                          |

## Improvements Made

| File                    | Improvement                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globals.css`           | Institute-appropriate tokens: slightly larger radius; global `focus-visible`; `::selection`; reusable layout/CTA/form classes; optional fade-in with `prefers-reduced-motion` |
| `Header.tsx`            | **Mobile navigation** (hamburger, full-width panel, close on route change), clearer active states, refined logo lockup                                                        |
| `SiteLayout.tsx`        | Very light radial depth behind content (not loud)                                                                                                                             |
| Marketing pages         | Consistent **`page-gutter`** instead of ad-hoc `px-6`                                                                                                                         |
| Homepage                | Full-width primary CTA on small screens; refined research grid                                                                                                                |
| Articles index          | **Card-style rows** + hover shadow; dashed empty state                                                                                                                        |
| Article template pieces | **65ch** body measure; **accent direct-answer** panel; FAQ as **cards**; related links in **cards**                                                                           |
| Landing template pieces | Aligned hero/answer/lead block with article quality; shared **btn** classes                                                                                                   |
| `LandingOptInForm`      | **`input-research`**, destructive alert styling, **`aria-busy` / `aria-live`**, success **`animate-sbi-fade-in`**                                                             |
| `LoginForm`             | **Segmented** sign-in / create-account control; surface card; session loading row                                                                                             |
| `AppShell`              | **Spinner-style** loading; wrapped app nav; **Sign out** as bordered control                                                                                                  |
| Admin                   | **Scrollable horizontal nav** on narrow viewports; table wrapper **shadow + thead** treatment                                                                                 |
| `not-found`             | Uses **`btn-primary`** for consistency                                                                                                                                        |

## Known Follow-ups

_(Merged with pre-implementation list.)_

- Admin **wide tables** (e.g. leads) could use **per-row cards** below `md` instead of horizontal scroll only.
- **Dedicated OG image** (`public/og.png`) remains a separate design asset task.
- **`where-deals-break`** long-form aside blocks could get the same card system as FAQs in a future pass.
