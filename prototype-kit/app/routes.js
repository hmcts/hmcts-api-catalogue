//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// The AMp API catalogue is a separate service, outside this site. Every link to
// it comes from here, so swapping in the final URL is a one-line change.
//
// This lives in routes.js rather than app/config.json because the Kit only
// exposes a fixed set of config keys (serviceName and friends) to templates -
// an arbitrary key added to config.json is silently undefined in a template,
// which is how the catalogue button ended up rendering as a dead <button> with
// no href. scripts/check-structure.mjs now fails on that.
const AMP_CATALOGUE_URL = 'https://hmcts.github.io/amp-catalog/'

router.use((req, res, next) => {
  res.locals.ampCatalogueUrl = AMP_CATALOGUE_URL
  next()
})
