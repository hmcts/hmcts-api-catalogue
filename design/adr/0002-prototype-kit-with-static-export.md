# ADR 0002 — GOV.UK Prototype Kit with a static export to GitHub Pages

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 17 August 2026 |
| **Deciders** | Product owner, HMCTS API Marketplace |

## Context

The site is 28 hand-written HTML pages with no build pipeline, no npm, no tests and no linter. The
header, navigation and footer are copy-pasted into all 28 files
([audit H-2](../audit/2026-08-17-govuk-conformance-audit.md#h-2--medium--header-and-footer-are-copy-pasted-28-times)),
which is precisely why three dead legal links and a one-item navigation are uniform site-wide
defects. There are 278 inline `style` attributes
([H-1](../audit/2026-08-17-govuk-conformance-audit.md#h-1--medium--278-inline-style-attributes-across-27-of-28-pages)).

Hosting is GitHub Pages, publishing from `docs/`. The rebuild must therefore end up as static files.

## Options considered

**A. Hand-written static HTML with `govuk-frontend` CSS vendored.** No build step, deploys exactly as
today. But header and footer stay duplicated 28 times, and every component's markup is
hand-maintained — the same failure mode that produced the current defects.

**B. Eleventy + Nunjucks + `govuk-frontend`.** Layouts and GOV.UK Nunjucks macros, static output into
`docs/`. Solves duplication and guarantees correct component markup. Not the Prototype Kit, so no Kit
plugins or server routes.

**C. GOV.UK Prototype Kit.** The official GDS tool. Real Kit authoring, plugins, session data and
server-side form POSTs. But it is an Express application and cannot be served by GitHub Pages.

**D. Prototype Kit, exported to static HTML.** Author in the Kit; render every route to static files
for Pages.

## Decision

**Option D.** Author in the GOV.UK Prototype Kit under `prototype-kit/`, and export to `docs/v2/`
via `scripts/export-static.mjs`.

The export is driven by an **explicit route manifest** (`scripts/routes.manifest.json`), not a
crawler.

## Consequences

**What this buys.** Genuine Kit authoring — GOV.UK Nunjucks macros, Kit layouts and plugins, and
markup that matches the Design System because it comes from the Design System. One layout file
instead of 28 copies. GitHub Pages hosting unchanged.

**What it costs.**

- The export script is a piece of infrastructure that must be maintained.
- Kit features requiring a server are unavailable after export: server-side form POSTs, `req.session`
  data, and any server-side branching. Multi-step journeys therefore carry answers in
  `sessionStorage` and degrade to non-remembering steps without JavaScript. This is acceptable
  because the content forms are deliberately honest prototypes, and it is stated on each confirmation
  page.
- Two representations of the site exist in the repository: the Kit source and the generated
  `docs/v2/`. The generated output is committed, because GitHub Pages serves from the repository.
  `docs/v2/` must never be hand-edited.

**Why a manifest and not a crawler.** A crawler discovers pages by following links. A page that fails
to render, or that nothing happens to link to, silently vanishes from the output — which is how the
current site came to have an orphan page
([H-3](../audit/2026-08-17-govuk-conformance-audit.md#h-3--low--one-broken-link-one-orphan-page)).
With a manifest, a missing or failing route fails the build, and the manifest doubles as the
reconciliation gate described in the
[design spec](../specs/2026-08-17-govuk-conformant-site-design.md#7-verification).

**Reversibility.** If the export proves troublesome, Option B is a short move: the Nunjucks templates
and `govuk-frontend` macros carry over largely unchanged, and only the Kit's routing and the export
script are discarded.
