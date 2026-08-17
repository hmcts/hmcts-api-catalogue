// Link integrity gate.
//
// Zero broken internal links in the exported site. External hosts are skipped:
// the AMp catalogue is a deliberate off-site signpost, and a transient network
// failure must not break the build.
//
// Note on linksToSkip: linkinator serves the local path over its own HTTP
// server, so internal links arrive here as http://localhost:<port>/... A naive
// '^https?://' skip pattern therefore skips *everything* and the gate passes
// while checking nothing. Skip by host instead.

import { LinkChecker } from 'linkinator'

const OUT = process.env.EXPORT_OUT ?? 'docs/v2'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

const checker = new LinkChecker()
const result = await checker.check({
  path: OUT,
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

console.log(`Link gate passed - ${checked} internal link(s) checked`)
