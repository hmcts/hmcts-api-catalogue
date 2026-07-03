# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A clickable prototype of the **HMCTS API Marketplace** — a discovery, publication and access-management platform for HMCTS APIs. It is a presentation/demo artefact, not a production service. There is no backend; everything runs in the browser. The GitHub repo is `hmcts/hmcts-api-marketplace` and the public site is served from GitHub Pages at `https://hmcts.github.io/hmcts-api-marketplace/`.

## Build / run / test

There is **no build pipeline, no package.json, no tests, no linter**. The app is a single self-contained HTML file using [GOV.UK Frontend 5.4.0](https://frontend.design-system.service.gov.uk) loaded from CDN.

To run it, open the HTML file in a browser, or serve the directory:

```bash
python3 -m http.server 8000   # then open http://localhost:8000/
```

Use a server (not `file://`) — the app does cross-origin `fetch()` calls for live specs and the catalogue feed, which behave more realistically over HTTP.

## Critical: the file is duplicated across the repo — keep copies in sync

The same app exists as **byte-identical copies** in several locations. There are two distinct versions:

| Version | Copies (all identical within a row) |
|---|---|
| **MVP** (~305 KB, simplified, *currently the active line of work* — served at the site root) | `docs/index.html` |
| **Full prototype** (~324 KB, all roles & journeys — served at `/login/`) | `index.html`, `prototype/index.html`, `prototype/api-catalogue-v7.html`, `docs/login/index.html` |

When you edit a full-prototype copy, you must mirror the change to every other copy in that row, or the deployed site and the prototype copies will diverge. The MVP currently has a single copy (`docs/index.html`), so it needs no mirroring — but confirm with the user which version a change targets if it isn't obvious. `docs/` is the GitHub Pages source, so `docs/index.html` renders at the public root URL and `docs/login/index.html` renders at `.../login/`.

## Architecture (inside the single HTML file)

It is a vanilla-JS single-page app — no framework. Plain `<script>` blocks, `var`/`function` style, ES5-ish.

**Page routing.** "Pages" are sibling `<div id="...Page" class="app-page">` elements. CSS `.app-page{display:none} .app-page--active{display:block}` shows exactly one. Navigation goes through `show*()` functions (`showHome`, `showMarketplace`, `showDetail`, `showSignIn`, `showGuidance`, `showProducerStandards`, `showDataGovernance`, plus role dashboards `showCDash`/`showPDash`/`showRvDash`). Each calls `hideAll()` then adds `app-page--active` to its target. Note `showHome`/`showMarketplace` are counter-intuitively wired: `marketplacePage` is the landing/nav-card page and `homePage` is the searchable API list — check the function bodies, not the names.

**Data model.** `var APIS = [...]` near the top is a hardcoded seed of ~6 HMCTS APIs (each with `id`, `name`, `domain`, `classification`, `status`, `specUrl`, `repoUrl`, `docsUrl`, `swaggerOrg/Api/Ver`, etc.). At load, `fetchLiveCatalogue()` fetches `AMP_CATALOG_URL` (`https://hmcts.github.io/amp-catalog/apis.json`) and, on success, **overwrites** `APIS` via `mapAmpApiToLocal()`, falling back to the seed on failure.

**Live spec rendering.** Detail pages fetch each API's OpenAPI spec directly from its GitHub raw `specUrl`, parse YAML with the js-yaml CDN lib (`parseYamlSpec`), and render endpoints/response codes. On failure they fall back to a "View on SwaggerHub" link (`https://app.swaggerhub.com/apis/...`); the mock server URL is `https://virtserver.swaggerhub.com/...`.

**Persistence.** All prototype state is in `localStorage` (no server). Keys are prefixed `_cat_`: `_cat_users`, `_cat_sess` (current session), `_cat_reqs` / `_cat_all_reqs` (access requests), `_cat_papis_<userId>` (a producer's published APIs), and `PUB_DRAFT_KEY` (publish-form draft). Helpers `ls*()` (`lsU`, `lsSU`, `lsSess`, `lsPApis`, …) wrap these.

**Roles.** Three roles selected at registration — `consumer`, `producer`, `reviewer` — each with its own dashboard and journey (browse/request, publish, approve/reject).

## Product documentation

`docs/` is both the Pages source and the product spec home. `docs/requirements/CAP-01..14-*.md` are the capability specs, with supporting `docs/capabilities.md`, `docs/roadmap.md`, `docs/product-vision.md`, `docs/user-journeys/`, and `docs/gap-analysis/`. Feature behaviour in the HTML is often tagged with the capability it implements (e.g. comments referencing `CAP-03`). When changing a journey, check the matching `CAP-*` file for intended behaviour.
