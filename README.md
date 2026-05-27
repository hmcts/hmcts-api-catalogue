# HMCTS API Catalogue

> **"We don't build APIs — we connect you to them."**
>
> *Like a library — we don't write the books, we organise them so you can find and borrow what you need.*

---

## What is the HMCTS API Marketplace?

The HMCTS API Marketplace is a **discovery, publication and access management platform** for APIs across the HMCTS Digital and Technology Solutions. Think of it as the central directory for all available APIs — one place to browse what exists, understand how it works, and request access.

It is **not** a development team. The marketplace does not own, build or run any of the APIs it lists. Their respective teams do. The marketplace makes them **discoverable, documented and accessible**.

---

## What the API Marketplace Does and Doesn't Do

| ✅ The API Marketplace does | ❌ The API Marketplace does not |
|---|---|
| Catalogue and curate APIs across the programme | Build, own or develop APIs |
| Provide a single point of discovery | Host data or run backend services |
| Document what each API does in plain English | Support the API itself — that stays with the owner |
| Manage access requests and the approval workflow | Make architectural decisions for API teams |
| Enforce naming conventions and data classification standards | Guarantee uptime or SLAs for listed APIs |
| Connect API owners with the consumers who need their data | Act as a development team for hire |
| Capture demand signals when consumers need data that isn't yet available | Replace any team's responsibility for their APIs |

---

## Who It's For

### API Consumers
Teams and developers who need to use an existing API rather than build one from scratch. Use the marketplace to browse, discover, read documentation, try the mock server, and request access — all in one place.

### API Producers
Teams that build and own APIs and want them discoverable and usable by others. Use the marketplace to list your API, manage who can access it, and respond to consumer requests.

### Reviewers
Marketplace team members responsible for governance and standards. Review API submissions before they go live, triage incoming access requests, and manage consumer demand signals.

---

## How It Works

```
1. Browse     →    2. Discover    →    3. Request Access    →    4. Use
Search the        Read plain-English       Submit a formal           Integrate with
catalogue by      summaries and full       request with your         your credentials
keyword or        technical docs           business justification    via the API
domain
```

---

## Key Benefits

**Stops duplication** — Teams can check whether an API already exists before building a new one. The marketplace makes invisible work visible.

**Faster integration** — Consumers get documentation, specs, mock servers and access requests in one place. Integration time reduces from weeks to days.

**Governance and standards** — The approval workflow ensures only APIs that meet documentation and classification standards appear in the catalogue.

**Controlled access** — Access requests with formal justifications mean sensitive data is only shared with authorised teams who have stated their use case.

**Visibility** — Leadership and programme management get a clear, always-current picture of the API landscape — what exists, who owns it, and what consumer demand looks like.

---

## Common Misconceptions

| Misconception | Reality |
|---|---|
| "The marketplace team builds the APIs" | We list them. Your team builds and owns the API. |
| "If it's in the catalogue, the marketplace team supports it" | Support stays with the API owner. |
| "It's only for developers" | Product managers, architects and delivery managers should use it too. |
| "Listing my API means giving up ownership" | You remain the owner. Listing makes your API discoverable. |
| "The marketplace hosts our data" | We host documentation and metadata, not data or services. |

---

## The Prototype

The prototype is a fully working single-file application built on GOV.UK Frontend 5.4.0. It demonstrates all core journeys — browse and discovery, API publication, review and approval, and access request management.

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
| Approved APIs appear live in catalogue | ✅ Built |

---

## Repository Structure

```
hmcts-api-catalogue/
│
├── README.md
├── prototype/
│   └── api-catalogue-v7.html          # Working prototype
│
└── docs/
    ├── product-vision.md
    ├── capabilities.md
    ├── roadmap.md
    ├── requirements/                  # 14 capability requirement files
    ├── user-journeys/                 # Journey maps and flow documentation
    └── gap-analysis/                  # Capability and requirements status
```

---

## Technology

- Single HTML file — no framework, no build pipeline
- [GOV.UK Frontend 5.4.0](https://frontend.design-system.service.gov.uk) via CDN
- GDS Transport font via jsDelivr CDN
- localStorage for prototype data persistence
- Live API spec fetching from [SwaggerHub](https://app.swaggerhub.com/organizations/HMCTS-DTS)

---

## Licence

MIT — HMCTS Digital and Technology Solutions, HMCTS Digital and Technology Solutions.
