// Manifest reconciliation gate.
//
// Every route declared in the manifest must have produced a file, and every
// HTML file in the output must correspond to a declared route. This is what
// makes the static export trustworthy rather than hopeful: without it, a page
// can silently disappear from the output, or a stale page can silently linger.

import { readdir, access, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { loadRoutes, outputRelFor } from './routes.mjs'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const routes = await loadRoutes()
const { redirects } = JSON.parse(await readFile('scripts/redirects.json', 'utf8'))
const problems = []

const expected = new Set(routes.map(({ path }) => outputRelFor(path)))

// Redirect stubs are generated output too, declared in redirects.json rather
// than the route manifest. Both files together must account for every HTML file.
for (const { from } of redirects) expected.add(from)

for (const rel of expected) {
  try {
    await access(join(OUT, rel))
  } catch {
    problems.push(`declared route produced no file: ${rel}`)
  }
}

for (const entry of await readdir(OUT, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue
  const abs = join(entry.parentPath ?? entry.path, entry.name)
  const rel = relative(OUT, abs).split(sep).join('/')
  if (!expected.has(rel)) problems.push(`output file is not a declared route: ${rel}`)
}

// Completeness: every URL the current live site publishes must have a redirect,
// or it will 404 the moment docs/v2 is promoted to the root. index.html is
// exempt because the old and new homepages share the same URL.
const LIVE_SITE = 'docs'
const redirectFroms = new Set(redirects.map((r) => r.from))
for (const entry of await readdir(LIVE_SITE, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue
  if (entry.name === 'index.html') continue
  if (!redirectFroms.has(entry.name)) {
    problems.push(`live site publishes ${entry.name} with no redirect - it will 404 at promotion`)
  }
}

if (problems.length) {
  console.error('Manifest gate FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}

console.log(`Manifest gate passed - ${routes.length} route(s) and ${redirects.length} redirect(s) reconciled, every live-site URL covered`)
