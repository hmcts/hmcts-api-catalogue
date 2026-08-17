# ADR 0001 — GOV.UK branding and the hosting domain

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 17 August 2026 |
| **Deciders** | Product owner, HMCTS API Marketplace |
| **Supersedes** | — |

## Context

The site is served from `https://hmcts.github.io/hmcts-api-marketplace/`. It currently uses the HMCTS
crest logo and Arial, with a bespoke stylesheet and no GOV.UK Frontend
([audit D-1](../audit/2026-08-17-govuk-conformance-audit.md#d-1--high--the-site-contains-no-govuk-frontend)).

Two GDS licensing constraints bear on the rebuild:

- The **GOV.UK logo and crest** may be used only by services on `gov.uk` / `service.gov.uk` domains.
- **GDS Transport** is licensed for use on GOV.UK domains only. On other domains, Arial is the
  prescribed substitute — which is why the current site's use of Arial is correct rather than a
  defect.

Adopting GOV.UK branding is also more than cosmetic: it presents the service as a GOV.UK service and
brings it into scope for a GDS service assessment against the Service Standard.

## Options considered

**A. GOV.UK Design System with HMCTS branding.** GOV.UK Frontend components and Service Navigation,
keeping the HMCTS crest and Arial. Fully conformant and unambiguously licensed on the current domain.
Does not look like a GOV.UK service.

**B. Full GOV.UK branding, targeting `service.gov.uk`.** Black masthead with crest, GDS Transport,
GOV.UK footer. Correct for the intended destination; not licensed on `hmcts.github.io` in the
interim.

**C. Design System plus the MoJ Design System.** Option A with MoJ components layered on for the
catalogue and account areas. More components, one more dependency, same licensing position as A.

## Decision

**Option B.** Build to full GOV.UK branding, on the basis that a `service.gov.uk` domain is planned
and the GitHub Pages URL is a staging location, not the destination.

GDS Transport is self-hosted from the `govuk-frontend` npm package rather than loaded from a CDN.

## Consequences

**Accepted risk.** Between now and the domain move, the site displays GOV.UK branding on a
`github.io` domain, which is outside the terms of the logo and font licences. This is a **known,
recorded non-conformance**, not an oversight. It is listed here so the design authority can see it
rather than discover it.

Mitigations:

- The masthead, footer and font are isolated behind `app/views/layouts/_generic.njk` and a single
  Sass font variable, so reverting to Option A is a one-file change rather than a rebuild.
- The staging URL should not be promoted publicly as the service's address.
- This ADR is reviewed when the domain is confirmed, and closed when the move completes.

**Follow-on obligations created by this decision:**

- A GDS service assessment against the Service Standard becomes in scope.
- Redirects from the current `hmcts.github.io` URLs to the new domain will be needed at the move.
- The footer must carry Crown copyright and the Open Government Licence with the OGL logo, resolving
  [audit L-4](../audit/2026-08-17-govuk-conformance-audit.md#l-4--low--footer-conflates-code-licence-with-content-licence).

## Open question

The `service.gov.uk` domain has not yet been named. Recorded as open question 3 in the
[design spec](../specs/2026-08-17-govuk-conformant-site-design.md#10-open-questions).
