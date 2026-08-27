# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A clickable prototype of the **HMCTS API Marketplace** — a discovery, publication and access-management
platform for HMCTS APIs. It is a presentation/demo artefact, not a production service. The GitHub repo
is `hmcts/hmcts-api-marketplace` and the public site is served from GitHub Pages at
`https://hmcts.github.io/hmcts-api-marketplace/`.

The live site is not currently backend-free: sign-in, registration and account pages call an auth API
at `https://hmcts-api-marketplace-auth.onrender.com`. **That dependency was never sanctioned.** On the
live site, do not extend it, do not add endpoints to it, and do not build anything new against it —
authentication there is to be faked client-side until a sanctioned identity solution exists. See
[`design/adr/0003-authentication-and-identity.md`](design/adr/0003-authentication-and-identity.md).

v2 has taken the opposite path: it deliberately reverses ADR 0003 for a specific, named, growing set of
functionality against that same backend — sign-in/register/account, My applications and teams, and now
My requests — each added as an explicit, documented exception rather than a blanket reopening of the
rule. Treat that list as the extent of it; don't add a new backend call without the same explicit
call-out.

## Three lines of work — know which one you're in

| Line | Location | State |
|---|---|---|
| **v2 rebuild** (current line of work) | Author in `prototype-kit/app/views/**`; generated output lands in `docs/v2/` | Published at `https://hmcts.github.io/hmcts-api-marketplace/v2/`, not yet promoted to the Pages root. GOV.UK Prototype Kit + `govuk-frontend`, bilingual (`cy/`). **Develop here.** |
| **Live site** (frozen until v2 promotion) | `docs/*.html` — 28 pages, shared `docs/assets/{styles.css,scripts.js}` | Live at the Pages root today. Bespoke CSS, no GOV.UK Frontend. CI blocks PRs that touch it. |
| **v0 prototype** (superseded) | `docs/v0/index.html`, `docs/v0/login/index.html`, `index.html`, `prototype/index.html`, `prototype/api-catalogue-v7.html` | Single-file prototypes, kept for reference. Do not develop here. |

The v0 files are byte-identical copies of one another (`index.html`, `prototype/index.html`,
`prototype/api-catalogue-v7.html` and `docs/v0/login/index.html` are the same 324 KB file). If you
ever edit one, mirror it to all of them — but you should not normally be editing them at all.

## Working on v2 — the current line of work

**Never hand-edit `docs/v2/`.** It is generated output, committed only because GitHub Pages serves
from the repo. Edit the Prototype Kit source under `prototype-kit/app/`, then re-export. See
[`design/adr/0002-prototype-kit-with-static-export.md`](design/adr/0002-prototype-kit-with-static-export.md).

```bash
npm run kit      # GOV.UK Prototype Kit dev server on :3100, for authoring/preview
npm run export   # renders every route in scripts/routes.manifest.json into docs/v2/
npm run gates    # manifest, structure, html-validate, links, a11y (pa11y), reflow, translations
```

CI (`.github/workflows/site.yml`) re-runs the export and fails the build if `docs/v2/` drifts from a
fresh export, and separately blocks any PR that touches live `docs/*.html` outside `docs/v2/` — the
current site stays frozen until v2 is promoted.

