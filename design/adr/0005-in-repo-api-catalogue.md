# ADR 0005 — Bring the API catalogue back in-repo, fetched live from amp-catalog

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 25 August 2026 |
| **Deciders** | Product owner, HMCTS API Marketplace |
| **Related** | [ADR 0002](0002-prototype-kit-with-static-export.md) — Prototype Kit with static export; [design spec §8](../specs/2026-08-17-govuk-conformant-site-design.md#8-out-of-scope) — originally scoped the catalogue out |

## Context

The design spec for the v2 rebuild explicitly put "the AMp catalogue itself
(`hmcts.github.io/amp-catalog`)" out of scope, and `/api-catalogue` was built as a
signpost page: one button out to that separate service. That matched the
*current* site, whose own `docs/api-catalogue.html` is the same kind of
signpost.

An earlier version of the site was not a signpost — it listed every API and gave
each one a detail page with tabs for its endpoints, data model, changelog and a
link to try it. That page (`docs/api-detail.html`) and its dataset
(`docs/assets/api-data.js`) are still in the repo, orphaned, hand-written and
frozen at whatever the catalogue looked like the day someone last updated them
by hand.

The product decision here is to bring that experience back, but not the way it
was built before: hand-maintained data goes stale the moment an API changes,
which is the exact failure mode a "generated from source" marketplace exists to
avoid.

## Decision

**Rebuild the listing and detail pages in `prototype-kit/`, reading live data at
runtime rather than from a checked-in dataset.**

- The listing (`/api-catalogue`) fetches `https://hmcts.github.io/amp-catalog/apis.json`
  client-side on page load and renders what it gets back — currently 13 APIs,
  each with only `name`, `title`, `description` and `team`. No domain,
  classification or status fields exist in that feed, so none are invented for
  display; a filter or tag that isn't backed by real data would be worse than no
  filter at all.
- The detail page is **one route** (`/api-catalogue/detail`), not one per API.
  It reads which API to show from a query string (`?api=<name>`) at runtime,
  the same technique the orphaned `docs/api-detail.html` already used. This
  keeps the static export's route manifest honest — a manifest entry per live
  API would go stale the moment the feed changes, which is precisely what
  [ADR 0002](0002-prototype-kit-with-static-export.md) chose a manifest to
  prevent.
- The detail page's Endpoints and Data model tabs fetch that API's own OpenAPI
  spec directly from its GitHub repository and parse it client-side (`js-yaml`
  from a CDN, the same library the old root-level prototype used for the same
  job). Not every repo's spec resolves at the guessed path — this is expected,
  and the tab says so plainly rather than failing silently.
- Changelog is derived from the spec's own version and description, not real
  release history — the feed and the spec are the only two data sources this
  page has, and neither carries a changelog.
- "Try it out" links out to that API's hosted documentation
  (`hmcts.github.io/<repo>/`) rather than embedding a request console. There is
  no backend here to proxy a real request through.

## Consequences

- **This page is exempt from the manifest/route guarantees every other v2 page
  has.** The export renders one static shell for `/api-catalogue` and one for
  `/api-catalogue/detail`; the actual API list and spec content only exist once
  a browser runs the page's JavaScript. `gate:html` and `gate:a11y` see the
  loading-state shell, not the populated cards or tabs — a real, honest gap
  worth remembering before trusting those gates' coverage of this page.
- No JavaScript means no catalogue: a user without JS sees the shell and a
  message telling them so, same principle as the sessionStorage-backed forms.
- The page depends on two things this repo does not control: the amp-catalog
  feed staying at its current shape, and individual API repos keeping their
  spec at a guessable path. Both already vary today — some repos 404 on the
  guessed path — so the failure mode (a clear "could not be loaded" message
  with a link to the source) is treated as normal, not exceptional.
- Supersedes the "out of scope" line in the design spec for this one item.
  Everything else in that scope list stands.

## Needs an owner

Whether amp-catalog should eventually publish richer metadata (domain,
classification, status) so this page can filter on real data instead of just
searching title and description — that's a question for whoever owns the
amp-catalog feed, not this rebuild.
