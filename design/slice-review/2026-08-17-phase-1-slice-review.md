# Phase 1 slice review — the approval gate

| | |
|---|---|
| **Date** | 17 August 2026 |
| **Branch** | `feat/phase-1-vertical-slice`, stacked on `docs/govuk-conformance-audit-and-design` |
| **Plan** | [`design/plans/2026-08-17-phase-1-vertical-slice.md`](../plans/2026-08-17-phase-1-vertical-slice.md) |
| **Design** | [`design/specs/2026-08-17-govuk-conformant-site-design.md`](../specs/2026-08-17-govuk-conformant-site-design.md) |
| **Audit** | [`design/audit/2026-08-17-govuk-conformance-audit.md`](../audit/2026-08-17-govuk-conformance-audit.md) |

**This is the gate.** Phase 2 — the remaining ~36 routes — does not start until this slice is
approved. Approving it approves the patterns that get repeated across all of them.

## What to look at

```bash
npm ci && (cd prototype-kit && npm ci)
npm run kit          # leave running
npm run export
npm run verify-gates # prove the gates fail when they should
npm run gates        # then trust them
python3 -m http.server 8160 --directory docs/v2
```

Then open `http://localhost:8160/`.

The journey worth walking is **Publish an API → Submit an API for publication**. Press Continue on the
empty form first: that is the GDS error pattern, and it is the single most-repeated fix in the rebuild.

## The twelve routes, and what each proves

| Route | Archetype it establishes |
|---|---|
| `/` | Landing page — heading, lede, start button. Replaces the gradient clip-path hero. |
| `/api-catalogue` | Off-site signpost. Catalogue URL is one config value, ready to swap. |
| `/publish` | **Section landing** — the pattern the other four sections copy in Phase 2. |
| `/publish/producer-standards` | **Long content** — six numbered sections, contents list of real anchors, GOV.UK tables, inset and warning text. The most structurally demanding page in the slice. |
| `/publish/submit` | **Question page** — full GDS error pattern, hints, fieldsets, autocomplete. |
| `/publish/submit/check-answers` | **Check answers** — summary list with change links, answers carried across a page boundary with no server. |
| `/publish/submit/confirmation` | **Confirmation** — and the honest-prototype guarantee. |
| `/help` | Support landing, carrying the real contact route. |
| `/accessibility-statement` | Statutory. Compliance claims flagged, not invented. |
| `/cookies` | Now genuinely simple: this service sets no cookies. |
| `/privacy` | Now genuinely simple: nothing you type leaves your browser. |
| `/404` | GOV.UK not-found wording, exported where GitHub Pages looks for it. |

## Verification, verbatim

```
$ npm run export
Exported 12 page(s) and 14 asset(s) to docs/v2

$ npm run verify-gates
PASS  gate:structure catches a second <h1>
PASS  gate:structure catches an inline style attribute
PASS  gate:structure catches a placeholder href="#"
PASS  gate:structure catches a brand colour that fails contrast
PASS  gate:structure catches a removed beta phase banner
PASS  gate:structure catches a dangling in-page anchor
PASS  gate:structure catches a reintroduced onrender.com reference
PASS  gate:links catches a link to a page that does not exist
PASS  gate:links catches a page left unreachable from the homepage
PASS  gate:html catches malformed markup (unclosed element)
PASS  gate:a11y catches an image with no alt text
PASS  gate:manifest catches an output file not declared in the manifest
PASS  gate:manifest catches a declared route missing from the output

All 13 mutations caught. Gates verified.

$ npm run gates
Manifest gate passed - 12 route(s) reconciled
Structure gate passed - 12 page(s) checked
Link gate passed - 30 internal link(s) checked, 12 page(s) all reachable from the homepage
Accessibility gate passed - 12 page(s), WCAG2AA via axe
```

`gate:html` prints nothing on success. The live site is untouched: `git status docs` shows changes
only under `docs/v2`.

### The journey, driven in a real browser

Gates cannot tell you whether a journey works. Driven end to end in Chrome against the exported static
site:

| Check | Result |
|---|---|
| Empty form stays on the page | ✅ `/publish/submit/` |
| Error summary visible, titled "There is a problem" | ✅ |
| Summary has `role="alert"` and receives focus | ✅ |
| Summary appears before the `<h1>` | ✅ |
| Six error links, all resolving to real field ids | ✅ |
| Six form groups marked with the error class | ✅ |
| Per-field messages beside each field | ✅ |
| Completed form advances to check-answers | ✅ |
| All six answers carried across the page boundary | ✅ |
| Radio shown by option label ("Official-Sensitive"), checkboxes joined | ✅ |
| Check-answers advances to confirmation | ✅ |
| Confirmation states nothing was submitted or stored | ✅ |
| With storage cleared, check-answers explains why answers are missing | ✅ |

## What the gate is asking you