Source layout: pages in `prototype-kit/app/views/**` (Nunjucks + GOV.UK macros), routes in
`prototype-kit/app/routes.js`, English/Welsh strings in `prototype-kit/app/locales/{en,cy}.json`. A new
route must be added to `scripts/routes.manifest.json` or the export gate fails the build (this is
deliberate — see ADR 0002's "why a manifest and not a crawler").

Multi-step journeys carry answers in `sessionStorage`, not server sessions — the Kit's server-side
form POSTs don't survive static export. Auth is faked client-side (no calls to any backend); see
[`design/adr/0003-authentication-and-identity.md`](design/adr/0003-authentication-and-identity.md).

## Build / run / test

**v2** (see above) has real tooling: `npm run kit`, `npm run export`, `npm run gates`. **The live site**
and **v0** have none of that — no build pipeline, no tests, no linter, just plain HTML. To run the live
site, serve the directory:

```bash
python3 -m http.server 8000 --directory docs   # then open http://localhost:8000/
```

Use a server, not `file://` — the pages make cross-origin `fetch()` calls to the auth API and the
catalogue feed.

## Architecture of the live site (`docs/*.html`, frozen)

Plain multi-page static HTML. `docs/assets/styles.css` (37 KB) is a bespoke design system; there is no
GOV.UK Frontend. `docs/assets/scripts.js` provides the mobile nav toggle, catalogue filtering, tab
switching, mock form submission (`data-mock-submit` — forms show a confirmation and send nothing), and
a site-wide `/api/me` check that swaps the header "Sign in" link for the signed-in user's name. That
last one is the unsanctioned dependency described above and is on its way out — v2 fakes auth
client-side instead.

Header, navigation and both footer columns are **copy-pasted into all 28 pages**. A change to any of
them is a 28-file edit. (v2 fixes this with one Nunjucks layout.)

Several journeys (create an application, register, the four content forms) are multiple screens inside
one HTML file, toggled by JavaScript via `display:none`. They have no per-step URLs, so `my-applications.html`
contains nine `<h1>` elements.

The API catalogue itself lives **outside this repo**, at `https://hmcts.github.io/amp-catalog/`.
`docs/api-catalogue.html` is a signpost to it. `docs/api-detail.html` and `docs/assets/api-data.js` are
orphaned remnants of an earlier in-site catalogue — nothing links to them.

This line of work is frozen: do not edit it except to fix something blocking v2 promotion. New work
goes into `prototype-kit/`.

## Architecture of the v0 prototype (`docs/v0/`)

Vanilla-JS single-page app in one file, ES5-ish. "Pages" are sibling `<div id="...Page" class="app-page">`
elements shown via `show*()` functions. `var APIS = [...]` seeds ~6 APIs; `fetchLiveCatalogue()` overwrites
it from `https://hmcts.github.io/amp-catalog/apis.json`. State persists in `localStorage` under `_cat_*`
keys. Three roles — `consumer`, `producer`, `reviewer` — each with a dashboard.

## Documentation

- **`design/`** — audit, design specs and ADRs behind the v2 rebuild. Start with
  [`design/README.md`](design/README.md). Read the audit
  ([`design/audit/2026-08-17-govuk-conformance-audit.md`](design/audit/2026-08-17-govuk-conformance-audit.md))
  before touching v2 markup, and the four ADRs (branding/domain, Kit + static export, auth/identity,
  hosting) before touching structure or tooling.
- **`docs/v0/requirements/CAP-01..14-*.md`** — capability specs, with supporting `docs/v0/capabilities.md`,
  `roadmap.md`, `product-vision.md`, `user-journeys/` and `gap-analysis/`. Feature behaviour is often
  tagged with the capability it implements (e.g. comments referencing `CAP-03`).

`design/` deliberately sits outside `docs/`, because `docs/` is the GitHub Pages publishing root and
anything in it is served publicly.

## Things to know before changing anything

- **Edit `prototype-kit/app/`, never `docs/v2/` directly.** It's generated output; CI fails the build
  if it drifts from a fresh `npm run export`.
- A new v2 route must be added to `scripts/routes.manifest.json`, or the export gate fails the build —
  this is deliberate (ADR 0002), so that a broken or unlinked page fails loudly instead of silently
  vanishing.
- **The live `docs/*.html` site is frozen** until v2 is promoted — CI blocks PRs that touch it. Only
  fix something there if it's actively blocking promotion.
- On the live site, all four content forms (`contact`, `publish-api`, `request-api`,
  `request-new-api`) **claim to submit and submit nothing** — don't add copy there that implies a real
  submission. In v2, `contact` is still a no-op, but `publish-api`, `request-api` and `request-new-api`
  really do submit: they POST to `/api/requests` on the same auth backend as sign-in (see
  `prototype-kit/app/assets/javascripts/requests.js`), and a signed-in user's own submissions show up
  on `/account/requests`. This is a second exception to the unsanctioned-backend rule above, alongside
  sign-in/register/account and My applications — extending that same already-live backend, not a new
  one.
- On the live site, "Accessibility statement", "Cookies" and "Privacy notice" are `href="#"` on all 28
  pages — the first two are legally required. v2 has real pages for all three
  (`accessibility-statement/`, `cookies/`, `privacy/`); keep them in sync with legal requirements as
  the rebuild progresses.
- The brand blue `#0096d6` (live site only) is 3.32:1 against white and fails WCAG AA. Don't extend its
  use — v2 uses GOV.UK Frontend colours instead.
- `register.html` and `sign-in.html` on the live site transmit names, work emails, organisations and
  passwords to `onrender.com`, an unsanctioned host. v2 fakes auth entirely client-side — see
  [`design/adr/0003-authentication-and-identity.md`](design/adr/0003-authentication-and-identity.md) —
  and must not call that or any other backend.
- v2 is bilingual: every route under `prototype-kit/app/views/` needs both `en` and `cy` strings in
  `prototype-kit/app/locales/`, checked by `npm run gate:translations`.
