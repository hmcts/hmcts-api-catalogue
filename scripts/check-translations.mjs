// Translation gate.
//
// What it does NOT do: fail because Welsh is untranslated. That is the expected
// state until the HMCTS Welsh Language Unit supplies the copy, and a gate that
// fails on it would just get switched off.
//
// What it does enforce is the thing that actually rots: key drift. Every locale
// file must have exactly the same keys as English, with null meaning "not yet
// translated". Without that, a string added to English is silently invisible to
// translators, and a key removed from English leaves dead Welsh behind.
//
// It also reports coverage, so "how much of the Welsh is done" is a number
// anyone can read from CI rather than a guess.

import { readFile } from 'node:fs/promises'
import { loadManifest, DEFAULT_LOCALE } from './routes.mjs'

const LOCALE_DIR = 'prototype-kit/app/locales'
const problems = []

function flatten (node, prefix = '') {
  const out = new Map()
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('_')) continue // _comment and friends
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of flatten(value, `${prefix}${key}.`)) out.set(k, v)
    } else {
      out.set(`${prefix}${key}`, value)
    }
  }
  return out
}

async function loadLocale (locale) {
  try {
    return JSON.parse(await readFile(`${LOCALE_DIR}/${locale}.json`, 'utf8'))
  } catch (err) {
    problems.push(`locale "${locale}" is declared in the manifest but ${LOCALE_DIR}/${locale}.json could not be read: ${err.message}`)
    return null
  }
}

const manifest = await loadManifest()
const locales = manifest.locales ?? [DEFAULT_LOCALE]

const source = await loadLocale(DEFAULT_LOCALE)
if (!source) {
  console.error('Translation gate FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}

const sourceStrings = flatten(source)

for (const [key, value] of sourceStrings) {
  if (typeof value !== 'string' || value.length === 0) {
    problems.push(`${DEFAULT_LOCALE}: "${key}" is empty - the source language must always have a real string`)
  }
}

const coverage = []

for (const locale of locales) {
  if (locale === DEFAULT_LOCALE) continue

  const dictionary = await loadLocale(locale)
  if (!dictionary) continue

  const strings = flatten(dictionary)
  let translated = 0
  const untranslated = []

  for (const key of sourceStrings.keys()) {
    if (!strings.has(key)) {
      problems.push(`${locale}: missing key "${key}" - add it with null if it is not translated yet, so translators can see it`)
      continue
    }
    const value = strings.get(key)
    if (value === null) {
      untranslated.push(key)
    } else if (typeof value !== 'string' || value.length === 0) {
      problems.push(`${locale}: "${key}" is an empty string - use null to mean "not yet translated"`)
    } else {
      translated++
    }
  }

  for (const key of strings.keys()) {
    if (!sourceStrings.has(key)) {
      problems.push(`${locale}: "${key}" does not exist in ${DEFAULT_LOCALE} - remove it, or add it to ${DEFAULT_LOCALE}`)
    }
  }

  coverage.push({ locale, translated, total: sourceStrings.size, untranslated })
}

if (problems.length) {
  console.error('Translation gate FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}

console.log(`Translation gate passed - ${sourceStrings.size} source string(s), keys aligned across ${locales.length} locale(s)`)

for (const { locale, translated, total, untranslated } of coverage) {
  const percent = total === 0 ? 100 : Math.round((translated / total) * 100)
  console.log(`  ${locale}: ${translated}/${total} translated (${percent}%)`)
  if (untranslated.length) {
    const shown = untranslated.slice(0, 8)
    console.log(`     awaiting translation: ${shown.join(', ')}${untranslated.length > shown.length ? `, +${untranslated.length - shown.length} more` : ''}`)
  }
}
