// The one place that turns the route manifest into the actual list of pages.
//
// The manifest declares routes once, in English, plus the locales the site is
// published in. Every consumer - the export and all six gates - expands them
// through here, so a locale cannot be covered by the export but missed by a
// gate, or vice versa.

import { readFile } from 'node:fs/promises'

const MANIFEST = 'scripts/routes.manifest.json'
const DEFAULT_LOCALE = 'en'

// Pages that exist only in the default locale, with the reason. GitHub Pages
// serves exactly one 404 document from the publishing root, so a translated one
// could never be reached.
const DEFAULT_LOCALE_ONLY = new Set(['/404'])

export function localePrefix (locale) {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
}

// Route -> path of its output file, relative to the output root.
export function outputRelFor (route) {
  if (route === '/') return 'index.html'
  if (route === '/404') return '404.html'
  return `${route.replace(/^\/|\/$/g, '')}/index.html`
}

// Route -> how other pages link to it, relative to the output root.
export function linkRelFor (route) {
  if (route === '/') return ''
  if (route === '/404') return '404.html'
  return `${route.replace(/^\/|\/$/g, '')}/`
}

export async function loadManifest () {
  return JSON.parse(await readFile(MANIFEST, 'utf8'))
}

// The full page list: every declared route in every locale it is published in.
export async function loadRoutes () {
  const manifest = await loadManifest()
  const locales = manifest.locales ?? [DEFAULT_LOCALE]
  const expanded = []

  for (const locale of locales) {
    for (const { path, name } of manifest.routes) {
      if (locale !== DEFAULT_LOCALE && DEFAULT_LOCALE_ONLY.has(path)) continue
      const prefix = localePrefix(locale)
      expanded.push({
        path: prefix && path === '/' ? prefix : `${prefix}${path}`,
        name: locale === DEFAULT_LOCALE ? name : `${name} [${locale}]`,
        locale
      })
    }
  }

  return expanded
}

export { DEFAULT_LOCALE }
