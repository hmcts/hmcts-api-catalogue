# Design: a GOV.UK-conformant HMCTS API Marketplace site

| | |
|---|---|
| **Date** | 17 August 2026 |
| **Status** | Awaiting approval |
| **Audit** | [`design/audit/2026-08-17-govuk-conformance-audit.md`](../audit/2026-08-17-govuk-conformance-audit.md) |
| **Decisions** | [ADR 0001](../adr/0001-govuk-branding-and-domain.md) · [ADR 0002](../adr/0002-prototype-kit-with-static-export.md) · [ADR 0003](../adr/0003-authentication-and-identity.md) |

## 1. Problem

The site at `https://hmcts.github.io/hmcts-api-marketplace/` is the front door to the HMCTS API
Marketplace, and beyond it to the wider HMCTS API estate. The audit found 5 Critical and 8 High
findings: no GOV.UK Frontend anywhere, contrast failures on every link and primary button, three
legally required pages unpublished, four forms that claim to submit and submit nothing, and no
navigation.

The content is good. The presentation, page structure and plumbing are not. This design rebuilds the
latter and preserves the former.

## 2. Decisions taken

Agreed with the product owner on 17 August 2026:

| Decision | Choice |
|---|---|
| Branding | Full GOV.UK — black masthead with crest, GDS Transport. A `service.gov.uk` domain is planned; the GitHub Pages URL is a staging location. See [ADR 0001](../adr/0001-govuk-branding-and-domain.md). |
| Scope | All 28 pages, including the authenticated area. |
| Build | GOV.UK Prototype Kit, exported to static HTML. See [ADR 0002](../adr/0002-prototype-kit-with-static-export.md). |
| Delivery | Parallel `docs/v2/`, promoted to the root when approved. |
| AMp catalogue | Stays outside this site. Signpost only; final URL swapped in later. |
| Content forms | Honest prototypes — full GDS patterns, confirmation pages that state plainly nothing was submitted. |
| Legal pages | Drafted here to the GOV.UK templates, every fact needing sign-off flagged inline. |
| Authentication | **No backend.** The `onrender.com` dependency is removed and the sign-in, registration and account flows are faked client-side until a sanctioned identity solution exists — see [ADR 0003](../adr/0003-authentication-and-identity.md). |
| De-risking | A vertical slice of five pages, reviewed at an explicit approval gate, before the remaining ~43 routes. A mockup layer was considered and rejected — see [§9](#why-this-order). |

### Why these documents live in `design/`, not `docs/`

`docs/` is the GitHub Pages publishing root, so anything placed there is served from the public site.
An audit that enumerates the service's weaknesses — including where credentials are sent — should not
be a page on the service. `design/` sits outside the published tree.

## 3. Architecture

```
prototype-kit/                  GOV.UK Prototype Kit application (npm)
  app/
    views/
      layouts/_generic.njk      single layout: masthead, service nav, phase banner, footer
      partials/                 breadcrumbs, contents list, signpost card
      <section>/<page>.njk      one file per route
    assets/
      sass/application.scss     imports govuk-frontend; near-zero bespoke CSS
      javascripts/
        journey-store.js        sessionStorage answer store for exported journeys
        prototype-session.js    the entire faked sign-in/account state — one module, one seam
    routes.js
  package.json                  govuk-frontend, govuk-prototype-kit
scripts/
  export-static.mjs             renders every route in the manifest into docs/v2/
  routes.manifest.json          explicit route list — the single source of truth
docs/v2/                        generated, committed, served by GitHub Pages
docs/                           current site — untouched until promotion
design/                         this audit, spec and the ADRs
.github/workflows/site.yml      build + accessibility + link + validation gates
```

### Build and export

`npm run build` starts the Kit on a local port, reads `routes.manifest.json`, fetches each route,
rewrites root-absolute paths to relative ones, and writes `docs/v2/<route>/index.html` plus the
compiled asset tree.

An **explicit manifest rather than a crawler** is the important choice: a page that fails to render
fails the build, instead of silently disappearing from the output because nothing happened to link
to it. The manifest is also what the reconciliation gate in §7 checks against.

GDS Transport is copied from the `govuk-frontend` package and self-hosted. This removes the current
cross-origin font dependency as a side effect.

### Journeys after export

There is no server after export, so multi-step journeys work like this:

- every step is a real URL with a real GOV.UK back link
- `journey-store.js` persists answers to `sessionStorage` keyed by journey
- the check-answers page reads from the store and renders a `govuk-summary-list` with change links
- without JavaScript every step still renders and reads correctly; it just does not remember answers

That degradation is honest for a prototype and consistent with the decision to keep the content
forms as prototypes. It is called out on each confirmation page rather than hidden.

## 4. Information architecture

Today: one navigation item, and reachability that is an artefact of the footer. Proposed GOV.UK
Service Navigation with five sections plus an account item:

| Section | Landing page | Absorbs |
|---|---|---|
| **API catalogue** | `/api-catalogue` | signpost to the AMp catalogue; URL held in one config value |
| **Get started** | `/get-started` | `getting-started`, `onboarding-guide`, `technology-introduction`, `building-software`, `glossary` |
| **Documentation** | `/documentation` | `documentation`, `our-api-technologies`, `architecture`, `architecture-principles`, `our-capabilities`, `case-studies` |
| **Publish an API** | `/publish` | `producer-standards`, `publish-api`, `data-governance`, `consumer-guidance` |
| **Help and support** | `/help` | `help-and-support`, `contact`, `community`, `resources-a-z` (A–Z and search results) |
| **Your account** | `/account` | `sign-in`, `register`, `account`, `my-applications` |

Each landing page carries a contents list of its section. Long guidance pages keep the GOV.UK
contents pattern they already approximate. Every page gets a `Home >` breadcrumb with a consistent
root.

`api-detail.html` and `assets/api-data.js` are deleted — the page has no inbound links and the
dataset will drift from the real catalogue feed. The broken `entra-jwt-auth.html` link either
resolves to a real page under **Documentation** or is removed; that is a content decision for the
marketplace team, and the build's link gate will not pass until it is made.

## 5. Page and journey inventory

Content pages map roughly one-to-one. The journeys are where page count grows:

| Journey | Today | Proposed routes |
|---|---|---|
| Create an application | 5 screens in `my-applications.html` | `/account/applications/new/environment` → `/owner` → `/name` → `/check-answers` → `/confirmation` |
| Register | 2 screens in `register.html` | `/account/create` → `/account/create/check-answers` → `/account/create/confirmation` |
| Sign in | 2 screens in `sign-in.html` | `/account/sign-in` |
| Contact the team | 2 screens in `contact.html` | `/help/contact` → `/help/contact/confirmation` |
| Request API access | 2 screens | `/api-catalogue/request-access` → `/confirmation` |
| Request a new API | 2 screens | `/api-catalogue/request-new` → `/confirmation` |
| Publish an API | 2 screens | `/publish/submit` → `/publish/submit/check-answers` → `/publish/submit/confirmation` |

Plus a 404 page, a favicon, and the three legal pages: `/accessibility-statement`, `/cookies`,
`/privacy`.

Estimated total: ~30 content pages and ~18 journey steps, ≈48 routes.

## 6. Component and pattern mapping

| Current | Replacement |
|---|---|
| `.hero` gradient with diagonal `clip-path` | `govuk-heading-xl` + lede paragraph + `govuk-button--start` |
| `.link-card.variant-*` coloured tiles with cube SVGs | grid of headed links, or `govuk-task-list` where the cards represent steps |
| `.pill-btn`, `.pill-inverse`, `.pill-filled` | `govuk-button`, `govuk-button--secondary` |
| `.detail-tabs` hand-rolled tabs | `govuk-tabs` |
| `.hex-icon`, `.cube-pattern`, `.accent-bar`, `.graphic.tint-*` | removed |
| bespoke breadcrumbs | `govuk-breadcrumbs` |
| bespoke `.top-bar` + `.site-header` | `govuk-header` + `govuk-service-navigation` |
| bespoke footer | `govuk-footer` with OGL logo and correct Crown copyright |
| generic `.error-summary` | `govuk-error-summary` with links into fields, `role="alert"`, focus on reveal |
| `<span class="hint">` | `govuk-hint` wired via `aria-describedby` |
| password inputs | `govuk-password-input` with `autocomplete="new-password"` / `current-password` — correct patterns even though the plumbing is faked, so they are already right when a real provider arrives |
| `fetch(...onrender.com/api/me)` on every page | removed entirely; header state comes from `prototype-session.js` |
| bespoke `.confirmation .banner` | `govuk-panel--confirmation` |
| `.phase-tag` (defined, never used) | `govuk-phase-banner`, BETA, on every page, with a feedback link |
| 278 inline `style` attributes | removed — GOV.UK spacing, typography and colour utilities only |

Colour resolves the [A-1](../audit/2026-08-17-govuk-conformance-audit.md#a-1--high--contrast-failures-site-wide--wcag-143)
failures by construction: `#0b0c0c` text (13.9:1), `#1d70b8` links (5.17:1), `#505a5f` secondary
(7.07:1), `#00703c` for start buttons only. The brand blue `#0096d6` (3.32:1) and brand green
`#11a63c` (3.21:1) stop being used for text or button fills.

## 7. Verification

There are currently no tests, no linter and no CI. The gates below run in
`.github/workflows/site.yml` on every pull request, and the build fails if any of them does:

| Gate | Tool | Passes when |
|---|---|---|
| Accessibility | `pa11y-ci` with the axe runner, WCAG 2.1 AA plus 2.2 checks, over **every** exported page | zero errors |
| Markup validity | `html-validate` over `docs/v2/**/*.html` | zero errors |
| Link integrity | `linkinator` over `docs/v2` | zero broken internal links |
| Page structure | custom check | exactly one `<h1>` per page; every page has a `<title>`, `lang`, skip link and breadcrumb |
| Manifest reconciliation | custom check | routes declared in `routes.manifest.json` == files present in `docs/v2` |
| Contrast | covered by the axe run | — |

Two of these are worth their weight on their own: the accessibility gate is what stops
[A-1](../audit/2026-08-17-govuk-conformance-audit.md#a-1--high--contrast-failures-site-wide--wcag-143)
regressing, and the manifest reconciliation is what makes the static export trustworthy rather than
hopeful.

**Gate the gates.** Before relying on any of them, each is mutation-tested once: break a contrast
value, add a second `<h1>`, point a link at a missing page, remove a route from the output — and
confirm the relevant gate fails. A gate that has never failed has not been shown to work.

## 8. Out of scope

- **Choosing** the eventual identity provider — GOV.UK One Login, Microsoft Entra ID or otherwise. Removing the `onrender.com` dependency is in scope; picking its replacement is not, and gets its own ADR when it has an owner. See [ADR 0003](../adr/0003-authentication-and-identity.md).
- Establishing what the Render instance already received and stored, and whether it must be purged and shut down — needs an owner, not a designer
- The AMp catalogue itself (`hmcts.github.io/amp-catalog`)
- `docs/v0/`, the root `index.html`, and `prototype/`
- Acquiring the `service.gov.uk` domain, and the GDS service assessment that GOV.UK branding brings into scope
- A DPIA. Once nothing is transmitted, the rebuilt site does not process personal data, so the obligation that [L-2](../audit/2026-08-17-govuk-conformance-audit.md#l-2--critical--no-privacy-notice-and-personal-data-is-being-collected) identified falls away for it. Whether one is needed for what the live site has *already* sent is a separate question with a separate owner.

## 9. Sequencing

### Phase 1 — vertical slice (≈10% of the work)

1. Scaffold the Kit, the layout, the export script and the CI gates — mutation-tested before anything depends on them
2. Legal pages and the phase banner — the Critical findings that need no redesign to fix
3. Five representative pages, one of each kind the rest of the site is made from:
   - the homepage
   - one section landing page
   - one long content page (`producer-standards` — the most structurally demanding)
   - one complete journey with check-answers (`/publish/submit`)
   - the 404

### ▲ Approval gate

**Phase 2 does not start until the slice is reviewed and approved.**

The slice is deliberately one of each page archetype, so approving it approves the patterns that get
repeated across the remaining ~43 routes. Rejecting it costs five pages, not fifty.

It also proves the two things no mockup can: that the static export produces a working site from Kit
source, and that the CI gates actually fail when they should.

What the gate is asking about:

| Question | Evidenced by |
|---|---|
| Is the information architecture right? | the section landing page and the navigation |
| Do the GOV.UK patterns carry this content? | the long content page |
| Do the journeys work without a server? | the publish journey, with JavaScript disabled |
| Does the export pipeline hold? | `docs/v2/` rendering correctly from the manifest |
| Do the gates work? | the mutation-test results from step 1 |

### Phase 2 — breadth

4. Content pages, section by section
5. Remaining forms and journeys, with the full GDS error pattern
6. The account area — faked session, prototype data, and a prototype gate on `my-applications` that is labelled in the code as protecting nothing
7. Favicon, redirects from the current URLs
8. Full gate run, then promote `docs/v2/` to the root

### Why this order

Steps 1 and 2 are worth doing regardless of what happens to the rest: the legal exposure in
[L-1](../audit/2026-08-17-govuk-conformance-audit.md#l-1--critical--no-accessibility-statement) and
[L-2](../audit/2026-08-17-govuk-conformance-audit.md#l-2--critical--no-privacy-notice-and-personal-data-is-being-collected)
does not wait for a redesign.

Building a mockup layer ahead of the slice was considered and rejected. Adopting GOV.UK Frontend
leaves very little visual latitude to get wrong — the components are already designed, published and
tested by GDS — so a mockup of a GOV.UK page costs close to what the real page costs, while proving
less. The risk concentrates in the information architecture, the journey splits and the export
pipeline, none of which a mockup exercises. A real vertical slice tests all three.

Around 30 of the pages are near-mechanical transposition: the existing content is good and needs
GOV.UK markup around it. Design judgment concentrates in roughly eight pages — the homepage, the five
section landings and the two check-answers patterns — all of which the slice covers by archetype.

## 10. Open questions

| # | Question | Blocks |
|---|---|---|
| 1 | Where should `entra-jwt-auth.html` point? | §4, link gate |
| 2 | Is the `service.gov.uk` domain confirmed, and what is it? | ADR 0001, redirects |
| 3 | Who signs off the accessibility statement and the privacy notice? | §9 step 2 |

### Closed

**"Jump"** — the original brief described the site as "the product of AMp plus jump for technical
users". No such product or feature exists anywhere in the repository, and the product owner did not
recognise the term. Read as a transcription slip for the site acting as a jumping-off point into the
wider HMCTS API estate for technical users, which is consistent with the "new front door" framing in
the same brief. No separate place in the information architecture is required. Closed 17 August 2026.
