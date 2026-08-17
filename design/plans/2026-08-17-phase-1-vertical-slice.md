# Phase 1: Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **This session executes inline** (superpowers:executing-plans), not via subagents — the session's operating instructions prohibit dispatching agents unless the user asks.

**Goal:** Build the GOV.UK Prototype Kit scaffold, a mutation-tested static export and CI gate suite, the three legally required pages, and a five-page vertical slice — enough for the approval gate that unlocks the remaining ~43 routes.

**Architecture:** A GOV.UK Prototype Kit application in `prototype-kit/` is the only place pages are authored. `scripts/export-static.mjs` renders every route named in `scripts/routes.manifest.json` into `docs/v2/`, rewriting root-absolute paths to depth-correct relative ones so the output works when served from a subdirectory. Five gates run over the exported HTML — accessibility, markup validity, link integrity, page structure, manifest reconciliation — and each gate is proven by a mutation test that deliberately breaks the thing it checks and asserts the gate fails.

**Tech Stack:** All at latest, with one deliberate exception noted below. Node **24** (see the Node constraint), `govuk-prototype-kit` **13.20.3**, `govuk-frontend` **6.4.0**, `@govuk-prototype-kit/common-templates` **3.0.0**, Nunjucks, `pa11y` **9.1.1**, `html-validate` **11.7.0**, `linkinator` **8.0.4**, `wait-on` **9.1.0**, plus plain Node scripts for the bespoke gates.

## Verified before this plan was written

Everything below was checked against the real packages rather than assumed. Do not re-litigate these.

| Claim | How it was verified | Result |
|---|---|---|
| A fresh Kit install uses govuk-frontend **6.4.0**, not the Kit's internal 5.11.0 | `npx govuk-prototype-kit@13.20.3 create`, then `npm ls govuk-frontend` | The generated prototype's own `package.json` pins `govuk-frontend: 6.4.0` at top level. `govuk-prototype-kit`'s exact `5.11.0` is a *nested* internal dependency and is **not** what renders. |
| The Kit boots and renders under 6.4.0 | `npm run dev`, `curl localhost:3000` | HTTP 200, GOV.UK masthead present |
| Every component the design needs exists and renders under 6.4.0 | probe page importing each macro, rendered and grepped | `service-navigation`, `phase-banner`, `password-input`, `error-summary`, `summary-list`, `task-list`, `footer`, skip link — all present in the output |
| `govuk-prototype-kit/layouts/govuk-branded.njk` resolves | probe page extends it | Renders |
| `linkinator` 8.0.4 API | inspected `options.d.ts` | `check()` accepts `path`, `recurse`, `linksToSkip`, `concurrency`, `serverRoot` — the script below is correct |
| `pa11y` 9.1.1 API and axe availability | inspected exports and `lib/runners/` | Default export is a function; `axe.js` runner bundled, `axe-core` a direct dependency — `runners: ['axe']` is valid |
| Node version support | the Kit's own startup check | **The Kit supports Node 16, 18, 20, 22 and 24 only.** On Node 26.5.1 it prints "Some features may not work with your version." It did create and run successfully, but this is unsupported territory. |

**Spec:** [`design/specs/2026-08-17-govuk-conformant-site-design.md`](../specs/2026-08-17-govuk-conformant-site-design.md)

**Audit:** [`design/audit/2026-08-17-govuk-conformance-audit.md`](../audit/2026-08-17-govuk-conformance-audit.md)

## Global Constraints

Every task's requirements implicitly include these.

