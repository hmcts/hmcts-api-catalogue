// Link integrity gate, in two parts.
//
// 1. No broken internal links. Every exported page is an entry point, not just
//    whatever is reachable from the homepage - otherwise an unreachable page's
//    broken links go unchecked.
//
// 2. No unreachable pages. Every route must be reachable by following links
//    from the homepage. This is audit finding H-3 as a gate: the current site
//    carries an orphan page (api-detail.html, zero inbound links) precisely
//    because nothing ever checked.
//
// Note on linksToSkip: linkinator serves the local path over its own HTTP
// server, so internal links arrive as http://localhost:<port>/... A naive
// '^https?://' pattern therefore skips *everything* and the gate passes while
// checking nothing. Skip by host instead.

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep, posix } from 'node:path'
import { LinkChecker } from 'linkinator'
import { loadManifest } from './routes.mjs'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

// Reachable by URL, never by link: the 404 page, and every redirect stub - the
// whole point of a stub is that an old external link or bookmark lands on it.
//
// The API catalogue detail page is reachable too, just not by a static <a>
// this crawler can see. Its links are built by client-side JS once the live
// amp-catalog feed loads (see design/adr/0005-in-repo-api-catalogue.md) - one
// shared route for every API, deliberately, rather than a manifest entry per
// live API that would go stale the moment the feed changes.
const { redirects } = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))
// /account is the same shape again: the service navigation's "Sign in" link
// only becomes an "/account" link via client-side JS, once a token is present
// (see app/assets/javascripts/auth.js) - there is no static <a href="/account">
// anywhere for a signed-out crawler to find.
const ALLOW_UNREACHABLE = new Set([
  '404.html',
  ...redirects.map((r) => r.from),
  'api-catalogue/detail/index.html',
  'cy/api-catalogue/detail/index.html',
  'account/index.html',
  'cy/account/index.html'
])

// --- part 1: broken links --------------------------------------------------
//
// recurse: false is deliberate. With recursion on, linkinator was given all
// ~92 pages as entry points AND followed every link it found from each of
// them - 92 overlapping crawl frontiers converging on shared URLs (every
// page links towards its own homepage, for one). linkinator's own source
// notes it shares one in-flight completion promise across pages that
// reference the same URL, to avoid re-checking duplicates. In CI (never
// locally, on byte-identical exported HTML, across a clean npm ci, a from-
// scratch Kit restart, real Node 20+, and linkinator's own CLI run directly)
// that produced a `parent` on the returned LinkResult that did not match the
// page actually containing the link: a route removed from the whole export
// (get-started/request-api/) reported as broken and blamed on
// account/index.html, which has no such link - confirmed by dumping the raw
// LinkResults from the failing CI run itself. Recursion was never load-
// bearing: every page is already an explicit entry point via the glob below,
// and part 2 independently verifies the link *graph* is fully connected.
// With recursion off, each entry is checked only for its own declared links
// - no cross-page frontier for linkinator to share promises across, so a
// link's parent can only ever be the page linkinator was told to check.
const checker = new LinkChecker()
const result = await checker.check({
  path: '**/*.html',
  serverRoot: OUT,
  recurse: false,
  linksToSkip: async (link) => {
    try {
      return !LOCAL_HOSTS.has(new URL(link).hostname)
    } catch {
      return false
    }
  }
})

const broken = result.links.filter((link) => link.state === 'BROKEN')
const checked = result.links.filter((link) => link.state !== 'SKIPPED').length

if (broken.length) {
  const lines = broken.map((link) => `${link.url}  <- ${link.parent ?? 'unknown'}`)
  console.error(`Link gate FAILED - ${broken.length} broken link(s):\n  ` + lines.join('\n  '))
  process.exit(1)
}

// --- part 2: reachability --------------------------------------------------

