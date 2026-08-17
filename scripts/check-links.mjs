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

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

// Reachable by URL, never by link: the 404 page, and every redirect stub - the
// whole point of a stub is that an old external link or bookmark lands on it.
const { redirects } = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))
const ALLOW_UNREACHABLE = new Set(['404.html', ...redirects.map((r) => r.from)])

// --- part 1: broken links --------------------------------------------------

const checker = new LinkChecker()
const result = await checker.check({
  path: '**/*.html',
  serverRoot: OUT,
  recurse: true,
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
const EDGE_ATTRIBUTES = /\b(?:href|data-next)="([^"]+)"/g

const graph = new Map()
for (const page of pages) {
  const html = await readFile(join(OUT, page), 'utf8')
  const targets = new Set()
  for (const match of html.matchAll(EDGE_ATTRIBUTES)) {
    const target = resolveTarget(page, match[1])
    if (target && target !== page) targets.add(target)
  }
  graph.set(page, targets)
}

const reached = new Set(['index.html'])
const queue = ['index.html']
while (queue.length) {
  for (const next of graph.get(queue.shift()) ?? []) {
    if (!reached.has(next)) {
      reached.add(next)
      queue.push(next)
    }
  }
}

const orphans = pages.filter((page) => !reached.has(page) && !ALLOW_UNREACHABLE.has(page))

if (orphans.length) {
  console.error(
    `Link gate FAILED - ${orphans.length} page(s) unreachable from the homepage:\n  ` +
    orphans.join('\n  ') +
    '\n\nLink to them from a page that is reachable, or add them to ALLOW_UNREACHABLE if that is deliberate.'
  )
  process.exit(1)
}

console.log(
  `Link gate passed - ${checked} internal link(s) checked, ` +
  `${pages.length} page(s) all reachable from the homepage`
)
