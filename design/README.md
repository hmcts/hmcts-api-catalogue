# Design documentation

Audit findings, design specifications and architecture decision records for the HMCTS API Marketplace
site.

These live outside `docs/` on purpose: `docs/` is the GitHub Pages publishing root, so anything placed
there is served from the public site. An audit that enumerates the service's weaknesses should not be
a page on the service.

## Contents

| Document | What it is |
|---|---|
| [`audit/2026-08-17-govuk-conformance-audit.md`](audit/2026-08-17-govuk-conformance-audit.md) | Conformance audit of the current 28-page site against the GOV.UK Design System, Service Standard, WCAG 2.2 AA and the accessibility, cookie and data-protection regulations. 5 Critical, 8 High, 7 Medium, 6 Low. Every count is reproducible. |
| [`specs/2026-08-17-govuk-conformant-site-design.md`](specs/2026-08-17-govuk-conformant-site-design.md) | Design for the GOV.UK-conformant rebuild: architecture, information architecture, page and journey inventory, component mapping, verification gates, sequencing. |

## Architecture decision records

| ADR | Status | Decision |
|---|---|---|
| [0001](adr/0001-govuk-branding-and-domain.md) | Accepted | Full GOV.UK branding, targeting a `service.gov.uk` domain — with the interim licence non-conformance recorded rather than hidden |
| [0002](adr/0002-prototype-kit-with-static-export.md) | Accepted | GOV.UK Prototype Kit, exported to static HTML for GitHub Pages, driven by an explicit route manifest |
| [0003](adr/0003-authentication-and-identity.md) | Proposed — deferred | Identity provider decision deliberately **not** taken by the rebuild; options recorded, owner needed |

## Conventions

- One ADR per decision, numbered sequentially, never rewritten once Accepted — superseded by a later
  ADR instead.
- Every ADR records the options considered and the rationale, not just the outcome.
- Audit findings carry stable IDs (`D-1`, `A-1`, `L-2`, …) so the spec and the ADRs can cite them and
  the citations keep working.
