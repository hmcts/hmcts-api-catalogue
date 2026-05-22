# HMCTS API Catalogue

> A discovery, publication and access management platform for HMCTS Common Platform APIs.

## What is this?

The HMCTS API Catalogue is an internal marketplace that lets teams discover, document and request access to APIs across the Common Platform Programme. It is built on the GOV.UK Design System and follows GDS design principles.

This repository contains the working prototype and all supporting product documentation — capabilities, requirements, user journeys and gap analyses.

---

## Quick start

The prototype is a single HTML file. No build step, no dependencies, no server required.

1. Download `prototype/api-catalogue-v7.html`
2. Open it in any modern browser
3. The full application loads instantly

To share it with someone else, upload the file to [Netlify Drop](https://app.netlify.com/drop) for a permanent shareable URL in under a minute.

---

## Prototype features

| Feature | Status |
|---|---|
| Browse and search 6 live HMCTS APIs | ✅ Built |
| Domain filter and zero-results prompt | ✅ Built |
| Full API detail pages (5 tabs) | ✅ Built |
| Live SwaggerHub spec fetch + embedded fallback | ✅ Built |
| GOV.UK Frontend 5.4.0 with GDS Transport font | ✅ Built |
| Consumer registration and sign in | ✅ Built |
| Consumer access request (4-step task list) | ✅ Built |
| Producer publish API (3-step task list + 3 spec sources) | ✅ Built |
| Publication review and approval (reviewer role) | ✅ Built |
| Suggest a new API flow | ✅ Built |
| Draft save and restore | ✅ Built |
| Check your answers before submission | ✅ Built |
| Approved APIs appear live in catalogue | ✅ Built |

---

## Repository structure

```
hmcts-api-catalogue/
│
├── README.md
├── prototype/
│   └── api-catalogue-v7.html          # Working prototype
│
└── docs/
    ├── product-vision.md              # What the marketplace is and isn't
    ├── capabilities.md                # All 14 capabilities
    ├── roadmap.md                     # MVP vs Phase 2 phasing
    ├── requirements/
    │   ├── CAP-01-discovery.md
    │   ├── CAP-02-identity.md
    │   ├── CAP-03-publication.md
    │   ├── CAP-04-review.md
    │   ├── CAP-05-access-requests.md
    │   ├── CAP-06-approval-workflow.md
    │   ├── CAP-07-notifications.md
    │   ├── CAP-08-lifecycle.md
    │   ├── CAP-09-credentials.md
    │   ├── CAP-10-analytics.md
    │   ├── CAP-11-ux.md
    │   ├── CAP-12-governance.md
    │   ├── CAP-13-search.md
    │   └── CAP-14-administration.md
    ├── user-journeys/
    │   ├── consumer-browse-and-request.md
    │   ├── consumer-suggest-api.md
    │   ├── producer-publish-api.md
    │   └── reviewer-approve-reject.md
    └── gap-analysis/
        ├── capability-gap-analysis.md
        └── requirements-status.md
```

---

## Roles

| Role | Description |
|---|---|
| **Consumer** | A team or developer who needs to use an existing API |
| **Producer** | A team that builds and owns an API and wants it discoverable |
| **Reviewer** | A marketplace team member who reviews API submissions and governs access |

---

## Technology

- Single HTML file — no framework, no build pipeline
- [GOV.UK Frontend 5.4.0](https://frontend.design-system.service.gov.uk) via CDN
- GDS Transport font via jsDelivr CDN
- localStorage for prototype data persistence
- Live API spec fetching from [SwaggerHub](https://app.swaggerhub.com/organizations/HMCTS-DTS)

---

## Next steps

The prototype uses localStorage for all data. The next infrastructure decision is connecting [Supabase](https://supabase.com) as a shared backend, which unlocks:

- Real shared user accounts and email verification
- Producer access requests visible to producers
- Status notifications to consumers
- Audit logging

See [`docs/gap-analysis/capability-gap-analysis.md`](docs/gap-analysis/capability-gap-analysis.md) for the full picture of what's built and what's outstanding.

---

## Licence

MIT — HMCTS Digital and Technology Solutions, Common Platform Programme.
