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

Each maps to findings in `design/audit/2026-08-17-govuk-conformance-audit.md`, so
the audit's defects become regressions that cannot recur silently.

### html-validate rule decisions

Four rules from `html-validate:recommended` are relaxed, because they fight
GOV.UK Frontend's intended output rather than catching real defects:

- **`prefer-native-element`** — narrowed with `exclude: ["button"]`, not switched
  off. GOV.UK's start button is deliberately `<a role="button">` because it
  navigates. The rule stays active for everything else, so `<div role="button">`
  in our own markup would still fail.
- **`void-style`** — off. The Kit emits `<link … />` while govuk-frontend macros
  omit the slash. The mixture is upstream and purely stylistic.
- **`no-trailing-whitespace`** — off. A Nunjucks rendering artefact in generated
  output, with no user impact.
- **`require-sri`** — off. All assets are same-origin and self-hosted.

### Chrome for the accessibility gate

`.puppeteerrc.cjs` skips the bundled Chromium download. `check-a11y.mjs` resolves
a real browser from `CHROME_PATH`, then well-known macOS and Linux locations. Set
`CHROME_PATH` if yours is elsewhere.

## Gate the gates

`verify-gates.mjs` breaks each thing a gate claims to check and asserts the gate
fails. Run it before trusting a green result. A gate that has never failed has
not been shown to work — which is not hypothetical here: the link gate's first
implementation reported "0 internal links checked" and passed, because its
skip-external pattern also matched linkinator's own local server. It was
checking nothing.
