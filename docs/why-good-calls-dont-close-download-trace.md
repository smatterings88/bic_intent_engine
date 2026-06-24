# CTA Trace: why-good-calls-dont-close#download

**Business Impact Canada · Intent Page Engine**  
**Page:** https://businessimpactcanada.com/why-good-calls-dont-close#download  
**Generated:** June 10, 2026

---

## Page profile

| Field | Value |
| --- | --- |
| Slug | `why-good-calls-dont-close` |
| contentType | `landing_page` |
| renderMode | `html_snippet` (custom HTML + scoped CSS) |
| leadMagnetId | `the-call-felt-fine` |
| Form destination | `lead-magnet:the-call-felt-fine` |
| Form anchor | `#zenith-form-lead-magnet-the-call-felt-fine` |
| #download target | `<section class="download" id="download">` — conversion block at bottom |
| Global footer | Hidden (`layout.hideGlobalFooter: true`) |

Production LP1 is ingested as **html_snippet**, not the structured `components[]` layout in the repo example JSON. There is **one** `<form>` on the page, inside `#download`.

---

## What `#download` does

The URL hash is **browser-only** — it is never sent to the server.

1. Browser requests `GET /why-good-calls-dont-close` (200)
2. Server returns full page HTML
3. Browser paints the page
4. Browser scrolls to `id="download"`
5. User sees the download card + LeadForm

A direct visit to `…/why-good-calls-dont-close#download` jumps straight to: *"The Free Forensic Analysis" / "Download the evidence file. See all seven moments."* with the name/email form.

---

## 1. Page load

**Route:** `src/app/(marketing)/[slug]/page.tsx`

1. `getPublishedZenithPageBySlug("why-good-calls-dont-close")` loads published doc from Firestore
2. `ZenithPageRenderer` dispatches to `html_snippet` flow
3. `ZenithHtmlSnippetShell` — full-bleed wrapper (no `max-w-[1100px]` marketing shell)
4. `ZenithHtmlRenderer` injects scoped `html.css` + sanitized `html.body`
5. `<div data-sbi-slot="…">` placeholders are replaced in-place with React `LeadForm`

**Layout (parallel):**

- Middleware sets `x-pathname`
- `SiteLayout` → `resolveHideGlobalFooterForPathname()` → global marketing footer **not rendered**

**Rendered shell:**

```html
<div class="zenith-html-page-fullbleed">
  <div class="zenith-html-snippet"
       data-zenith-page="why-good-calls-dont-close"
       data-render-mode="html_snippet">
    …custom LP1 HTML…
  </div>
</div>
```

There is **no embedded page JSON** in public HTML. Config is loaded server-side from Firestore by slug.

---

## 2. CTA types on this page

### A. Scroll CTAs → `#download` (no API call)

Plain links in Zenith HTML — **not** `ZenithCtaButton`.

| CTA label | Location | HTML | Behavior |
| --- | --- | --- | --- |
| See What The Recording Captured → | Hero | `<a href="#download" class="btn-red">` | Scroll to form |
| See All Seven Moments → | Mid-page (after moment list) | `<a href="#download" class="btn-red">` | Scroll to form |

`#download` is the **only** in-page hash on this page.

**Click flow:** user clicks → browser scrolls to `<section id="download">` → no network request.

### B. Conversion CTA — form submit (API + GHL)

Inside `#download`, inside `.dl-card`:

- Headline area: "Download the evidence file"
- Fields: **Name**, **Email** (landing_page rule forces these)
- Submit button: **Download The Analysis Guide →**
- Form element id: `zenith-form-lead-magnet-the-call-felt-fine`

This is the app `LeadForm` component, injected via a `slots[]` `lead-form` entry.

---

## 3. Full conversion trace (submit click)

### Step 1 — Client validation

`LeadForm` (`src/components/zenith/components/LeadForm.tsx`) validates locally:

- Name required
- Email required + format check

If validation fails → inline field error, **no API call**.

### Step 2 — POST body

```
POST /api/zenith/forms/submit
Content-Type: application/json
```

```json
{
  "pageSlug": "why-good-calls-dont-close",
  "slot": "<slot-id from Firestore slots[]>",
  "variant": "lead-magnet-capture",
  "destination": "lead-magnet:the-call-felt-fine",
  "fields": { "name": "Jane Doe", "email": "jane@company.com" },
  "tracking": {
    "utmSource": "…",
    "utmMedium": "…",
    "utmCampaign": "…",
    "referrer": "…",
    "path": "/why-good-calls-dont-close"
  }
}
```

UTM params are read from the URL query string at submit time. The `#download` hash does not affect tracking.