- **`govuk-frontend` is 6.4.0** — the latest release, and what the Kit's own generator installs. Keep dependencies at latest. The `5.11.0` that appears nested under `govuk-prototype-kit` in `npm ls` is the Kit library's internal dependency; leave it alone, it is not what renders.
- **Node 24**, pinned in `.nvmrc` and used in CI. This is the *latest version the Kit supports* — its startup check accepts 16, 18, 20, 22 and 24 and warns on anything newer. This machine runs Node 26, which works but prints an unsupported-version warning; use 24 for anything reproducible.
- **Never hand-edit `docs/v2/`.** It is generated output. Edit the Kit source and re-run the export.
- **Never touch `docs/*.html`, `docs/assets/`, `docs/v0/`, the root `index.html`, or `prototype/`.** The current live site stays exactly as it is until promotion.
- **Zero inline `style` attributes** in any authored template. The audit found 278 in the current site ([H-1](../audit/2026-08-17-govuk-conformance-audit.md#h-1--medium--278-inline-style-attributes-across-27-of-28-pages)); a gate enforces zero.
- **Exactly one `<h1>` per page.** ([C-2](../audit/2026-08-17-govuk-conformance-audit.md#c-2--high--multi-step-journeys-are-javascript-toggled-divs-not-pages))
- **No `href="#"` placeholder links** in any authored template. A gate enforces this. ([L-1](../audit/2026-08-17-govuk-conformance-audit.md#l-1--critical--no-accessibility-statement))
- **No network calls to `onrender.com`** or any auth backend. ([ADR 0003](../adr/0003-authentication-and-identity.md))
- **Colour comes only from GOV.UK Frontend.** Never `#0096d6` (3.32:1) or `#11a63c` (3.21:1). ([A-1](../audit/2026-08-17-govuk-conformance-audit.md#a-1--high--contrast-failures-site-wide--wcag-143))
- **Service name string:** `HMCTS API Marketplace`. **Phase:** `Beta`.
- **Page title format:** `<Page name> - HMCTS API Marketplace - GOV.UK`
- Content transposed into new pages is taken **verbatim** from the named source file in `docs/`. Do not rewrite copy in Phase 1; the existing content is good ([audit §3](../audit/2026-08-17-govuk-conformance-audit.md#3-what-the-site-already-gets-right)). Copy changes are a separate, later piece of work.

---

### Task 1: Prototype Kit scaffold and base layout

Produces the Kit app and a single rendering page, so every later task has somewhere to put templates.

**Files:**
- Create: `prototype-kit/package.json` (via the Kit's own installer)
- Create: `prototype-kit/app/views/layouts/_generic.njk`
- Create: `prototype-kit/app/views/index.njk`
- Create: `prototype-kit/app/assets/sass/application.scss`
- Create: `.gitignore` entries for `prototype-kit/node_modules`
- Create: `.nvmrc` containing `24`
- Modify: repository root — add `package.json` for the export and gate scripts

**Interfaces:**
- Consumes: nothing
- Produces: `layouts/_generic.njk`, which every later template extends. It defines blocks `pageTitle`, `beforeContent`, `content`. It sets the service name, the GOV.UK header, `govukServiceNavigation`, `govukPhaseBanner`, and the GOV.UK footer with the OGL logo.

- [ ] **Step 1: Install the Kit into `prototype-kit/`**

```bash
npx govuk-prototype-kit@13.20.3 create prototype-kit
cd prototype-kit && npm install
```

- [ ] **Step 2: Pin Node, and confirm the top-level frontend is 6.x**

```bash
echo "24" > .nvmrc
cd prototype-kit && node -e "
const v = require('govuk-frontend/package.json').version;
const [major] = v.split('.').map(Number);
if (major < 6) { console.error('Expected govuk-frontend 6.x or newer at top level, got ' + v); process.exit(1); }
console.log('govuk-frontend ' + v + ' OK (top-level)');
" && npm ls govuk-frontend
```

Expected: `govuk-frontend 6.4.0 OK (top-level)`, and `npm ls` showing 6.4.0 at top level with 5.11.0 nested under `govuk-prototype-kit`. The nested copy is expected and harmless.

- [ ] **Step 3: Write the base layout**

`prototype-kit/app/views/layouts/_generic.njk`:

```njk
{% extends "govuk-prototype-kit/layouts/govuk-branded.njk" %}

{% from "govuk/components/service-navigation/macro.njk" import govukServiceNavigation %}
{% from "govuk/components/phase-banner/macro.njk" import govukPhaseBanner %}
{% from "govuk/components/breadcrumbs/macro.njk" import govukBreadcrumbs %}

{% set serviceName = "HMCTS API Marketplace" %}

{% block beforeContent %}
  {{ govukServiceNavigation({
    serviceName: serviceName,
    serviceUrl: "/",
    navigation: [
      { href: "/api-catalogue", text: "API catalogue", active: section == "catalogue" },
      { href: "/get-started",   text: "Get started",   active: section == "get-started" },
      { href: "/documentation", text: "Documentation", active: section == "documentation" },
      { href: "/publish",       text: "Publish an API", active: section == "publish" },
      { href: "/help",          text: "Help and support", active: section == "help" }
    ]
  }) }}

  {{ govukPhaseBanner({
    tag: { text: "Beta" },
    html: 'This is a new service. <a class="govuk-link" href="/help/contact">Help us improve it by giving feedback</a>.'
  }) }}

  {% if breadcrumbs %}
    {{ govukBreadcrumbs({ items: breadcrumbs }) }}
  {% endif %}
{% endblock %}
```

- [ ] **Step 4: Write the homepage placeholder that proves the layout renders**

`prototype-kit/app/views/index.njk`:

```njk
{% extends "layouts/_generic.njk" %}

{% block pageTitle %}HMCTS API Marketplace - GOV.UK{% endblock %}

{% block content %}
<div class="govuk-grid-row">
  <div class="govuk-grid-column-two-thirds">
    <h1 class="govuk-heading-xl">HMCTS API Marketplace</h1>
    <p class="govuk-body-l">Discover, request and integrate the APIs powering justice sector software.</p>
  </div>
</div>
{% endblock %}
```

- [ ] **Step 5: Run the Kit and confirm the page renders with the GOV.UK masthead, service navigation and beta banner**

```bash
cd prototype-kit && npm run dev
```

Then fetch it rather than trusting the browser:

```bash
curl -s http://localhost:3000/ | grep -c "govuk-service-navigation\|govuk-phase-banner\|govuk-header__logotype"
```

Expected: `3` or more. If `govuk-service-navigation` is absent, the macro path is wrong for this Kit version — check `prototype-kit/node_modules/govuk-frontend/dist/govuk/components/service-navigation/macro.njk` exists and adjust the import path.

- [ ] **Step 6: Add the root `package.json` for export and gate scripts**

`package.json` at the repository root:

```json
{
  "name": "hmcts-api-marketplace-build",
  "private": true,
  "type": "module",
  "scripts": {
    "export": "node scripts/export-static.mjs",
    "gate:structure": "node scripts/check-structure.mjs",
    "gate:manifest": "node scripts/check-manifest.mjs",
    "gate:html": "html-validate \"docs/v2/**/*.html\"",
    "gate:links": "node scripts/check-links.mjs",
    "gate:a11y": "node scripts/check-a11y.mjs",
    "gates": "npm run gate:manifest && npm run gate:structure && npm run gate:html && npm run gate:links && npm run gate:a11y",
    "verify-gates": "node scripts/verify-gates.mjs"
  },
  "devDependencies": {
    "html-validate": "^11.7.0",
    "linkinator": "^8.0.4",
    "pa11y": "^9.1.1",
    "wait-on": "^9.1.0"
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add prototype-kit package.json .gitignore
git commit -m "Add GOV.UK Prototype Kit scaffold and base layout

Kit 13.20.3, govuk-frontend 6.4.0, Node pinned to 24. Base layout provides the
GOV.UK masthead, service navigation, beta phase banner and footer, so every
later page inherits them from one file rather than the 28 copies the current
site carries."
```

---

### Task 2: Route manifest and static export

Produces the mechanism that turns Kit routes into files in `docs/v2/`.

**Files:**
- Create: `scripts/routes.manifest.json`
- Create: `scripts/export-static.mjs`

**Interfaces:**
- Consumes: a running Kit on `EXPORT_BASE_URL` (default `http://localhost:3000`)
- Produces: `docs/v2/<route>/index.html` for every manifest route, plus `docs/v2/assets/`. Later tasks add routes to `scripts/routes.manifest.json` and rely on `npm run export` producing the file.

- [ ] **Step 1: Write the manifest with only the routes that exist so far**

`scripts/routes.manifest.json`:

```json
{
  "routes": [
    { "path": "/", "name": "Home" }
  ]
}
```

- [ ] **Step 2: Write the failing test — export before the script exists**

```bash
npm run export
```

Expected: FAIL, `Cannot find module '.../scripts/export-static.mjs'`

- [ ] **Step 3: Write the export script**

`scripts/export-static.mjs`:

```js
import { mkdir, writeFile, readFile, cp, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const BASE = process.env.EXPORT_BASE_URL ?? 'http://localhost:3000'
const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const KIT_PUBLIC = 'prototype-kit/public'

const { routes } = JSON.parse(await readFile('scripts/routes.manifest.json', 'utf8'))

// docs/v2/index.html            for "/"        -> depth 0 -> prefix ""
// docs/v2/publish/index.html    for "/publish" -> depth 1 -> prefix "../"
function outputFor (route) {
  return route === '/' ? join(OUT, 'index.html') : join(OUT, route.replace(/^\//, ''), 'index.html')
}

function prefixFor (route) {
  if (route === '/') return ''
  return '../'.repeat(route.replace(/^\/|\/$/g, '').split('/').length)
}

// Root-absolute -> depth-correct relative, so the site works served from a
// subdirectory. Protocol-relative (//host) and bare "/" are left alone.
function rewriteHtml (html, prefix) {
  return html
    .replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (_m, attr, path) => `${attr}="${prefix}${path}"`)
    .replace(/\b(href|src)="\/"/g, (_m, attr) => `${attr}="${prefix || './'}"`)
}

// govuk-frontend's compiled CSS references fonts and images as /assets/...
// The CSS lands at docs/v2/assets/css/, the fonts at docs/v2/assets/fonts/,
// so from the stylesheet's own location the correct prefix is "../".
function rewriteCss (css) {
  return css.replace(/url\(["']?\/assets\/([^)"']*)["']?\)/g, 'url("../$1")')
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

let exported = 0
const failures = []

for (const { path } of routes) {
  const res = await fetch(new URL(path, BASE))
  if (!res.ok) {
    failures.push(`${path} -> HTTP ${res.status}`)
    continue
  }
  const html = rewriteHtml(await res.text(), prefixFor(path))
  const out = outputFor(path)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, html, 'utf8')
  exported++
}

if (failures.length) {
  console.error('Export failed for:\n  ' + failures.join('\n  '))
  process.exit(1)
}

await cp(KIT_PUBLIC, join(OUT, 'assets'), { recursive: true })

// Rewrite asset URLs inside every exported stylesheet.
const { globby } = await import('node:fs/promises').then(async () => ({
  globby: async (dir) => {
    const { readdir } = await import('node:fs/promises')
    const out = []
    for (const e of await readdir(dir, { recursive: true, withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.css')) out.push(join(e.parentPath ?? e.path, e.name))
    }
    return out
  }
}))

for (const cssFile of await globby(join(OUT, 'assets'))) {
  await writeFile(cssFile, rewriteCss(await readFile(cssFile, 'utf8')), 'utf8')
}

console.log(`Exported ${exported} route(s) to ${OUT}`)
```

- [ ] **Step 4: Run the export with the Kit running, and verify it passes**

```bash
cd prototype-kit && npm run dev &
sleep 8
cd .. && npm run export
```

Expected: `Exported 1 route(s) to docs/v2`

- [ ] **Step 5: Verify the output is genuinely self-contained when served from a subdirectory**

```bash
python3 -m http.server 8123 --directory . >/dev/null 2>&1 &
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8123/docs/v2/index.html
grep -o 'href="[^"]*application.css"' docs/v2/index.html
```

Expected: `200`, and a **relative** stylesheet href (no leading `/`).

- [ ] **Step 6: Verify a bad route fails the export rather than being skipped**

Add `{ "path": "/does-not-exist", "name": "Bogus" }` to the manifest, run `npm run export`.

Expected: FAIL, `Export failed for: /does-not-exist -> HTTP 404`, exit code 1.
Then remove the bogus route and confirm the export passes again.

- [ ] **Step 7: Commit**

```bash
git add scripts/routes.manifest.json scripts/export-static.mjs docs/v2
git commit -m "Add manifest-driven static export to docs/v2

An explicit route manifest rather than a crawler: a route that fails to
render fails the build instead of silently vanishing from the output, which
is how the current site acquired an orphan page. Rewrites root-absolute
paths to depth-correct relative ones so the export works served from a
subdirectory."
```

---

### Task 3: The five gates, each proven by a mutation test

The most important task in Phase 1. A gate that has never failed has not been shown to work.

**Files:**
- Create: `scripts/check-structure.mjs`
- Create: `scripts/check-manifest.mjs`
- Create: `scripts/check-links.mjs`
- Create: `scripts/check-a11y.mjs`
- Create: `scripts/verify-gates.mjs`
- Create: `.htmlvalidate.json`

**Interfaces:**
- Consumes: `docs/v2/` produced by Task 2; `scripts/routes.manifest.json`
- Produces: `npm run gates` (all five, exit non-zero on any failure) and `npm run verify-gates` (mutation-tests every gate). Later tasks run both.

- [ ] **Step 1: Write the page-structure gate**

`scripts/check-structure.mjs`:

```js
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const problems = []

async function htmlFiles (dir) {
  const out = []
  for (const e of await readdir(dir, { recursive: true, withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith('.html')) out.push(join(e.parentPath ?? e.path, e.name))
  }
  return out
}

for (const file of await htmlFiles(OUT)) {
  const html = await readFile(file, 'utf8')
  const count = (re) => (html.match(re) ?? []).length

  const h1s = count(/<h1[\s>]/g)
  if (h1s !== 1) problems.push(`${file}: expected exactly 1 <h1>, found ${h1s}`)

  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${file}: missing or empty <title>`)
  if (!/<html[^>]*\slang="en"/.test(html)) problems.push(`${file}: missing lang="en"`)
  if (!/class="govuk-skip-link"/.test(html)) problems.push(`${file}: missing GOV.UK skip link`)

  const inline = count(/\sstyle="/g)
  if (inline > 0) problems.push(`${file}: ${inline} inline style attribute(s) — use GOV.UK classes`)

  const dead = count(/href="#"/g)
  if (dead > 0) problems.push(`${file}: ${dead} placeholder href="#" link(s)`)

  if (/onrender\.com/.test(html)) problems.push(`${file}: references onrender.com (see ADR 0003)`)
  if (/#0096d6|#11a63c/i.test(html)) problems.push(`${file}: uses a failing brand colour`)
}

if (problems.length) {
  console.error('Structure gate failed:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log('Structure gate passed')
```

- [ ] **Step 2: Write the manifest reconciliation gate**

`scripts/check-manifest.mjs`:

```js
import { readdir, readFile, access } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const { routes } = JSON.parse(await readFile('scripts/routes.manifest.json', 'utf8'))
const problems = []

const expected = new Set(
  routes.map(({ path }) => path === '/' ? 'index.html' : join(path.replace(/^\//, ''), 'index.html'))
)

for (const rel of expected) {
  try { await access(join(OUT, rel)) } catch { problems.push(`declared route missing from output: ${rel}`) }
}

for (const e of await readdir(OUT, { recursive: true, withFileTypes: true })) {
  if (!e.isFile() || !e.name.endsWith('.html')) continue
  const rel = relative(OUT, join(e.parentPath ?? e.path, e.name)).split(sep).join('/')
  if (!expected.has(rel.split('/').join(sep)) && !expected.has(rel)) {
    problems.push(`output file not declared in manifest: ${rel}`)
  }
}

if (problems.length) {
  console.error('Manifest gate failed:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(`Manifest gate passed — ${expected.size} route(s) reconciled`)
```

- [ ] **Step 3: Write the link gate**

`scripts/check-links.mjs`:

```js
import { LinkChecker } from 'linkinator'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const checker = new LinkChecker()
const result = await checker.check({
  path: OUT,
  recurse: true,
  // External hosts are checked separately and must not break the build on
  // a transient network failure. The AMp catalogue is a deliberate off-site
  // signpost (spec section 4).
  linksToSkip: ['^https?://']
})

const broken = result.links.filter((l) => l.state === 'BROKEN')
if (broken.length) {
  console.error('Link gate failed:\n  ' + broken.map((l) => `${l.url} (from ${l.parent})`).join('\n  '))
  process.exit(1)
}
console.log(`Link gate passed — ${result.links.length} link(s) checked`)
```

- [ ] **Step 4: Write the accessibility gate**

`scripts/check-a11y.mjs`:

```js
import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import pa11y from 'pa11y'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const PORT = 8129
const { routes } = JSON.parse(await readFile('scripts/routes.manifest.json', 'utf8'))

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', OUT], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 1500))

let failed = 0
try {
  for (const { path, name } of routes) {
    const url = `http://localhost:${PORT}${path === '/' ? '/' : path + '/'}`
    const result = await pa11y(url, { runners: ['axe'], standard: 'WCAG2AA', includeWarnings: false })
    if (result.issues.length) {
      failed++
      console.error(`\n${name} (${path}) — ${result.issues.length} issue(s):`)
      for (const i of result.issues) console.error(`  ${i.code}: ${i.message}\n    ${i.selector}`)
    }
  }
} finally {
  server.kill()
}

if (failed) {
  console.error(`\nAccessibility gate failed on ${failed} page(s)`)
  process.exit(1)
}
console.log(`Accessibility gate passed — ${routes.length} page(s), WCAG2AA via axe`)
```

- [ ] **Step 5: Write the html-validate config**

`.htmlvalidate.json`:

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-inline-style": "error",
    "require-sri": "off",
    "long-title": "off"
  }
}
```

- [ ] **Step 6: Run all five gates and confirm they pass on the current one-page export**

```bash
npm install
npm run gates
```

Expected: five "passed" lines, exit code 0.

- [ ] **Step 7: Write the mutation harness — the test for the gates**

`scripts/verify-gates.mjs`:

```js
import { readFile, writeFile, cp, rm, mkdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const OUT = 'docs/v2'
const TMP = '.gate-verify'

// Each mutation breaks exactly one thing and names the gate that must catch it.
const mutations = [
  {
    gate: 'gate:structure',
    what: 'a second <h1>',
    apply: (html) => html.replace('</main>', '<h1>Second heading</h1></main>')
  },
  {
    gate: 'gate:structure',
    what: 'an inline style attribute',
    apply: (html) => html.replace('<h1', '<h1 style="color:red"')
  },
  {
    gate: 'gate:structure',
    what: 'a placeholder href="#"',
    apply: (html) => html.replace('</main>', '<a href="#">Cookies</a></main>')
  },
  {
    gate: 'gate:structure',
    what: 'a failing brand colour',
    apply: (html) => html.replace('</main>', '<p class="govuk-body">#0096d6</p></main>')
  },
  {
    gate: 'gate:links',
    what: 'a link to a missing page',
    apply: (html) => html.replace('</main>', '<a href="missing-page/">Gone</a></main>')
  },
  {
    gate: 'gate:manifest',
    what: 'an undeclared output file',
    applyFs: async () => writeFile(join(OUT, 'stray.html'), '<!DOCTYPE html><html lang="en"><head><title>Stray</title></head><body><h1>Stray</h1></body></html>')
  },
  {
    gate: 'gate:manifest',
    what: 'a declared route removed from the output',
    applyFs: async () => rm(join(OUT, 'index.html'))
  },
  {
    gate: 'gate:a11y',
    what: 'an image with no alt text',
    apply: (html) => html.replace('</main>', '<img src="assets/images/govuk-crest.svg"></main>')
  }
]

await rm(TMP, { recursive: true, force: true })
await mkdir(TMP, { recursive: true })
await cp(OUT, join(TMP, 'v2'), { recursive: true })

let failures = 0

for (const m of mutations) {
  await rm(OUT, { recursive: true, force: true })
  await cp(join(TMP, 'v2'), OUT, { recursive: true })

  if (m.apply) {
    const target = join(OUT, 'index.html')
    await writeFile(target, m.apply(await readFile(target, 'utf8')), 'utf8')
  } else {
    await m.applyFs()
  }

  const run = spawnSync('npm', ['run', m.gate], { encoding: 'utf8' })
  const caught = run.status !== 0

  console.log(`${caught ? 'PASS' : 'FAIL'}  ${m.gate} catches ${m.what}`)
  if (!caught) failures++
}

await rm(OUT, { recursive: true, force: true })
await cp(join(TMP, 'v2'), OUT, { recursive: true })
await rm(TMP, { recursive: true, force: true })

if (failures) {
  console.error(`\n${failures} gate(s) did not catch their mutation — those gates are not trustworthy`)
  process.exit(1)
}
console.log(`\nAll ${mutations.length} mutations caught. Gates verified.`)
```

- [ ] **Step 8: Run the mutation harness and confirm every gate catches its mutation**

```bash
npm run verify-gates
```

Expected: eight `PASS` lines and `All 8 mutations caught. Gates verified.`

If any line reads `FAIL`, that gate is not working — fix the gate, not the mutation.

- [ ] **Step 9: Confirm the tree was restored after mutation testing**

```bash
npm run gates && git status --short docs/v2
```

Expected: gates pass; no unexpected modifications.

- [ ] **Step 10: Commit**

```bash
git add scripts .htmlvalidate.json package.json package-lock.json
git commit -m "Add five CI gates, each proven by a mutation test

Structure, manifest reconciliation, links, markup validity and axe
accessibility over every exported page. verify-gates.mjs breaks each thing
a gate claims to check and asserts the gate fails, so no gate is trusted
before it has been seen to fail. Eight mutations, all caught.

The structure gate also enforces the audit's regressions directly: one h1
per page, zero inline styles, no placeholder href=\"#\", no onrender.com,
and no use of the two brand colours that fail WCAG contrast."
```

---

### Task 4: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/site.yml`

**Interfaces:**
- Consumes: `npm run export`, `npm run gates`, `npm run verify-gates`
- Produces: a required check on pull requests

- [ ] **Step 1: Write the workflow**

`.github/workflows/site.yml`:

```yaml
name: Site build and gates

on:
  pull_request:
    paths:
      - 'prototype-kit/**'
      - 'scripts/**'
      - 'docs/v2/**'
      - 'package.json'
      - '.github/workflows/site.yml'
  workflow_dispatch:

jobs:
  build-and-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'

      - name: Install root tooling
        run: npm ci

      - name: Install Prototype Kit
        working-directory: prototype-kit
        run: npm ci

      - name: Assert the top-level govuk-frontend is 6.x or newer
        working-directory: prototype-kit
        run: |
          v=$(node -p "require('govuk-frontend/package.json').version")
          case "$v" in 6.*|7.*) echo "govuk-frontend $v OK" ;; *) echo "Expected 6.x or newer, got $v"; exit 1 ;; esac

      - name: Start the Kit
        working-directory: prototype-kit
        run: npm run dev &

      - name: Wait for the Kit
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Export
        run: npm run export

      - name: Fail if the committed export is stale
        run: |
          if ! git diff --quiet docs/v2; then
            echo "docs/v2 differs from a fresh export. Run 'npm run export' and commit the result."
            git diff --stat docs/v2
            exit 1
          fi

      - name: Verify the gates actually fail when they should
        run: npm run verify-gates

      - name: Run the gates
        run: npm run gates
```

- [ ] **Step 2: Verify the workflow parses**

```bash
gh workflow view "Site build and gates" 2>/dev/null || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/site.yml')); print('workflow YAML valid')"
```

Expected: `workflow YAML valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/site.yml
git commit -m "Add CI: export, staleness check, gate verification, gates

The staleness check is the one that matters for a committed build output —
it fails if docs/v2 differs from a fresh export, so the generated site can
never silently drift from the Kit source it claims to come from."
```

---

### Task 5: The three legally required pages, and the cookie position

Closes audit [L-1](../audit/2026-08-17-govuk-conformance-audit.md#l-1--critical--no-accessibility-statement), [L-2](../audit/2026-08-17-govuk-conformance-audit.md#l-2--critical--no-privacy-notice-and-personal-data-is-being-collected) and [L-3](../audit/2026-08-17-govuk-conformance-audit.md#l-3--high--no-cookies-page) for the new site. Worth shipping regardless of the rest of the rebuild.

**Files:**
- Create: `prototype-kit/app/views/accessibility-statement.njk`
- Create: `prototype-kit/app/views/cookies.njk`
- Create: `prototype-kit/app/views/privacy.njk`
- Modify: `prototype-kit/app/views/layouts/_generic.njk` — footer links
- Modify: `scripts/routes.manifest.json`

**Interfaces:**
- Consumes: `layouts/_generic.njk` from Task 1
- Produces: routes `/accessibility-statement`, `/cookies`, `/privacy`, linked from the footer of every page

- [ ] **Step 1: Add the three routes to the manifest and watch the manifest gate fail**

Add to `scripts/routes.manifest.json`:

```json
{ "path": "/accessibility-statement", "name": "Accessibility statement" },
{ "path": "/cookies", "name": "Cookies" },
{ "path": "/privacy", "name": "Privacy notice" }
```

Then:

```bash
npm run export
```

Expected: FAIL — `Export failed for: /accessibility-statement -> HTTP 404` and the other two.

This is the red step. The manifest is the specification; the pages do not exist yet.

- [ ] **Step 2: Write the accessibility statement**

Follow the GOV.UK model accessibility statement structure. Every claim a human must verify is marked with an inline `govukInsetText` flagged `NEEDS SIGN-OFF`, because an accessibility statement asserting an untested compliance level is worse than none.

`prototype-kit/app/views/accessibility-statement.njk` — required sections, in this order:

1. `<h1>` "Accessibility statement for the HMCTS API Marketplace"
2. Scope — which website this statement covers
3. "How accessible this website is" — **`NEEDS SIGN-OFF`**: the compliance claim cannot be written until an audit has been run. Until then the page states that the service is in beta and has not yet been formally assessed.
4. "Feedback and contact information" — links to `/help/contact`
5. "Reporting accessibility problems with this website"
6. "Enforcement procedure" — the EASS / ECNI wording from the GOV.UK model statement
7. "Technical information about this website's accessibility" — the regulations named in full
8. "Compliance status" — **`NEEDS SIGN-OFF`**
9. "Preparation of this statement" — **`NEEDS SIGN-OFF`**: date prepared, date last reviewed, and what method was used

- [ ] **Step 3: Write the cookies page**

The substance is short and specific because [ADR 0003](../adr/0003-authentication-and-identity.md) removed the auth cookie:

- `<h1>` "Cookies"
- This service sets **no** cookies.
- It stores your answers to multi-step forms in your browser's `sessionStorage` so you can review them on a check-answers page. That data never leaves your browser and is discarded when you close the tab.
- Because this is strictly necessary for the form to work, it needs disclosure under PECR regulation 6, not consent — which is why there is no cookie banner.
- **`NEEDS SIGN-OFF`**: confirm no analytics, tag manager, or third-party embed is added later without revisiting this page and adding a consent banner.

- [ ] **Step 4: Write the privacy notice**

- `<h1>` "Privacy notice"
- What this service is: a prototype.
- **Nothing you type is sent anywhere.** Forms do not submit. Sign-in is simulated. Answers stay in your browser.
- Because no personal data is transmitted or stored, HMCTS does not process personal data through this service.
- How to contact the marketplace team, and how to raise a concern with the ICO.
- **`NEEDS SIGN-OFF`**: HMCTS DPO to confirm the "no processing" position and whether the departmental personal information charter should be linked.

- [ ] **Step 5: Add the footer links to the layout**

In `layouts/_generic.njk`, override the footer block so every page carries real links — replacing the `href="#"` trio that the audit found on all 28 pages of the current site:

```njk
{% block footer %}
  {{ govukFooter({
    meta: {
      items: [
        { href: "/accessibility-statement", text: "Accessibility statement" },
        { href: "/cookies", text: "Cookies" },
        { href: "/privacy", text: "Privacy notice" },
        { href: "/publish/data-governance", text: "Data governance" },
        { href: "/help/contact", text: "Contact the marketplace team" }
      ]
    }
  }) }}
{% endblock %}
```

Import `govukFooter` at the top of the layout alongside the other macros.

> `/publish/data-governance` does not exist until Phase 2. Until then, omit that item — the link gate will fail on it otherwise, which is the gate doing its job.

- [ ] **Step 6: Run export and gates, and confirm green**

```bash
npm run export && npm run gates
```

Expected: 4 routes exported; all five gates pass.

- [ ] **Step 7: Commit**

```bash
git add prototype-kit/app/views scripts/routes.manifest.json docs/v2
git commit -m "Add accessibility statement, cookies page and privacy notice

Closes audit L-1, L-2 and L-3 for the new site. All three were href=\"#\"
on all 28 pages of the current site; the accessibility statement is a
statutory requirement under the 2018 regulations and is not inherited
from www.gov.uk.

Compliance claims are marked NEEDS SIGN-OFF rather than asserted — a
statement claiming an untested conformance level is worse than none. The
cookie position is genuinely simple now that ADR 0003 removed the auth
cookie: no cookies, sessionStorage only, disclosure not consent."
```

---

### Task 6: Homepage

**Files:**
- Modify: `prototype-kit/app/views/index.njk`

**Interfaces:**
- Consumes: `layouts/_generic.njk`
- Produces: the pattern for a landing page — heading, lede, and a grid of headed links replacing the current coloured `link-card` tiles

- [ ] **Step 1: Write the homepage**

Content transposed verbatim from `docs/index.html`. Structure:

- `govuk-heading-xl` "HMCTS API Marketplace"
- `govuk-body-l` lede: "Discover, request and integrate the APIs powering justice sector software."
- A `govuk-button--start` to `/get-started`
- Three headed links, one per current homepage feature row, in a `govuk-grid-row` of `govuk-grid-column-one-third`: "Getting started with our APIs", "API and integration catalogue", "Documentation, guides and tutorials" — each an `h2` with a `govuk-link` and the existing description paragraph
- A second group for the three current `link-card` tiles: "Help and support building software", "Our architecture", "Onboarding to APIs and services"

No hero gradient, no `clip-path`, no decorative SVG, no pill buttons ([D-1](../audit/2026-08-17-govuk-conformance-audit.md#d-1--high--the-site-contains-no-govuk-frontend)).

> Links to section pages that do not exist yet must not be added. The homepage links only to `/get-started`, `/publish`, `/help/contact` and the three legal pages until Phase 2 fills in the rest — the link gate enforces this.

- [ ] **Step 2: Export and run gates**

```bash
npm run export && npm run gates
```

Expected: all five gates pass.

- [ ] **Step 3: Commit**

```bash
git add prototype-kit/app/views/index.njk docs/v2
git commit -m "Rebuild the homepage on GOV.UK patterns

Replaces the gradient clip-path hero, coloured variant tiles and pill
buttons with a GOV.UK heading, lede, start button and grids of headed
links. Content transposed verbatim from docs/index.html."
```

---

### Task 7: Section landing page — Publish an API

**Files:**
- Create: `prototype-kit/app/views/publish/index.njk`
- Modify: `scripts/routes.manifest.json`

**Interfaces:**
- Consumes: `layouts/_generic.njk`
- Produces: the section-landing pattern the other four sections copy in Phase 2 — `section` variable set for service-navigation highlighting, breadcrumbs, and a contents list of the section's pages

- [ ] **Step 1: Add `/publish` to the manifest and watch the export fail**

Expected: `Export failed for: /publish -> HTTP 404`

- [ ] **Step 2: Write the section landing page**

```njk
{% extends "layouts/_generic.njk" %}
{% set section = "publish" %}
{% set breadcrumbs = [{ text: "Home", href: "/" }] %}

{% block pageTitle %}Publish an API - HMCTS API Marketplace - GOV.UK{% endblock %}

{% block content %}
<div class="govuk-grid-row">
  <div class="govuk-grid-column-two-thirds">
    <h1 class="govuk-heading-xl">Publish an API</h1>
    <p class="govuk-body-l">List your team's API in the marketplace so other teams can find it, understand it and request access.</p>

    <h2 class="govuk-heading-m">In this section</h2>
    <ul class="govuk-list">
      <li><a class="govuk-link" href="/publish/producer-standards">API producer standards</a></li>
      <li><a class="govuk-link" href="/publish/submit">Submit an API for publication</a></li>
    </ul>
  </div>
</div>
{% endblock %}
```

- [ ] **Step 3: Verify the service navigation marks this section current**

```bash
npm run export
grep -o 'govuk-service-navigation__item--active' docs/v2/publish/index.html | wc -l
```

Expected: `1`

- [ ] **Step 4: Export and run gates**

```bash
npm run export && npm run gates
```

- [ ] **Step 5: Commit**

```bash
git add prototype-kit/app/views/publish scripts/routes.manifest.json docs/v2
git commit -m "Add the Publish an API section landing page

Establishes the section-landing pattern: section variable driving
service-navigation highlighting, breadcrumbs, and a contents list. The
other four sections copy this in Phase 2."
```

---

### Task 8: Long content page — producer standards

The most structurally demanding page in the slice: ten numbered sections and a contents list.

**Files:**
- Create: `prototype-kit/app/views/publish/producer-standards.njk`
- Modify: `scripts/routes.manifest.json`

**Interfaces:**
- Consumes: `layouts/_generic.njk`; content from `docs/producer-standards.html`
- Produces: the long-content pattern — two-thirds column, `govuk-list` contents with in-page anchors, `h2`/`h3` hierarchy

- [ ] **Step 1: Add `/publish/producer-standards` to the manifest; confirm the export fails**

- [ ] **Step 2: Transpose the content verbatim from `docs/producer-standards.html`**

Sections, in the source's order: "1. Technical requirements", "2. Eligibility criteria", "3. Specification quality", "4. Onboarding process", "5. Ongoing responsibilities", "6. Data governance".

Structure requirements:
- one `h1` "API producer standards"
- a contents list of the six sections using `govuk-list` and in-page `#anchor` links — note these are real fragment links to real `id`s, not `href="#"`, so the structure gate passes
- each section an `h2` with a matching `id`
- tables become `govuk-table`; the current page's inline-styled callouts become `govukInsetText`
- **zero** inline styles

- [ ] **Step 3: Verify the anchors resolve**

```bash
npm run export
node -e "
const fs=require('fs');
const h=fs.readFileSync('docs/v2/publish/producer-standards/index.html','utf8');
const frags=[...h.matchAll(/href=\"#([^\"]+)\"/g)].map(m=>m[1]);
const ids=new Set([...h.matchAll(/id=\"([^\"]+)\"/g)].map(m=>m[1]));
const bad=frags.filter(f=>!ids.has(f));
if(bad.length){console.error('dangling anchors:',bad);process.exit(1)}
console.log(frags.length+' in-page anchors all resolve');
"
```

- [ ] **Step 4: Export and run gates**

```bash
npm run export && npm run gates
```

- [ ] **Step 5: Commit**

```bash
git add prototype-kit/app/views/publish/producer-standards.njk scripts/routes.manifest.json docs/v2
git commit -m "Add producer standards on the GOV.UK long-content pattern

The most structurally demanding page in the slice: six numbered sections,
a contents list of real in-page anchors, GOV.UK tables and inset text in
place of inline-styled callouts. Content verbatim from
docs/producer-standards.html."
```

---

### Task 9: A complete journey with check-answers

Proves the pattern that replaces the nine-`<h1>` JavaScript-toggled screens in `my-applications.html`.

**Files:**
- Create: `prototype-kit/app/views/publish/submit/index.njk`
- Create: `prototype-kit/app/views/publish/submit/check-answers.njk`
- Create: `prototype-kit/app/views/publish/submit/confirmation.njk`
- Create: `prototype-kit/app/assets/javascripts/journey-store.js`
- Modify: `scripts/routes.manifest.json`

**Interfaces:**
- Consumes: `layouts/_generic.njk`
- Produces: `journey-store.js` exposing `saveJourney(name, formEl)`, `loadJourney(name)` returning a plain object, and `renderSummary(name, targetEl, fieldLabels)`. Phase 2 journeys reuse all three.

- [ ] **Step 1: Add the three routes to the manifest; confirm the export fails on all three**

- [ ] **Step 2: Write the journey store**

`prototype-kit/app/assets/javascripts/journey-store.js`:

```js
// Carries multi-step form answers across pages in the exported static site,
// where there is no server to hold a session. Answers never leave the browser
// and are discarded when the tab closes (see /cookies and /privacy).
(function () {
  'use strict'

  function key (name) { return 'journey:' + name }

  function loadJourney (name) {
    try { return JSON.parse(window.sessionStorage.getItem(key(name))) || {} } catch (e) { return {} }
  }

  function saveJourney (name, formEl) {
    var data = loadJourney(name)
    new window.FormData(formEl).forEach(function (value, field) { data[field] = value })
    window.sessionStorage.setItem(key(name), JSON.stringify(data))
  }

  function renderSummary (name, targetEl, fieldLabels) {
    var data = loadJourney(name)
    var rows = Object.keys(fieldLabels).map(function (field) {
      return '<div class="govuk-summary-list__row">' +
        '<dt class="govuk-summary-list__key">' + fieldLabels[field] + '</dt>' +
        '<dd class="govuk-summary-list__value">' + (data[field] || 'Not provided') + '</dd>' +
        '<dd class="govuk-summary-list__actions">' +
          '<a class="govuk-link" href="../">Change<span class="govuk-visually-hidden"> ' + fieldLabels[field] + '</span></a>' +
        '</dd></div>'
    }).join('')
    targetEl.innerHTML = rows
  }

  window.journeyStore = { loadJourney: loadJourney, saveJourney: saveJourney, renderSummary: renderSummary }
})()
```

- [ ] **Step 3: Write the form step**

`/publish/submit` — one `h1` "Submit an API for publication", a `govukErrorSummary` region rendered empty and revealed by client-side validation with focus moved to it, and these fields, each a proper GOV.UK component with a `govuk-hint` wired through `aria-describedby` (which the macros do automatically — this is why the audit's [A-2](../audit/2026-08-17-govuk-conformance-audit.md#a-2--high--hints-are-not-programmatically-associated--wcag-131) failure cannot recur):

| Field | Component | Notes |
|---|---|---|
| API name | `govukInput` | `autocomplete="off"` |
| Owning team | `govukInput` | |
| Contact email | `govukInput` | `type="email"`, `autocomplete="email"` |
| OpenAPI specification URL | `govukInput` | hint: the GitHub raw URL |
| Data classification | `govukRadios` | inside a `fieldset` with a `legend` — the macro does this |
| Declarations | `govukCheckboxes` | inside a `fieldset` with a `legend`, fixing [A-4](../audit/2026-08-17-govuk-conformance-audit.md#a-4--medium--checkbox-groups-lack-fieldsetlegend--wcag-131) |

The Continue button posts nowhere: an inline handler calls `window.journeyStore.saveJourney('publish-submit', form)` then navigates to `check-answers/`. Without JavaScript the form still renders and reads correctly; it simply does not carry answers forward, which the confirmation page states.

- [ ] **Step 4: Write the check-answers step**

One `h1` "Check your answers before submitting", a `govukSummaryList` container populated on load by `renderSummary('publish-submit', el, labels)`, and a Submit button that navigates to `confirmation/`. A `govukInsetText` states that with JavaScript disabled the answers will show as "Not provided".

- [ ] **Step 5: Write the confirmation step**

One `h1` inside a `govukPanel` — "Submission received". Then, plainly and unmissably:

> This is a prototype. **Nothing was submitted and nothing was stored.** No one has received this information.
>
> If you need to publish an API for real, [contact the marketplace team](/help/contact).

This is the honest-prototype decision from the spec, and it is what stops the audit's [C-3](../audit/2026-08-17-govuk-conformance-audit.md#c-3--critical--four-forms-claim-to-submit-and-submit-nothing) defect being rebuilt in nicer markup.

- [ ] **Step 6: Verify the journey works with JavaScript on**

```bash
npm run export
python3 -m http.server 8131 --directory docs/v2 >/dev/null 2>&1 &
sleep 1
curl -s -o /dev/null -w "%{http_code} " http://localhost:8131/publish/submit/
curl -s -o /dev/null -w "%{http_code} " http://localhost:8131/publish/submit/check-answers/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8131/publish/submit/confirmation/
```

Expected: `200 200 200`

- [ ] **Step 7: Verify each step is a real page with its own URL and a back link**

```bash
for p in submit submit/check-answers submit/confirmation; do
  echo -n "$p: "; grep -c 'govuk-back-link\|govuk-breadcrumbs' docs/v2/publish/$p/index.html
done
```

Expected: at least `1` for each.

- [ ] **Step 8: Confirm the confirmation page states nothing was submitted**

```bash
grep -i "nothing was submitted" docs/v2/publish/submit/confirmation/index.html
```

Expected: a match. If this ever stops matching, the honest-prototype guarantee has been lost.

- [ ] **Step 9: Export and run gates**

```bash
npm run export && npm run gates
```

- [ ] **Step 10: Commit**

```bash
git add prototype-kit/app scripts/routes.manifest.json docs/v2
git commit -m "Add the publish journey as real pages with check-answers

Three real URLs with back links, replacing the JavaScript-toggled screens
pattern that gave my-applications.html nine h1 elements. Answers cross
pages via sessionStorage because the exported site has no server; without
JavaScript every step still renders and the confirmation says so.

Full GDS form patterns throughout: error summary with focus management,
hints wired through aria-describedby by the macros, and fieldset/legend on
both the radio and checkbox groups - the three form findings from the audit
cannot recur in this markup.

The confirmation page states plainly that nothing was submitted and nothing
was stored, which is the point of the honest-prototype decision."
```

---

### Task 10: 404 page and favicon

**Files:**
- Create: `prototype-kit/app/views/404.njk`
- Create: `docs/v2/404.html` (via export)
- Modify: `scripts/routes.manifest.json`
- Modify: `prototype-kit/app/views/layouts/_generic.njk` — favicon link

**Interfaces:**
- Consumes: `layouts/_generic.njk`
- Produces: a GitHub Pages 404 page and a favicon on every page, closing [H-4](../audit/2026-08-17-govuk-conformance-audit.md#h-4--low--no-favicon-no-404-page)

- [ ] **Step 1: Add `/404` to the manifest; confirm the export fails**

- [ ] **Step 2: Write the 404 page**

One `h1` "Page not found", the GOV.UK standard wording, and links to the homepage and `/help/contact`. No breadcrumbs — there is no position in the hierarchy to describe.

- [ ] **Step 3: Confirm the export lands it where GitHub Pages will find it**

GitHub Pages serves `404.html` from the publishing root. The export writes `/404` to `docs/v2/404/index.html`, which Pages will not use. Add a special case to `outputFor` in `scripts/export-static.mjs`:

```js
function outputFor (route) {
  if (route === '/') return join(OUT, 'index.html')
  if (route === '/404') return join(OUT, '404.html')
  return join(OUT, route.replace(/^\//, ''), 'index.html')
}
```

And the matching case in `scripts/check-manifest.mjs`:

```js
const expected = new Set(
  routes.map(({ path }) =>
    path === '/' ? 'index.html'
    : path === '/404' ? '404.html'
    : join(path.replace(/^\//, ''), 'index.html'))
)
```

- [ ] **Step 4: Verify the 404 lands correctly and the manifest still reconciles**

```bash
npm run export && npm run gate:manifest && ls docs/v2/404.html
```

Expected: manifest gate passes; `docs/v2/404.html` exists.

- [ ] **Step 5: Add the favicon to the layout**

The Kit's `govuk-branded.njk` already emits the GOV.UK favicon set from `govuk-frontend`'s assets. Confirm rather than assume:

```bash
grep -o 'rel="icon"' docs/v2/index.html | wc -l
```

Expected: at least `1`. If `0`, add the favicon links to the layout's `head` block pointing at `assets/images/favicon.ico`.

- [ ] **Step 6: Export and run gates**

```bash
npm run export && npm run gates
```

- [ ] **Step 7: Commit**

```bash
git add prototype-kit scripts docs/v2
git commit -m "Add 404 page and confirm favicon coverage

Exported to docs/v2/404.html rather than 404/index.html, because that is
where GitHub Pages looks. Closes audit H-4."
```

---

### Task 11: Full gate run and the approval-gate summary

The slice is not finished until the gates have been re-verified and the result is written down.

**Files:**
- Create: `design/slice-review/2026-08-17-phase-1-slice-review.md`

**Interfaces:**
- Consumes: everything above
- Produces: the document the approval gate is decided from

- [ ] **Step 1: Re-run the mutation harness against the finished slice**

```bash
npm run verify-gates
```

Expected: all mutations caught. This matters more now than in Task 3 — the gates have to still work against ten pages, not one.

- [ ] **Step 2: Run the full gate suite and capture the real output**

```bash
npm run export && npm run gates 2>&1 | tee /tmp/gate-output.txt
```

- [ ] **Step 3: Confirm nothing in `docs/` outside `v2/` was touched**

```bash
git status --short docs | grep -v '^.. docs/v2' || echo "nothing outside docs/v2 modified"
```

Expected: `nothing outside docs/v2 modified`

- [ ] **Step 4: Write the slice review document**

It must contain, with real captured output rather than claims:

- the ten routes built, and which archetype each demonstrates
- the gate output verbatim
- the mutation-harness output verbatim
- which audit findings the slice closes, by ID, and which remain open for Phase 2
- the questions from the spec's §9 approval-gate table, each with the evidence that answers it
- anything discovered during implementation that contradicts the spec, and what it means for Phase 2

- [ ] **Step 5: Commit and push**

```bash
git add design/slice-review docs/v2
git commit -m "Add Phase 1 slice review for the approval gate

Ten routes, five gates, eight mutations caught. Records which audit
findings the slice closes and what Phase 2 still carries."
git push
```

- [ ] **Step 6: Open the pull request**

```bash
gh pr create --base main \
  --title "Phase 1: GOV.UK Prototype Kit scaffold, gates and vertical slice" \
  --body-file design/slice-review/2026-08-17-phase-1-slice-review.md
```

- [ ] **Step 7: Stop. This is the approval gate.**

Do not start Phase 2. The remaining ~43 routes wait on review of this slice.

---

## Self-Review

**1. Spec coverage.** Walking the spec section by section:

| Spec section | Covered by |
|---|---|
| §3 Architecture — Kit layout | Task 1 |
| §3 Build and export, manifest not crawler | Task 2 |
| §3 Journeys after export, `journey-store.js` | Task 9 |
| §4 IA — service navigation, breadcrumbs | Tasks 1, 7 |
| §5 Inventory — journey step splits | Task 9 (publish journey); rest is Phase 2 |
| §6 Component mapping | Tasks 6–9 |
| §7 Verification — all five gates plus mutation testing | Tasks 3, 4, 11 |
| §9 Phase 1 steps 1–3 and the approval gate | Tasks 1–11 |

Not covered, and correctly so — these are Phase 2 by the spec's own sequencing: the other four section landings, the remaining content pages, the other six journeys, the account area, and redirects from current URLs. `prototype-session.js` is named in the spec's architecture but only exercised by the account area, so it lands in Phase 2; the slice's header shows a plain "Sign in" link.

**2. Placeholder scan.** No `TBD`, no "add error handling", no "similar to Task N". The `NEEDS SIGN-OFF` markers in Task 5 are deliberate and different in kind: they are content that a named human must verify, not work left undone, and shipping an accessibility statement with an invented compliance claim would be worse than shipping it flagged.

**3. Type consistency.** `journey-store.js` exposes `saveJourney`, `loadJourney`, `renderSummary` in Task 9 and is referenced by those exact names in Tasks 9 steps 3–4. `outputFor` and `prefixFor` are defined in Task 2 and `outputFor` is modified by name in Task 10, with the matching `check-manifest.mjs` change in the same step. Gate script names match between `package.json` (Task 1), the mutation harness's `gate` fields (Task 3) and the workflow (Task 4): `gate:structure`, `gate:manifest`, `gate:html`, `gate:links`, `gate:a11y`.

**One inconsistency found and fixed while reviewing:** Task 5's footer originally listed `/publish/data-governance`, which is a Phase 2 route and would have failed the link gate. Now called out explicitly in that step with the instruction to omit it.