| Question | Evidence |
|---|---|
| Is the information architecture right? | `/publish` and its service navigation. Only three of the five planned sections exist — see [open questions](#open-questions). |
| Do GOV.UK patterns carry this content? | `/publish/producer-standards`, transposed from the current site with no loss |
| Do journeys work without a server? | `/publish/submit`, three real URLs, answers in `sessionStorage` |
| Does the export pipeline hold? | 12 pages and 14 assets, all resolving through a subdirectory |
| Do the gates work? | 13 mutations, all caught |

## Audit findings this slice closes

| ID | Finding | How |
|---|---|---|
| D-1 | No GOV.UK Frontend | Built on govuk-frontend 6.4.0 throughout |
| D-2 | Typographic and layout scale diverge | GOV.UK type scale and `govuk-width-container` |
| A-1 | Contrast failures on every link and button | No brand blue or green anywhere; a gate forbids both |
| A-2 | Hints not programmatically associated | GOV.UK macros wire `aria-describedby` themselves |
| A-3 | No `autocomplete` on identity fields | Set on every applicable field |
| A-4 | Checkbox groups lack `fieldset`/`legend` | The macros enforce it |
| A-5 | Error handling off-pattern | Full GDS error pattern, verified in a browser |
| A-6 | Unconditional smooth scrolling | Not carried over |
| L-1 | No accessibility statement | Published, with claims flagged for sign-off |
| L-2 | No privacy notice | Published — and the position is now "nothing is transmitted" |
| L-3 | No cookies page | Published — no cookies to consent to |
| L-4 | Footer conflates MIT with Crown copyright | GOV.UK footer emits OGL and Crown copyright itself |
| C-2 | Journeys are JS-toggled divs | Three real URLs with back links; one `<h1>` per page, gated |
| C-3 | Forms claim to submit and submit nothing | Confirmation says so, unmissably. A gate could not catch this; a human decision did |
| C-4 | No beta phase banner | On every page, gated |
| C-7 | Breadcrumb root inconsistent | One `Home` root from the shared layout, gated |
| H-1 | 278 inline styles | Zero, gated |
| H-2 | Header and footer duplicated 28× | One layout file |
| H-4 | No favicon, no 404 page | Favicons from govuk-frontend; 404 exported to `docs/v2/404.html` |

Still open for Phase 2: **C-1** (full navigation — two sections not yet built), **C-5** (catalogue
signpost is conformant but the destination is still off-site by design), **C-6** and **S-2** (account
area), **H-3** (the broken `entra-jwt-auth.html` link and orphan `api-detail.html` live in the old
site, deleted at promotion).

**S-1** is unchanged and deliberately so: the live site still transmits credentials to
`onrender.com` until `docs/v2` is promoted. That deferral is recorded as an accepted risk in
[ADR 0003](../adr/0003-authentication-and-identity.md).

## Things found by building that the plan got wrong

Everything here is recorded in the plan's deviations section. The four worth your attention:

1. **govuk-frontend is 6.4.0, not 5.11.0.** The Kit's generated prototype pins the latest itself; the
   5.11.0 in `npm ls` is the Kit library's internal dependency and is not what renders. My earlier
   claim was backwards.
2. **The link gate passed while checking nothing.** Its first version skipped external hosts with
   `^https?://`, but linkinator serves the local path over its own HTTP server, so every internal link
   matched and was skipped — "0 internal links checked", exit 0, with seven known-broken links on the
   page. Only the mutation harness caught it.
3. **Four of my own pages were orphans.** After adding the journey, `producer-standards`, `submit`,
   `check-answers` and `confirmation` formed a closed island nothing reachable linked into — the
   audit's own H-3 finding, reproduced by me. The link gate now checks reachability from the homepage
   and treats a form's `data-next` as a real edge, so journeys do not need an exemption.
4. **A real routing bug in the journey.** `check-answers` sits in its own directory, so its
   `data-next="confirmation/"` would have resolved to `check-answers/confirmation/` at runtime. The
   reachability check found it before any user could.

Also: the error summary sits above the `<h1>` per the GOV.UK pattern, which puts it *outside* the
form — so `form.querySelector` never found it. Per-field messages appeared and the summary silently
did not. Found by driving the journey in a browser, not by any gate.

## Open questions

| # | Question | Blocks |
|---|---|---|
| 1 | **Is the five-section IA right?** Only `/api-catalogue`, `/publish` and `/help` exist. `Get started` and `Documentation` are planned but unbuilt — this is the cheapest moment to change the grouping. | Phase 2 |
| 2 | Where should the broken `entra-jwt-auth.html` link point? | Phase 2 link gate |
| 3 | Is the `service.gov.uk` domain confirmed, and what is it? | ADR 0001, redirects |
| 4 | Who signs off the accessibility statement and the privacy notice? | Publication |
| 5 | Is `Node 24` acceptable, given the Kit does not support 26? | CI |

## Recommendation

Approve the patterns and let Phase 2 proceed on them, or tell me what to change while it is still five
pages rather than fifty. Question 1 is the one I would most like an answer to before building the
remaining sections.
