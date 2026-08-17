// Mutation-tests the gates.
//
// A gate that has never failed has not been shown to work. This breaks each
// thing a gate claims to check and asserts that the gate fails. It is not
// optional ceremony: the link gate's first implementation reported "0 internal
// links checked" and passed while checking nothing, because its skip-external
// pattern also matched linkinator's own local server. Only a mutation test
// catches that class of bug.
//
// Works on a throwaway copy, so docs/v2 is never modified.

import { readFile, writeFile, cp, rm, mkdir, access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const SOURCE = process.env.EXPORT_OUT ?? 'docs/v2'
const WORK = '.gate-verify'
const COPY = join(WORK, 'v2')

// Default page for HTML-level mutations. Any exported page would do; a section
// page keeps it away from the special-cased index. Individual mutations can
// override it with `target` when they need to break a specific relationship.
const TARGET = 'publish/index.html'

const gates = {
  manifest: () => spawnSync('node', ['scripts/check-manifest.mjs'], { env: env(), encoding: 'utf8' }),
  structure: () => spawnSync('node', ['scripts/check-structure.mjs'], { env: env(), encoding: 'utf8' }),
  links: () => spawnSync('node', ['scripts/check-links.mjs'], { env: env(), encoding: 'utf8' }),
  a11y: () => spawnSync('node', ['scripts/check-a11y.mjs'], { env: env(), encoding: 'utf8' }),
  html: () => spawnSync('npx', ['html-validate', `${COPY}/**/*.html`], { encoding: 'utf8' })
}

function env () {
  return { ...process.env, EXPORT_OUT: COPY, A11Y_PORT: '8151' }
}

const mutations = [
  {
    gate: 'structure',
    what: 'a second <h1>',
    html: (h) => h.replace('</main>', '<h1>Second heading</h1></main>')
  },
  {
    gate: 'structure',
    what: 'an inline style attribute',
    html: (h) => h.replace('<h1 class="govuk-heading-xl"', '<h1 style="color:#ff0000" class="govuk-heading-xl"')
  },
  {
    gate: 'structure',
    what: 'a placeholder href="#"',
    html: (h) => h.replace('</main>', '<a href="#">Cookies</a></main>')
  },
  {
    gate: 'structure',
    what: 'a brand colour that fails contrast',
    html: (h) => h.replace('</main>', '<p class="govuk-body">#0096d6</p></main>')
  },
  {
    gate: 'structure',
    what: 'a removed beta phase banner',
    html: (h) => h.replaceAll('govuk-phase-banner', 'govuk-was-a-phase-banner')
  },
  {
    gate: 'structure',
    what: 'a dangling in-page anchor',
    html: (h) => h.replace('</main>', '<a href="#nowhere">Jump</a></main>')
  },
  {
    gate: 'structure',
    what: 'a reintroduced onrender.com reference',
    html: (h) => h.replace('</main>', '<p class="govuk-body">https://hmcts-api-marketplace-auth.onrender.com</p></main>')
  },
  {
    gate: 'links',
    what: 'a link to a page that does not exist',
    html: (h) => h.replace('</main>', '<a href="../does-not-exist/">Gone</a></main>')
  },
  {
    // producer-standards has two inbound links, so removing one does not orphan
    // it. check-answers has exactly one - the data-next edge from the form -
    // so cutting that orphans both it and confirmation.
    gate: 'links',
    what: 'a page left unreachable from the homepage',
    target: 'publish/submit/index.html',
    html: (h) => h.replace('data-next="check-answers/"', 'data-next=""')
  },
  {
    // This is the bug that shipped: a govuk-button with an undefined href
    // silently renders as <button>, which is valid HTML and not a broken link,
    // so no other gate noticed the catalogue link had vanished.
    gate: 'structure',
    what: 'a govuk-button rendered dead, outside a form',
    target: 'api-catalogue/index.html',
    html: (h) => h.replace(
      /<a href="https:\/\/hmcts\.github\.io\/amp-catalog\/"([^>]*class="govuk-button[^>]*)>/,
      '<button type="submit"$1>'
    )
  },
  {
    gate: 'html',
    what: 'malformed markup (unclosed element)',
    html: (h) => h.replace('</main>', '<div class="govuk-body"></main>')
  },
  {
    gate: 'a11y',
    what: 'an image with no alt text',
    html: (h) => h.replace('</main>', '<img src="../plugin-assets/govuk-frontend/dist/govuk/assets/images/govuk-crest.svg"></main>')
  },
  {
    gate: 'manifest',
    what: 'an output file not declared in the manifest',
    fs: async () => writeFile(
      join(COPY, 'stray.html'),
      '<!DOCTYPE html><html lang="en"><head><title>Stray</title></head><body><h1>Stray</h1></body></html>'
    )
  },
  {
    gate: 'manifest',
    what: 'a declared route missing from the output',
    fs: async () => rm(join(COPY, 'publish/index.html'))
  }
]

try {
  await access(SOURCE)
} catch {
  console.error(`Nothing to verify against: ${SOURCE} does not exist. Run "npm run export" first.`)
  process.exit(1)
}

await rm(WORK, { recursive: true, force: true })
await mkdir(WORK, { recursive: true })
await cp(SOURCE, join(WORK, 'pristine'), { recursive: true })

let failures = 0

for (const mutation of mutations) {
  await rm(COPY, { recursive: true, force: true })
  await cp(join(WORK, 'pristine'), COPY, { recursive: true })

  if (mutation.html) {
    const file = join(COPY, mutation.target ?? TARGET)
    const before = await readFile(file, 'utf8')
    const after = mutation.html(before)
    if (after === before) {
      console.log(`SKIP  ${mutation.gate}: mutation "${mutation.what}" did not change the file`)
      failures++
      continue
    }
    await writeFile(file, after, 'utf8')
  } else {
    await mutation.fs()
  }

  const result = gates[mutation.gate]()
  const caught = result.status !== 0

  console.log(`${caught ? 'PASS' : 'FAIL'}  gate:${mutation.gate} catches ${mutation.what}`)
  if (!caught) {
    failures++
    console.log('      gate output was:')
    console.log('      ' + (result.stdout ?? '').trim().split('\n').join('\n      '))
  }
}

await rm(WORK, { recursive: true, force: true })

if (failures) {
  console.error(`\n${failures} of ${mutations.length} mutation(s) were NOT caught. Those gates are not trustworthy.`)
  process.exit(1)
}

console.log(`\nAll ${mutations.length} mutations caught. Gates verified.`)
