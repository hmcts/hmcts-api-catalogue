// Do not download a bundled Chromium. The accessibility gate drives a real
// Chrome instead, resolved by scripts/check-a11y.mjs from CHROME_PATH or a
// well-known system location. This keeps installs fast and works in
// environments where the Chromium download is blocked.
module.exports = { skipDownload: true }