const pages = []
for (const entry of await readdir(OUT, { recursive: true, withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    const abs = join(entry.parentPath ?? entry.path, entry.name)
    pages.push(relative(OUT, abs).split(sep).join('/'))
  }
}

// Resolve an href found in `fromPage` to the page file it targets, or null if
// it is external, an anchor, or an asset.
function resolveTarget (fromPage, href) {
  if (/^(https?:)?\/\//.test(href) || href.startsWith('#') || href.startsWith('mailto:')) return null

  const [pathPart] = href.split(/[?#]/)
  if (!pathPart) return null

  const resolved = posix.normalize(posix.join(posix.dirname(fromPage), pathPart))
  if (resolved.startsWith('..')) return null

  if (resolved.endsWith('/') || resolved === '' || resolved === '.') {
    return posix.join(resolved === '.' ? '' : resolved, 'index.html')
  }
  if (resolved.endsWith('.html')) return resolved
  return null
}

// Edges come from two places. Plain links are href. Journey steps advance by
// form submission, where the next step is declared in data-next - so that is a
// real edge too, and treating it as one keeps the reachability check meaningful
// for multi-step journeys instead of forcing them onto an exemption list.
//
// The language toggle is deliberately NOT an edge. It is the one link that
// crosses locales, and counting it would let a page orphaned in English stay
// "reachable" via its Welsh counterpart's toggle - which is exactly what a
// mutation test caught. Reachability is checked per locale instead, from that
// locale's own homepage, so each language has to stand up on its own.
const EDGE_ATTRIBUTES = /\b(?:href|data-next)="([^"]+)"/g
const ANCHOR_TAG = /<a\b[^>]*>/g

function edgesFrom (page, html) {
  const targets = new Set()

  // Anchors, skipping the cross-locale toggle.
  for (const tag of html.matchAll(ANCHOR_TAG)) {
    if (/rel="alternate"/.test(tag[0])) continue
    const href = tag[0].match(/\bhref="([^"]+)"/)
    if (!href) continue
    const target = resolveTarget(page, href[1])
    if (target && target !== page) targets.add(target)
  }

  // data-next lives on forms, not anchors.
  for (const match of html.matchAll(/\bdata-next="([^"]+)"/g)) {
    const target = resolveTarget(page, match[1])
    if (target && target !== page) targets.add(target)
  }

  return targets
}

const graph = new Map()
for (const page of pages) {
  graph.set(page, edgesFrom(page, await readFile(join(OUT, page), 'utf8')))
}

const manifest = await loadManifest()
const locales = manifest.locales ?? ['en']
const roots = locales.map((locale) => (locale === 'en' ? 'index.html' : `${locale}/index.html`))

const orphansByLocale = []

for (const [index, root] of roots.entries()) {
  const locale = locales[index]
  const prefix = locale === 'en' ? '' : `${locale}/`

  const reached = new Set([root])
  const queue = [root]
  while (queue.length) {
    for (const next of graph.get(queue.shift()) ?? []) {
      if (!reached.has(next)) {
        reached.add(next)
        queue.push(next)
      }
    }
  }

  // Only judge pages belonging to this locale.
  const localePages = pages.filter((page) => {
    if (ALLOW_UNREACHABLE.has(page)) return false
    const pageLocale = locales.find((l) => l !== 'en' && page.startsWith(`${l}/`)) ?? 'en'
    return pageLocale === locale
  })

  const orphans = localePages.filter((page) => !reached.has(page))
  if (orphans.length) orphansByLocale.push({ locale, root, orphans })
  void prefix
}

if (orphansByLocale.length) {
  const detail = orphansByLocale
    .map(({ locale, root, orphans }) => `[${locale}] ${orphans.length} page(s) unreachable from ${root}:\n      ` + orphans.join('\n      '))
    .join('\n  ')
  console.error(
    'Link gate FAILED - unreachable pages:\n  ' + detail +
    '\n\nLink to them from a page that is reachable in the same language, or add them to ' +
    'ALLOW_UNREACHABLE if that is deliberate. The language toggle does not count as a link.'
  )
  process.exit(1)
}

console.log(
  `Link gate passed - ${checked} internal link(s) checked, ` +
  `${pages.length} page(s) all reachable within their own language`
)
