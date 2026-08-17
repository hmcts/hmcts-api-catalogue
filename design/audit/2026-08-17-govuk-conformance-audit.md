# GOV.UK conformance audit — HMCTS API Marketplace site

| | |
|---|---|
| **Date** | 17 August 2026 |
| **Subject** | `docs/` — the 28-page static site served at `https://hmcts.github.io/hmcts-api-marketplace/` |
| **Out of scope** | `docs/v0/`, `index.html`, `prototype/` (the superseded single-file prototype line) |
| **Standards assessed against** | GOV.UK Design System; GOV.UK Service Standard; WCAG 2.2 AA; Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018; PECR reg. 6; UK GDPR Arts. 13–14; Technology Code of Practice |
| **Verdict** | **Does not conform.** The site contains no GOV.UK Frontend code and no Design System components. Separately, three legally required pages are unpublished. |

## Method

Static analysis of all 28 pages plus `docs/assets/{styles.css,scripts.js,api-data.js}`, followed by
visual inspection of the live site in Chrome at 1512px. Contrast ratios were computed from the
palette tokens in `styles.css` using the WCAG relative-luminance formula. Every count in this
document is reproducible — see [Appendix: reproducing the counts](#appendix-reproducing-the-counts).

## 1. Inventory

28 HTML pages in `docs/`, sharing `assets/styles.css` (37 KB, bespoke), `assets/scripts.js` (6.8 KB)
and `assets/hmcts-logo-black.png` (77 KB). One page (`api-detail.html`) additionally loads
`assets/api-data.js` (8.5 KB).

Page groups:

- **Discovery** — `index`, `api-catalogue`, `api-detail`, `resources-a-z`
- **Guidance** — `getting-started`, `onboarding-guide`, `technology-introduction`, `building-software`, `glossary`, `documentation`, `consumer-guidance`
- **Standards / architecture** — `producer-standards`, `data-governance`, `architecture`, `architecture-principles`, `our-capabilities`, `our-api-technologies`, `case-studies`
- **Forms** — `contact`, `request-api`, `request-new-api`, `publish-api`
- **Account** — `sign-in`, `register`, `account`, `my-applications`
- **Community / support** — `community`, `help-and-support`

`CLAUDE.md` is stale: it describes the repository as a single self-contained HTML file duplicated
across five locations. That describes the superseded `docs/v0/` line, not the live site.

## 2. Findings

Severity: **Critical** — legal exposure or misleads users · **High** — fails a named standard on
every page · **Medium** — fails a named standard in places · **Low** — quality and maintenance.

### D — Design System conformance

#### D-1 · High · The site contains no GOV.UK Frontend

There are zero occurrences of `govuk-frontend`, any `govuk-*` class, or GDS Transport across all 28
pages and all assets. `styles.css` is an independent design system. The Service Standard (point 13,
*use and contribute to open standards, common components and patterns*) and the Design System's own
guidance both expect GOV.UK Frontend as the baseline, with new components tested and contributed
back rather than invented locally.

Components present that do not exist in the Design System, and would not be accepted as decoration:

| In `styles.css` | What it is |
|---|---|
| `.hero` | Full-bleed navy gradient with a diagonal `clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%)` |
| `.link-card.variant-ink` / `.variant-maroon` / `.variant-light` | Coloured tiles with decorative "cube pattern" background SVGs |
| `.pill-btn`, `.pill-inverse`, `.pill-filled` | Rounded pill buttons |
| `.detail-tabs` | Hand-rolled tabs (the Design System has `govuk-tabs`) |
| `.hex-icon`, `.cube-pattern`, `.accent-bar`, `.graphic.tint-*` | Decorative illustration system |

#### D-2 · High · Typographic and layout scale diverge site-wide

| Property | This site | GOV.UK Frontend |
|---|---|---|
| Body size | `1.0625rem` (17px) | 19px desktop / 16px mobile |
| Body line-height | `1.55` | 1.31 |
| Container width | `--max: 1280px` | 1100px (`govuk-width-container`) |
| Heading tracking | `letter-spacing: -0.01em` | none |
| Text colour | `--ink: #002d59` (brand navy) | `#0b0c0c` |
| Link colour | `--blue: #0096d6` | `#1d70b8` |
| Corner radius | `--radius: 0` ✓ | 0 ✓ |

`styles.css:39` sets `--font: Arial, ...`. On a non-`gov.uk` domain that is **correct** — GDS
Transport is licensed for GOV.UK domains only. See [D-3](#d-3--critical--branding-and-domain-are-inconsistent).

#### D-3 · Critical · Branding and domain are inconsistent

The site uses the HMCTS crest logo and Arial, which is the legitimate combination for
`hmcts.github.io`. The chosen target design uses the GOV.UK masthead and GDS Transport, which are
licensed only for `gov.uk` / `service.gov.uk` domains. Whichever is adopted, the branding and the
domain must agree. This is the subject of `design/adr/0001-govuk-branding-and-domain.md`.

Adopting GOV.UK branding also brings the service into scope for a GDS service assessment against the
Service Standard — not just a visual change.

### A — Accessibility (WCAG 2.2 AA)

#### A-1 · High · Contrast failures site-wide — WCAG 1.4.3

Computed against white:

| Token | Used for | Ratio | AA (4.5:1 normal text) |
|---|---|---|---|
| `--blue: #0096d6` | every link (`styles.css:54`), `.btn-primary` fill (`:138`), `.pill-filled` (`:216`), breadcrumb links (`:112`) | **3.32:1** | **Fail** |
| `--green: #11a63c` | `.btn-success` fill with `color:#fff` (`:130`) — "Add new application" | **3.21:1** | **Fail** |
| `--grey-mid: #6f777b` | secondary text | 4.56:1 | Pass (marginal) |
| `--ink: #002d59` | body and headings | 13.82:1 | Pass |

For comparison, GOV.UK `#1d70b8` is 5.17:1 and GOV.UK secondary text `#505a5f` is 7.07:1. Brand gold
`#f9ae00` is 1.89:1 against white but is only ever used for borders and as a tint behind navy text,
so it is **not** a finding.

This is the single highest-volume defect: it affects every link and every primary button on all 28
pages.

#### A-2 · High · Hints are not programmatically associated — WCAG 1.3.1

`aria-describedby` appears **zero** times across all 28 pages. Every form hint is a bare
`<span class="hint">` adjacent to its input (e.g. `contact.html:62`, `contact.html:88`). Screen
reader users get the label but not the hint.

#### A-3 · High · No `autocomplete` on identity fields — WCAG 1.3.5

`autocomplete` appears twice site-wide, both `autocomplete="off"` on token-paste fields
(`my-applications.html:262,266`). Name, email, organisation and password inputs have none —
including `register.html:95,100` and `sign-in.html:79`, which need `new-password` and
`current-password` respectively.

#### A-4 · Medium · Checkbox groups lack `fieldset`/`legend` — WCAG 1.3.1

Radio groups are correctly grouped (`register.html:82`, `request-api.html:123`). Checkbox groups are
not:

| Page | Checkboxes | Fieldsets |
|---|---|---|
| `publish-api.html` | 4 | 0 |
| `request-new-api.html` | 3 | 0 |
| `request-api.html` | 4 | 1 (used by the radios) |
| `my-applications.html` | 8 (+7 radios) | 2 |
| `sign-in.html` | 1 | 0 (single checkbox — acceptable) |

#### A-5 · Medium · Error handling does not follow the GDS error message pattern

`scripts.js:87–112` implements the whole of validation. Every form shares one hardcoded summary —
"Please fill in all required fields before submitting" (`contact.html:51`) — with:

- no per-field error messages (WCAG 3.3.1 *Error Identification* is met only weakly: an error is
  announced but not attributable to a field)
- no links from the summary into the offending fields (required by the GDS pattern)
- no focus move to the summary, no `role="alert"`, no `tabindex="-1"` — the summary is revealed by
  toggling `display:none` → `block` (`styles.css:360–361`) and the page smooth-scrolls instead
- `novalidate` with JavaScript-only checks and no server-side validation

#### A-6 · Low · `scroll-behavior: smooth` is unconditional

`styles.css:41` applies smooth scrolling with no `prefers-reduced-motion` guard. WCAG 2.3.3
*Animation from Interactions* is AAA, so this is best practice rather than an AA failure, but it is
a one-line fix and GOV.UK Frontend does not do this.

#### A-7 · Low · Hidden panels are correctly hidden

For the record: `.confirmation`, `.error-summary` and `form.hidden-after-submit` all use
`display:none` (`styles.css:360–367`), so inactive screens are properly removed from the
accessibility tree. This is not a defect.

### L — Legal

#### L-1 · Critical · No accessibility statement

"Accessibility statement" is `href="#"` in the footer of **all 28 pages**. Publishing one is a
statutory requirement under the Public Sector Bodies (Websites and Mobile Applications) (No. 2)
Accessibility Regulations 2018, per website, and it is not inherited from `www.gov.uk` — a service
on its own domain is its own website. GDS publishes a model statement to follow.

#### L-2 · Critical · No privacy notice, and personal data is being collected

"Privacy notice" is `href="#"` on all 28 pages, while `register.html` collects first name, last
name, work email, organisation, role and a password and POSTs them to a third party
([S-1](#s-1--critical--credentials-are-posted-to-a-third-party-consumer-paas)). UK GDPR Arts. 13–14
transparency obligations attach to this specific processing; HMCTS's general personal information
charter does not discharge them. A DPIA is likely required.

#### L-3 · High · No cookies page

"Cookies" is `href="#"` on all 28 pages. `scripts.js:130` fires
`fetch(..., {credentials: 'include'})` on every page load, so cookies are in play. Under PECR
reg. 6 the site must **tell** users about its cookies. A consent banner is *not* required for the
strictly necessary auth session cookie — consent is only needed for non-essential cookies, so a
banner becomes mandatory only if analytics or similar are added later.

#### L-4 · Low · Footer conflates code licence with content licence

`index.html:207` reads "© Crown copyright — MIT Licence". MIT is the repository's code licence; site
content should carry Crown copyright and the Open Government Licence, with the OGL logo, per the
GOV.UK footer pattern.

### C — Content, information architecture and Service Standard

#### C-1 · High · There is effectively no navigation

The primary navigation contains exactly one item — "Sign in" — on 25 of 28 pages (`community`,
`register` and `sign-in` have none at all). All 28 pages are reachable only through three homepage
cards and eight footer links.

Counting *distinct pages* that link to each page, excluding self-links, exposes how thin the
link graph is. Seven pages have two or fewer inbound pages:

| Page | Inbound pages |
|---|---|
| `api-detail.html` | 0 (orphan — see [H-3](#h-3--low--one-broken-link-one-orphan-page)) |
| `account.html`, `my-applications.html`, `resources-a-z.html` | 1 |
| `building-software.html`, `case-studies.html`, `community.html`, `technology-introduction.html` | 2 |

By contrast, seven pages have 27 inbound pages each — `contact`, `data-governance`, `index`,
`onboarding-guide`, `publish-api`, `request-new-api`, `sign-in` — purely because they sit in the
duplicated footer. Reachability is an artefact of the footer, not of an information architecture.
This fails Service Standard 4, *make the service simple to use*.

#### C-2 · High · Multi-step journeys are JavaScript-toggled `<div>`s, not pages

Pages containing more than one `<h1>`, i.e. more than one screen in one document:

| Page | `<h1>` count |
|---|---|
| `my-applications.html` | **9** |
| `api-detail.html`, `contact.html`, `publish-api.html`, `register.html`, `request-api.html`, `request-new-api.html`, `sign-in.html` | 2 each |

Consequences: no unique URL per step, so no bookmarking, sharing, or browser back/forward; nothing
works without JavaScript; and it contradicts the GDS "one thing per page" pattern. `my-applications`
already *is* a well-shaped five-step journey (environment → owner → name → check answers →
confirmation) — it simply has no URLs.

#### C-3 · Critical · Four forms claim to submit and submit nothing

`contact`, `publish-api`, `request-api` and `request-new-api` use `data-mock-submit`
(`scripts.js:87`). On a live public site, `contact.html:99–100` tells the user:

> Message sent — Thanks — the marketplace team will respond within 2 working days.

Nothing is sent anywhere. This is a trust defect rather than a styling one, and it is the finding I
would fix first regardless of the redesign.

#### C-4 · Medium · No beta phase banner and no feedback route

The site is a prototype with no `phase-banner` markup on any page, despite `styles.css:103–110`
defining one. Users are not told the service is in beta, and there is no site-wide feedback link.

#### C-5 · Medium · The core discovery journey leaves the site

`api-catalogue.html:54` is a signpost that opens `https://hmcts.github.io/amp-catalog/` in a new tab
(`target="_blank"`), losing the header, breadcrumbs and back navigation. The AMp catalogue living
elsewhere is a deliberate architectural decision; forcing a new tab is not, and GOV.UK content
guidance advises against it. The destination URL is hardcoded in the page.

#### C-6 · Medium · The account area is not gated

`my-applications.html` renders the full signed-in applications and teams UI to anonymous visitors —
confirmed live. `scripts.js` only ever adjusts the header link; it never gates page content.

#### C-7 · Low · Breadcrumb root is inconsistent and mislabelled

The first crumb is "HMCTS" on most pages (`index.html:38`) and "Home" on others
(`my-applications.html`), both linking to `index.html`, which is the marketplace home rather than
HMCTS.

### S — Security and data (flagged, not in redesign scope)

#### S-1 · Critical · Credentials are posted to a third-party consumer PaaS

`register.html:151` and `sign-in.html:128` both set:

```js
const API_BASE = "https://hmcts-api-marketplace-auth.onrender.com";
```

Endpoints in use: `/api/register`, `/api/login`, `/api/me`, `/api/logout`, `/api/requests`. Names,
work emails, organisations and passwords are therefore sent to a Render-hosted service on a
non-HMCTS domain — `scripts.js:152–154` notes the free tier's cold starts — with no privacy notice
anywhere on the site ([L-2](#l-2--critical--no-privacy-notice-and-personal-data-is-being-collected)).

This engages the Technology Code of Practice on security and on privacy, and HMCTS's Secure by
Design expectations.

> **Update, 17 August 2026.** The product owner has confirmed that `onrender.com` **should not have
> been used** — it was not a sanctioned architecture decision and has no assurance position behind
> it. That does not change the finding, which records what the live site does today. It raises its
> priority and changes the remediation: this is no longer a question of which identity provider to
> adopt, but of removing the dependency outright and faking the flows client-side until a sanctioned
> identity solution exists. See [ADR 0003](../adr/0003-authentication-and-identity.md).
>
> Two consequences worth keeping separate:
>
> - **Removing the client calls stops new data flowing.** A small change to four files in `docs/`,
>   which should not wait for the rebuild.
> - **It does nothing about data already sent.** Establishing what the Render instance received and
>   stored, how passwords were hashed, who could reach it, and whether it must be purged and shut
>   down needs an owner. That is not a design task.

> Secure by Design principle titles are deliberately not enumerated here: the official page blocks
> automated retrieval and the commonly circulated titles come from secondary summaries. Confirm
> against the live source internally before citing them in a governance paper.

#### S-2 · Low · Registration inputs have no `name` attributes

`register.html:63–100` inputs carry `id` but no `name`, so the form is unusable without JavaScript
and cannot degrade to a server-side POST.

### H — Code health

#### H-1 · Medium · 278 inline `style` attributes across 27 of 28 pages

Worst offenders: `community.html` (61), `my-applications.html` (57), `architecture.html` (15),
`documentation.html` (15), `api-detail.html` (13). Typical:

```html
<p class="lede" style="color:var(--grey-dark);font-size:1.1rem;max-width:70ch;margin-bottom:1.8em;">
```

#### H-2 · Medium · Header and footer are copy-pasted 28 times

Every page duplicates the top bar, header, navigation and both footer columns. This is why the three
dead legal links, the single-item navigation and the inconsistent breadcrumb root are uniform
defects — and why fixing them by hand means 28 edits.

#### H-3 · Low · One broken link, one orphan page

- `my-applications.html` links to `entra-jwt-auth.html`, which does not exist.
- `api-detail.html` has zero inbound links and is the sole consumer of `assets/api-data.js`, an 8.5 KB
  local API dataset that will drift from the real AMp catalogue feed.

#### H-4 · Low · No favicon, no 404 page

`favicon` / `rel="icon"` appears on 0 of 28 pages. There is no 404 page, so GitHub Pages serves its
own.

## 3. What the site already gets right

Worth preserving through the rebuild:

- Skip link on every page, correctly targeting `#main-content`
- `lang="en"`, `<meta name="viewport">` and a `<meta name="description">` on every page
- All decorative SVGs correctly marked `aria-hidden="true"`
- Logo has a meaningful `alt`; `--radius: 0` matches GOV.UK's square corners
- Arial rather than GDS Transport is the correct choice for the current domain
- Focus styling exists and uses `#ffdd00` — close to the GOV.UK treatment
- Site search does work: `resources-a-z.html:84–85` reads the `?q=` parameter
- Inactive panels use `display:none`, so they leave the accessibility tree
- The content itself is good — plain-English, well-structured guidance. The problem is presentation,
  structure and plumbing, not the writing.

## 4. Findings summary

| ID | Severity | Finding |
|---|---|---|
| D-3 | Critical | Branding and domain inconsistent |
| L-1 | Critical | No accessibility statement (statutory) |
| L-2 | Critical | No privacy notice while collecting personal data |
| C-3 | Critical | Four forms claim to submit and submit nothing |
| S-1 | Critical | Credentials posted to third-party consumer PaaS |
| D-1 | High | No GOV.UK Frontend anywhere |
| D-2 | High | Typographic and layout scale diverge site-wide |
| A-1 | High | Contrast failures on every link and primary button |
| A-2 | High | Hints not programmatically associated |
| A-3 | High | No `autocomplete` on identity fields |
| L-3 | High | No cookies page |
| C-1 | High | Effectively no navigation |
| C-2 | High | Journeys are JS-toggled divs, not pages |
| A-4 | Medium | Checkbox groups lack `fieldset`/`legend` |
| A-5 | Medium | Error handling off-pattern |
| C-4 | Medium | No beta phase banner or feedback route |
| C-5 | Medium | Discovery journey forced into a new tab |
| C-6 | Medium | Account area not gated |
| H-1 | Medium | 278 inline styles |
| H-2 | Medium | Header/footer duplicated 28× |
| A-6 | Low | Unconditional smooth scrolling |
| C-7 | Low | Breadcrumb root inconsistent |
| L-4 | Low | Footer conflates MIT with Crown copyright/OGL |
| S-2 | Low | Registration inputs have no `name` |
| H-3 | Low | One broken link, one orphan page |
| H-4 | Low | No favicon, no 404 page |

Totals: 5 Critical, 8 High, 7 Medium, 6 Low.

## Appendix: reproducing the counts

Run from `docs/`:

```bash
# 28 pages
ls *.html | wc -l

# D-1 — no GOV.UK Frontend anywhere
grep -ril "govuk-frontend\|GDS Transport\|govuk-" *.html assets/*   # no output

# A-1 — contrast, computed from the tokens in assets/styles.css
#        #0096d6 on #ffffff -> 3.32:1 ; #11a63c on #ffffff -> 3.21:1

# A-2 / A-3
grep -o 'aria-describedby' *.html | wc -l        # 0
grep -o 'autocomplete=' *.html | wc -l           # 2, both "off"

# A-4 — checkbox groups vs fieldsets
for f in *.html; do r=$(grep -c 'type="radio"' "$f"); c=$(grep -c 'type="checkbox"' "$f"); \
  fs=$(grep -c '<fieldset' "$f"); [ "$r" -gt 0 -o "$c" -gt 0 ] && \
  echo "$f: radios=$r checkboxes=$c fieldsets=$fs"; done

# L-1..L-3 — dead legal links on every page
grep -l 'href="#">Accessibility statement' *.html | wc -l   # 28

# C-1 — navigation contents
for f in *.html; do echo "-- $f"; awk '/<nav class="primary-nav"/,/<\/nav>/' "$f" \
  | grep -oE '>[A-Za-z][^<]*</a>'; done

# C-1 — distinct inbound pages per page, excluding self-links
for t in *.html; do n=0; for f in *.html; do [ "$f" = "$t" ] && continue; \
  grep -q "href=\"$t" "$f" && n=$((n+1)); done; echo "$n  $t"; done | sort -n

# C-2 — pages with more than one <h1>
for f in *.html; do n=$(grep -o '<h1' "$f" | wc -l); [ "$n" -gt 1 ] && echo "$f: $n"; done

# H-1 — inline styles
grep -o 'style="' *.html | wc -l                 # 278
grep -c 'style="' *.html | grep -v ':0'

# H-3 — broken links and orphans
grep -ohE 'href="[^"#:]+\.html' *.html | sed 's/href="//' | sort -u \
  | while read t; do [ -f "$t" ] || echo "MISSING: $t"; done
for f in *.html; do [ "$(grep -l "href=\"$f" *.html | wc -l)" -eq 0 ] && echo "orphan: $f"; done

# H-4
grep -l 'favicon\|rel="icon' *.html | wc -l      # 0
```
