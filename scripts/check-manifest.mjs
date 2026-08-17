// Manifest reconciliation gate.
//
// Every route declared in the manifest must have produced a file, and every
// HTML file in the output must correspond to a declared route. This is what
// makes the static export trustworthy rather than hopeful: without it, a page
// can silently disappear from the output, or a stale page can silently linger.

import { readdir, access, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const { routes } = JSON.parse(await readFile('scripts/routes.manifest.json', 'utf8'))
const problems = []

function outputRelFor (route) {
  if (route === '/') return 'index.html'
  if (route === '/404') return '404.html'
  return `${route.replace(/^\/|\/$/g, '')}/index.html`
}

const expected = new Set(routes.map(({ path }) => outputRelFor(path)))

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

if (problems.length) {
  console.error('Manifest gate FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}

console.log(`Manifest gate passed - ${expected.size} route(s) reconciled`)