### Step 3 — Server processing

**Handler:** `src/app/api/zenith/forms/submit/route.ts`

1. Load `ZenithPage` from Firestore by `pageSlug`
2. `resolveStoredFormSource(page, { destination, variant, slot })` — looks up **stored** slot config (not client body)
3. Read `successBehavior`, `thankYouPageUrl`, `ghlTagStrategy` from slot only
4. Validate fields for `lead-magnet` on `landing_page` (name + valid email)
5. `resolveZenithFormGhlTags()` — compute tags from page/slot strategies
6. Write document to `zenithFormSubmissions` in Firestore (`ghlSyncStatus: pending`)
7. `syncContactWithTags()` → GoHighLevel (search by email, update or create, apply tags)
8. Update submission doc (`synced` | `failed` | `skipped`)
9. Return JSON: `{ ok, submissionId, thankYouMessage, thankYouPageUrl?, ghlSyncStatus, intendedGhlTags }`

**Default GHL tag** (unless `ghlTagStrategy` overrides):

- `lead_magnet:the-call-felt-fine`

**Security note:** Tags and redirect URLs come from **stored page/slot config**, not from whatever the client sends.

### Step 4 — Client after success

`LeadForm` checks the API response:

- If `thankYouPageUrl` → `window.location.assign(url)`
- If `successBehavior.type === "inline_message"` → replace form with green success panel
- If GHL sync failed → append CRM warning to success message

**Expected redirect** (from `leadMagnetId: the-call-felt-fine`):

- `/cta/thank-you-the-call-felt-fine`

> **Production note (June 2026):** That thank-you URL currently returns HTTP 500. Submissions may still save and sync to GHL, but post-submit redirect may land on an error page until the TY `cta_page` is fixed/published.

---

## 4. Typical user journeys

### Journey A — Direct link with hash

1. Open `…/why-good-calls-dont-close#download`
2. Page loads → browser scrolls to download section
3. Enter name + email → click **Download The Analysis Guide →**
4. API + GHL → redirect to thank-you (or inline success if configured)

### Journey B — Hero CTA

1. Land on page top (forensic hero, case file widget)
2. Click **See What The Recording Captured →**
3. Scroll to `#download`
4. Submit → same API path as Journey A

### Journey C — Mid-page CTA

1. Read moments / transcript sections
2. Click **See All Seven Moments →**
3. Scroll to `#download`
4. Submit → same API path

All three paths converge on the **same single form** in `#download`.

---

## 5. What does NOT happen

| Action | Result |
| --- | --- |
| Visit `#download` | Browser scroll only; no server hash handling |
| Click hero/mid scroll CTAs | Browser scroll; no API |
| Client sending custom GHL tags | Ignored — server uses stored slot config |
| Client sending custom redirect URL | Ignored — server uses stored `successBehavior` / `thankYouPageUrl` |
| `ZenithCtaButton` / `#zenith-form-…` auto-scroll | Not used — CTAs are raw `<a href="#download">` in HTML |

---

## 6. LP1 vs repo example JSON

The repo file `docs/examples/zenith-lp1-forensic-landing-page-request.json` describes a **components** page (`page-hero`, `inline-cta`, `forensic-download-section`, etc.).

Production LP1 was ingested as **`html_snippet`** instead — same story and destination, but:

- CTAs scroll to `#download` (not `#zenith-form-lead-magnet-the-call-felt-fine`)
- One slot-backed `LeadForm` in the download card
- Custom HTML/CSS drives layout

---

## 7. Verify in admin Raw JSON

**Admin → Zenith → `why-good-calls-dont-close` → Raw JSON**

Confirm:

1. `slots[].slot` — id sent as `"slot"` in the POST body
2. `slots[].successBehavior` — redirect vs inline message
3. `slots[].ghlTagStrategy` — exact GHL tags applied
4. `/cta/thank-you-the-call-felt-fine` is published and returns 200

---

## Key source files

| File | Role |
| --- | --- |
| `src/app/(marketing)/[slug]/page.tsx` | Public route, loads published page |
| `src/components/zenith/ZenithPageRenderer.tsx` | Render mode dispatch |
| `src/components/zenith/ZenithHtmlRenderer.tsx` | HTML + slot replacement |
| `src/components/zenith/components/LeadForm.tsx` | Client form + submit |
| `src/app/api/zenith/forms/submit/route.ts` | Server submit + GHL sync |
| `src/lib/zenith/slot-config.ts` | Stored form source resolution |
| `src/lib/zenith/resolve-public-layout.ts` | Footer hide on SSR |

---

*Business Impact Canada · Intent Page Engine*
