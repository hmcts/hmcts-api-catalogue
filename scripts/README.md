# Build and gate scripts

`docs/v2/` is **generated output**. Never hand-edit it — edit the Kit source in
`prototype-kit/` and re-run the export.

## Usage

```bash
npm run kit           # start the Prototype Kit on port 3100 (leave running)
npm run export        # render every manifest route into docs/v2/
npm run gates         # all five gates
npm run verify-gates  # mutation-test the gates themselves
```

`npm run kit` pins `PORT=3100` deliberately: the Kit prompts interactively when
its port is busy and dies on closed stdin, which hangs automation.

## The manifest is the specification

`routes.manifest.json` is the single source of truth for which pages exist. Add
a route there *before* creating its template — the export will fail on the
missing route, which is the red step. An explicit manifest rather than a crawler
means a page that fails to render fails the build instead of silently vanishing.

The export also reports any link pointing at a page not in the manifest, so
missing pages surface as a warning before the link gate turns them into an error.

## The gates

| Script | Enforces |
|---|---|
| `check-manifest.mjs` | declared routes == exported files, both directions |
| `check-structure.mjs` | one `<h1>`, title, `lang`, skip link, `#main-content`, phase banner, breadcrumbs, resolvable in-page anchors, and the audit's regressions: zero inline styles, no `href="#"`, no `onrender.com`, no failing brand colours |
| `check-links.mjs` | zero broken internal links |
| `html-validate` | markup validity |
| `check-a11y.mjs` | axe, WCAG 2.1 AA, on **every** exported page |
| `check-reflow.mjs` | WCAG 1.4.10 Reflow - every page must fit a 320px viewport without sideways scrolling |
| `check-translations.mjs` | locale key parity, plus a translation coverage report |

Each maps to findings in `design/audit/2026-08-17-govuk-conformance-audit.md`, so
the audit's defects become regressions that cannot recur silently.

### html-validate rule decisions

Four rules from `html-validate:recommended` are relaxed, because they fight
GOV.UK Frontend's intended output rather than catching real defects:

- **`prefer-native-element`** — narrowed with `exclude: ["button", "region"]`, not
  switched off. Both exclusions are govuk-frontend's own markup, which we cannot
  change: the start button is deliberately `<a role="button">` because it
  navigates, and the notification banner applies `role="region"` on purpose to
  make itself a landmark. Our own wide-table wrappers use a native `<section>`
  rather than `role="region"`, and the rule still catches anything else.
- **`void-style`** — off. The Kit emits `<link … />` while govuk-frontend macros
  omit the slash. The mixture is upstream and purely stylistic.
- **`no-trailing-whitespace`** — off. A Nunjucks rendering artefact in generated
  output, with no user impact.
- **`require-sri`** — off. All assets are same-origin and self-hosted.

### Chrome for the accessibility gate

`.puppeteerrc.cjs` skips the bundled Chromium download. `check-a11y.mjs` resolves
a real browser from `CHROME_PATH`, then well-known macOS and Linux locations. Set
`CHROME_PATH` if yours is elsewhere.

## Redirects

`redirects.json` maps every URL the current live site publishes to its home in v2.
GitHub Pages has no server-side redirects, so the export generates a real page at
each old path with `rel=canonical`, a `meta refresh`, and a visible link for
anyone the refresh does not move. Without these, all 27 existing URLs 404 the
moment `docs/v2` is promoted.

Two kinds, and the distinction matters:

- **`moved`** — the destination is the same content in its new home.
- **`superseded`** — there is no direct equivalent yet, so the stub points at the
  nearest useful page and *says the content no longer exists in its old form*,
  rather than implying it simply moved. A gate enforces that wording, because
  quietly redirecting `sign-in.html` to a help page as though nothing changed
  would be misleading.

The manifest gate also fails if any `docs/*.html` has no redirect at all, so a
URL cannot be dropped by omission.

Stubs are excluded from the reachability check (an old bookmark is the entry
point) and from the page-furniture rules — a redirect with breadcrumbs and a
phase banner would be absurd. They are checked for canonical, refresh, a visible
link, one `<h1>`, `noindex`, and honest wording instead.

They are not axe-tested: a zero-second `meta refresh` navigates before axe can
run. WCAG technique H76 treats an immediate refresh as the accepted approach
where server redirects are unavailable, which is the case on GitHub Pages.

## Why there is a separate reflow gate

axe inspects the accessibility tree. Reflow is a layout property that only appears
when the window is actually narrow, so axe cannot see it and the accessibility
gate does not cover it. `check-reflow.mjs` drives a real Chrome at 320px and fails
if the document scrolls horizontally, naming the element that sticks out.

It found two genuine defects on its first two runs: the data governance
classification table (486px of content in a 288px column) and a long email
address with no break opportunities. Both were invisible to every other gate and
to desktop-width eyeballing.

Wide content is fixed by wrapping it in `.app-table-wrapper` - a `<section>` with
`overflow-x: auto`, an `aria-label` and `tabindex="0"`, so it scrolls instead of
the page and keyboard users can reach it. The gate deliberately ignores anything
inside such a container, because that is the correct fix rather than a defect.

## Bilingual

English is at `/`, Welsh at `/cy/`. HMCTS runs courts and tribunals in England
**and Wales**, so Welsh is a duty rather than a feature.

One set of templates serves both. `scripts/routes.mjs` expands the manifest's
routes across `locales`, so the export and all seven gates work from a single
list and a locale cannot be published but ungated.

- **Strings** live in `prototype-kit/app/locales/<locale>.json`. Templates call
  `t("key")`. A Welsh string set to `null` falls back to English.
- **`null` means "not yet translated"**, and is the expected state. The gate does
  not fail on it - a gate that fails on the normal condition just gets switched
  off. It fails on **key drift** instead, which is the thing that actually rots:
  a string added to English that translators never see, or dead Welsh left behind
  when English changes.
- **Nothing here invents Welsh copy.** Machine-translated Welsh on a government
  service is worse than none. The words must come from the HMCTS Welsh Language
  Unit or a professional translator. Current coverage: **2/45 (4%)** — the two
  are the language-toggle labels, which are the same in both languages.
- **Links** are hardcoded in English in the templates and rewritten to `/cy/...`
  by `app/routes.js`, so a new page is bilingual without its author doing
  anything. The language toggle carries `rel="alternate"`, which is what stops
  the rewriter turning the escape hatch back into the language it is leaving.
- **Welsh pages carry a notification banner** saying translation is in progress.
  Removing that banner is the signal translation is finished.
- **The 404 has no language toggle.** GitHub Pages serves exactly one error
  document from the publishing root, so `/cy/404` could never be reached, and a
  "Cymraeg" link leading nowhere is worse than none.

### Reachability is per locale

The link gate checks that every page is reachable from its **own** language's
homepage, and deliberately does not count the language toggle as a link. A
mutation test caught why: with the toggle counted, a page orphaned in English
stayed "reachable" via its Welsh counterpart's toggle, so each language has to
stand up on its own.

Welsh text runs roughly 15-20% longer than English, so the reflow gate is doing
real work here once translation lands.

## Gate the gates

`verify-gates.mjs` breaks each thing a gate claims to check and asserts the gate
fails. Run it before trusting a green result. A gate that has never failed has
not been shown to work — which is not hypothetical here: the link gate's first
implementation reported "0 internal links checked" and passed, because its
skip-external pattern also matched linkinator's own local server. It was
checking nothing.
