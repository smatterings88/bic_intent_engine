# Zenith HTML snippet ingestion

Additive render modes for ZenithMind pages. The existing **components** pipeline is unchanged and remains the default when `renderMode` is omitted.

## Render modes

| `renderMode` | Behavior |
|--------------|----------|
| *(omitted)* / `components` | Structured `components[]` only (current LP1 behavior). |
| `html_snippet` | Sanitized HTML in `html.body`, optional scoped `html.css`, + app-controlled `slots[]`. |
| `hybrid` | Structured `components[]` plus `html-section` components (or page-level HTML). |

## `html` object

```json
{
  "framework": "custom",
  "body": "<main>...</main>",
  "css": ".hero h1 { color: #1e3560; }"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `framework` | No | `bootstrap`, `plain`, `custom`, or any string label. `bootstrap` also loads Bootstrap 5 CSS. |
| `body` | Yes | Sanitized HTML. **No `<style>` tags** in body — put styles in `css`. |
| `css` | No | Page-specific CSS (max 100KB). Sanitized and **scoped** at ingest to `.zenith-html-snippet[data-zenith-page="{slug}"]`. |

Stored fields after ingest: `sanitizedBody`, `sanitizedCss` (when `css` was sent).

## `layout` object

```json
{
  "layout": {
    "hideGlobalFooter": true
  }
}
```

| Field | Default | Notes |
|-------|---------|-------|
| `hideGlobalFooter` | `false` | Only applies when `renderMode` is `html_snippet`. Suppresses the global SBI marketing footer below the page. |

If Zenith includes a custom `<footer>` inside `html.body`, set `layout.hideGlobalFooter` to `true` to avoid duplicate footers. If Zenith does not include a footer, omit the flag or set it to `false`.

The global **header** is always shown unless a future flag is added.

On public routes, `layout.hideGlobalFooter` is resolved **on the server** from the published Zenith page slug (via middleware `x-pathname` + Firestore) before `SiteFooterGate` renders, so the global footer is not included in the initial HTML.

## Rendering

- `html_snippet` pages use a **full-bleed** wrapper (`zenith-html-page-fullbleed`), not the marketing `max-w-[1100px]` shell. Zenith CSS controls section width and padding.
- Slot placeholders (`<div data-sbi-slot="…"></div>`) are replaced **in place** inside parent wrappers (e.g. `.slot-wrap`), so forms render where Zenith placed them.
- Scoped CSS is emitted as `<style data-zenith-scoped-css="true">`.

## Security

- Zenith controls **layout** in HTML/CSS; the app controls **behavior** (forms, tags, redirects, metadata).
- HTML is sanitized at ingest (`sanitizeZenithHtmlBody`); only `sanitizedBody` is rendered.
- CSS is sanitized at ingest (`sanitizeZenithCss`); only `sanitizedCss` is rendered inside the page wrapper.
- **Forbidden in `html.body`:** `<style>`, `<form>`, inputs, scripts, iframes, event handlers, `javascript:` URLs.
- **Forbidden in `html.css`:** `@import`, `@font-face`, `javascript:`, `expression()`, `behavior:`, `-moz-binding`, external `url(http…)` / `url(//…)` / `url(data:…)`, and global `html` / `body` / `:root` selectors.
- Use placeholders: `<div data-sbi-slot="lead-form"></div>` and define the form in `slots[]`.
- GHL tags and redirect targets come from **stored page/slot config**, never from public submit bodies.

## Single page ingest

```bash
export ZENITH_CONTENT_SECRET="..."
export BASE_URL="https://businessimpactcanada.com"

curl -i -X POST "$BASE_URL/api/zenith/content" \
  -H "Authorization: Bearer $ZENITH_CONTENT_SECRET" \
  -H "Content-Type: application/json" \
  --data-binary @html-page.json
```

## Batch ingest (landing + thank-you)

`POST /api/zenith/content/bulk` or `POST /api/zenith/content/batch` (alias).

Accepts legacy `{ "pages": [...] }` or Zenith batch `{ "items": [...], "relationships": [...] }`.

```bash
curl -i -X POST "$BASE_URL/api/zenith/content/batch" \
  -H "Authorization: Bearer $ZENITH_CONTENT_SECRET" \
  -H "Content-Type: application/json" \
  --data-binary @batch.json
```

`relationships` with `type: "form_success_redirect"` copy redirect behavior onto the matching slot `successBehavior` before save.

## `successBehavior` (lead-form slots)

**Redirect (thank-you page):**

```json
{
  "type": "redirect",
  "targetType": "thank_you_page",
  "targetSlug": "thank-you-the-call-felt-fine"
}
```

Redirects to `/{targetSlug}` after successful submit.

**Inline message:**

```json
{
  "type": "inline_message",
  "message": "Check your inbox."
}
```

## Form submit

Public forms POST to `/api/zenith/forms/submit` with `pageSlug`, `destination`, `variant`, and optional `slot`. The server resolves tags and redirects from Firestore page config.

## Examples

- `docs/examples/zenith-html-snippet-custom-css.json` — `framework: "custom"`, `html.body`, `html.css`, `slots[]`
- `docs/examples/zenith-lp-ty-bulk-request.json` — bulk landing + thank-you

Validate examples:

```bash
npm run validate:zenith-html-css
npm run validate:zenith-examples
```

## Example payload (custom CSS)

```json
{
  "renderMode": "html_snippet",
  "slug": "my-prototype-lp",
  "contentType": "landing_page",
  "html": {
    "framework": "custom",
    "body": "<main class=\"hero\"><h1>Title</h1><div data-sbi-slot=\"lead-form\"></div></main>",
    "css": ".hero { padding: 2rem; } .hero h1 { color: #1e3560; }"
  },
  "layout": { "hideGlobalFooter": true },
  "slots": [
    {
      "slot": "lead-form",
      "type": "lead-form",
      "destination": "lead-magnet:my-guide",
      "fields": ["name", "email"],
      "successBehavior": {
        "type": "redirect",
        "targetType": "thank_you_page",
        "targetSlug": "thank-you-my-guide"
      }
    }
  ],
  "components": []
}
```
