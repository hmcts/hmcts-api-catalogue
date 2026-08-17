# ADR 0004 — Hosting: stay on GitHub Pages for beta, move for the gov.uk destination

| | |
|---|---|
| **Status** | Accepted for the beta. The destination target is a recommendation, not yet a decision. |
| **Date** | 17 August 2026 |
| **Deciders** | Product owner, HMCTS API Marketplace |
| **Related** | [ADR 0001](0001-govuk-branding-and-domain.md) — GOV.UK branding and the domain |

## Context

The rebuilt site is published as static files from `docs/v2/` and served by GitHub
Pages, which is where the current site already lives. The export produces nothing
but static assets — 54 HTML files, one stylesheet, three scripts, four font files
and a handful of images, with no server-side constructs at all — so there is no
technical dependency on any particular host.

The question is whether Pages is adequate until the service reaches a
`service.gov.uk` domain, and what it should move to then.

Verified rather than assumed: the exported tree serves correctly from a
subdirectory with every referenced asset returning HTTP 200, including fonts
reached via relative paths inside the compiled CSS.

## Decision

**Stay on GitHub Pages for the beta.** It already hosts the current site, the
export is a drop-in replacement, and nothing about the rebuild needs more than
static file serving.

**Do not assume Pages is the destination.** For the `service.gov.uk` target,
the recommendation is a host where HTTP response headers can be set — **Azure
Static Web Apps** being the natural fit for an Azure-based HMCTS estate. That
choice is not made here; it needs the security and infrastructure owners.

## Why Pages is adequate now, and what it costs

**What works.** Custom domains with managed HTTPS, global CDN, zero
infrastructure to run, and deployment already wired to the repository. The `/cy/`
Welsh tree works exactly like the English one.

**The gap that matters: GitHub Pages cannot set HTTP response headers.** There is
no way to send:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options` or `frame-ancestors`
- `Referrer-Policy`
- `Permissions-Policy`

For a site presented with GOV.UK branding, that is a Secure by Design conversation
worth having now rather than at a service assessment. It is not fatal for this
beta — after promotion the service has no authentication, no personal data and no
third-party scripts, so the attack surface is close to the minimum a website can
have — but it is a real limitation rather than a technicality, and it does not
improve on its own.

**Two limitations already worked around**, recorded so nobody rediscovers them:

- **No server-side redirects.** Handled by generating 27 stub pages with
  `rel=canonical` and a meta refresh, so no existing URL 404s at promotion. WCAG
  technique H76 treats an immediate refresh as the accepted approach precisely
  where server redirects are unavailable.
- **One error document for the whole site.** Pages serves a single `404.html`
  from the publishing root, so a Welsh 404 at `/cy/404` could never be reached.
  The language toggle is suppressed on that page rather than offering a link that
  leads nowhere.

**Other constraints, none currently binding:** soft 1 GB repository limit, 100 GB
monthly bandwidth, 10 builds per hour, and no access logs under our control — the
privacy notice already states that GitHub may log requests as part of running its
own infrastructure.

## On reaching a gov.uk domain

A domain change does not necessarily require a hosting change. Pages supports
custom domains with managed certificates, so a `service.gov.uk` name could in
principle be pointed at it by CNAME.

Whether GDS would permit that for a service domain is a policy question for GDS,
not a technical one — and the missing-headers gap makes it a harder ask, because
the usual answer to "how do you set your CSP" cannot be "we cannot".

## Recommended destination

**Azure Static Web Apps**, subject to the owners named below agreeing:

- static hosting with a global CDN, which is all the output needs
- **configurable response headers**, closing the gap above
- custom domains with managed certificates
- staging environments per pull request, which suits the review flow already in place
- inside the HMCTS Azure estate, which is a materially easier Technology Code of
  Practice conversation than "the front door to our API estate is hosted on
  GitHub"

The build does not change. `npm run export` already produces a plain static tree,
so the host is a deployment detail rather than a rebuild. Switching means pointing
a different pipeline at `docs/v2/`.

Alternatives not evaluated in depth, and worth a look if this is taken forward:
Azure Front Door in front of Blob Storage, and CloudFront in front of S3. Both
solve the headers problem; neither is as close to the existing estate.

## Consequences

- The beta continues to publish from `docs/v2/` on Pages with no further work.
- The missing security headers are an **accepted, recorded gap** for the beta, and
  a blocker to treat this as a production GOV.UK service. It should be closed as
  part of the domain move, not after it.
- Promotion of `docs/v2/` to the publishing root remains the next hosting-related
  step, and is also when the `onrender.com` calls disappear
  ([ADR 0003](0003-authentication-and-identity.md)).

## Needs an owner

1. **Whether Pages is acceptable for a GOV.UK-branded beta**, given it cannot set
   security headers. This is the same design-authority conversation as the
   branding licence in [ADR 0001](0001-govuk-branding-and-domain.md), and the two
   should be taken together rather than separately.
2. **The destination host**, if the Azure Static Web Apps recommendation is
   accepted — who provisions it, and who owns the pipeline.
3. **The `service.gov.uk` domain itself**, still unnamed, which is open question 2
   in the [design spec](../specs/2026-08-17-govuk-conformant-site-design.md#10-open-questions).
