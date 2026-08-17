// Page structure gate.
//
// Enforces the audit's findings directly, so each one becomes a regression that
// cannot recur silently. Every rule here maps to a finding in
// design/audit/2026-08-17-govuk-conformance-audit.md.

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const problems = []

// Pages with no position in the hierarchy, so no breadcrumb is expected.
const NO_BREADCRUMB = new Set(['index.html', '404.html'])

const files = []
for (const entry of await readdir(OUT, { recursive: true, withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    files.push(join(entry.parentPath ?? entry.path, entry.name))
  }
}

for (const file of files.sort()) {
  const rel = relative(OUT, file).split(sep).join('/')
  const html = await readFile(file, 'utf8')
  const count = (re) => (html.match(re) ?? []).length
  const fail = (msg) => problems.push(`${rel}: ${msg}`)

  // C-2 - journeys must be real pages, one thing per page
  const h1s = count(/<h1[\s>]/g)
  if (h1s !== 1) fail(`expected exactly 1 <h1>, found ${h1s}`)

  if (!/<title[^>]*>\s*\S[^<]*<\/title>/.test(html)) fail('missing or empty <title>')
  if (!/<html[^>]*\slang="[a-z]{2}/.test(html)) fail('missing lang attribute on <html>')
  if (!/class="govuk-skip-link"/.test(html)) fail('missing GOV.UK skip link')
  if (!/id="main-content"/.test(html)) fail('missing #main-content landmark')

  // H-1 - 278 inline styles in the current site
  const inline = count(/\sstyle="/g)
  if (inline > 0) fail(`${inline} inline style attribute(s) - use GOV.UK classes`)

  // L-1 to L-3 - the legal links were href="#" on all 28 pages
  const dead = count(/href="#"/g)
  if (dead > 0) fail(`${dead} placeholder href="#" link(s)`)

  // S-1 / ADR 0003 - no auth backend, faked client-side
  if (/onrender\.com/.test(html)) fail('references onrender.com (see ADR 0003)')

  // A-1 - the two brand colours that fail WCAG contrast
  const badColour = html.match(/#0096d6|#11a63c/i)
  if (badColour) fail(`uses ${badColour[0]}, which fails WCAG AA contrast`)

  // C-4 - the current site tells nobody it is a beta
  if (!/govuk-phase-banner/.test(html)) fail('missing beta phase banner')

  // C-7 - breadcrumb root was inconsistent across the current site
  if (!NO_BREADCRUMB.has(rel) && !/govuk-breadcrumbs/.test(html)) {
    fail('missing breadcrumbs (add to NO_BREADCRUMB if genuinely top-level)')
  }

  // In-page anchors must resolve to a real id
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) fail(`dangling in-page anchor #${m[1]}`)
  }
}

if (problems.length) {
  console.error('Structure gate FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}

console.log(`Structure gate passed - ${files.length} page(s) checked`)
