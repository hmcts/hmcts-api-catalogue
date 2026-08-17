# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A clickable prototype of the **HMCTS API Marketplace** — a discovery, publication and access-management
platform for HMCTS APIs. It is a presentation/demo artefact, not a production service. The GitHub repo
is `hmcts/hmcts-api-marketplace` and the public site is served from GitHub Pages at
`https://hmcts.github.io/hmcts-api-marketplace/`.

The live site is not currently backend-free: sign-in, registration and account pages call an auth API
at `https://hmcts-api-marketplace-auth.onrender.com`. **That dependency was never sanctioned and is
being removed.** Do not extend it, do not add endpoints to it, and do not build anything new against
it. Authentication is to be faked client-side until a sanctioned identity solution exists — see
[`design/adr/0003-authentication-and-identity.md`](design/adr/0003-authentication-and-identity.md).

## Two lines of work — know which one you're in

| Line | Location | State |
|---|---|---|
| **Current site** | `docs/*.html` — 28 pages, shared `docs/assets/{styles.css,scripts.js}` | Live at the Pages root. Bespoke CSS, no GOV.UK Frontend. |
| **v0 prototype** (superseded) | `docs/v0/index.html`, `docs/v0/login/index.html`, `index.html`, `prototype/index.html`, `prototype/api-catalogue-v7.html` | Single-file prototypes, kept for reference. Do not develop here. |

The v0 files are byte-identical copies of one another (`index.html`, `prototype/index.html`,
`prototype/api-catalogue-v7.html` and `docs/v0/login/index.html` are the same 324 KB file). If you
ever edit one, mirror it to all of them — but you should not normally be editing them at all.

## Build / run / test

There is **no build pipeline, no package.json, no tests, no linter**. The current site is plain HTML
plus one hand-written stylesheet.

To run it, serve the directory:

```bash
python3 -m http.server 8000 --directory docs   # then open http://localhost:8000/
```

Use a server, not `file://` — the pages make cross-origin `fetch()` calls to the auth API and the
catalogue feed.

## Architecture of the current site (`docs/`)

Plain multi-page static HTML. `docs/assets/styles.css` (37 KB) is a bespoke design system; there is no
GOV.UK Frontend. `docs/assets/scripts.js` provides the mobile nav toggle, catalogue filtering, tab
switching, mock form submission (`data-mock-submit` — forms show a confirmation and send nothing), and
a site-wide `/api/me` check that swaps the header "Sign in" link for the signed-in user's name. That
last one is the unsanctioned dependency described above and is on its way out.

Header, navigation and both footer columns are **copy-pasted into all 28 pages**. A change to any of
them is a 28-file edit.

Several journeys (create an application, register, the four content forms) are multiple screens inside
one HTML file, toggled by JavaScript via `display:none`. They have no per-step URLs, so `my-applications.html`
contains nine `<h1>` elements.

The API catalogue itself lives **outside this repo**, at `https://hmcts.github.io/amp-catalog/`.
`docs/api-catalogue.html` is a signpost to it. `docs/api-detail.html` and `docs/assets/api-data.js` are
orphaned remnants of an earlier in-site catalogue — nothing links to them.

## Architecture of the v0 prototype (`docs/v0/`)

Vanilla-JS single-page app in one file, ES5-ish. "Pages" are sibling `<div id="...Page" class="app-page">`
elements shown via `show*()` functions. `var APIS = [...]` seeds ~6 APIs; `fetchLiveCatalogue()` overwrites
it from `https://hmcts.github.io/amp-catalog/apis.json`. State persists in `localStorage` under `_cat_*`
keys. Three roles — `consumer`, `producer`, `reviewer` — each with a dashboard.

## Documentation

- **`design/`** — audit, design specs and ADRs for the GOV.UK-conformant rebuild. Start with
  [`design/README.md`](design/README.md). Read the audit before changing the current site's markup or
  CSS: it records 26 findings with stable IDs, and several are legal rather than cosmetic.
- **`docs/v0/requirements/CAP-01..14-*.md`** — capability specs, with supporting `docs/v0/capabilities.md`,
  `roadmap.md`, `product-vision.md`, `user-journeys/` and `gap-analysis/`. Feature behaviour is often
  tagged with the capability it implements (e.g. comments referencing `CAP-03`).

`design/` deliberately sits outside `docs/`, because `docs/` is the GitHub Pages publishing root and
anything in it is served publicly.

## Things to know before changing anything

- The four content forms (`contact`, `publish-api`, `request-api`, `request-new-api`) **claim to submit
  and submit nothing**. Do not add copy that implies a real submission.
- "Accessibility statement", "Cookies" and "Privacy notice" are `href="#"` on all 28 pages. The first
  two are legally required. See `design/audit/`.
- The brand blue `#0096d6` used for every link and primary button is 3.32:1 against white and fails
  WCAG AA. Do not extend its use.
- `register.html` and `sign-in.html` transmit names, work emails, organisations and passwords to
  `onrender.com`, an unsanctioned host, and the site publishes no privacy notice. Removing those calls
  is the highest-priority change in the repository. Any new auth work must be a client-side fake.
- `docs/v2/`, once it exists, will be **generated output**. Never hand-edit it; edit the Prototype Kit
  source and re-run the export.
