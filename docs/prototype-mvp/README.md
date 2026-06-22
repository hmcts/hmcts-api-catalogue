# HMCTS API Marketplace — MVP Prototype

**URL:** https://hmcts.github.io/hmcts-api-catalogue/prototype-mvp/
**File:** `docs/prototype-mvp/index.html`
**Size:** ~295 KB (single HTML file)
**Auth:** None — no-auth by design

---

## Purpose

A no-authentication prototype for stakeholder demonstration and alpha user research. Shows the core consumer journey — discover an API, understand what it does, and request access — without requiring sign in.

All form submissions route via `mailto:` to [Nagashankar.Ponnaganti@HMCTS.NET](mailto:Nagashankar.Ponnaganti@HMCTS.NET).

---

## Pages

| Page | Nav link | Function |
|---|---|---|
| API Marketplace | API Marketplace | Homepage — 4 nav cards |
| API Catalogue | API Catalogue | Searchable API list with filters |
| API Detail | (from catalogue) | Per-API detail page |
| Request API | Request API | Access request form |
| New API | New API | Request a new API form |
| Publish API | Publish API | Submit an API for listing |
| Onboarding guide | Onboarding guide | Step-by-step getting started |
| Consumer guidance | Consumer guidance | Responsible use guidance |
| Producer standards | Producer standards | Technical requirements |
| Data governance | (from footer) | GDPR and compliance |

---

## API Catalogue

- 9 live HMCTS APIs
- Search by name, domain or tag
- Filter by domain, status and classification
- A-Z quick navigation
- Live spec fetch from `raw.githubusercontent.com`

---

## API Detail Pages

Each API detail page loads its OpenAPI specification live from GitHub and renders:

**Hero:** Name, repo slug, description, team, classification, Request access button

**Sync bar:** Green dot showing "Specification loaded" with timestamp once spec fetches successfully

**5 tabs:** Overview, Endpoints, Data model, Changelog, Try it out

**Sidebar:**
- API information — Version, Status, OpenAPI version, Endpoint count (from live spec)
- Authentication — OAuth 2.0
- Response codes — HTTP codes from live spec (200, 400, 404 etc.)
- Links — API Documentation, Source repository (text links)

---

## Forms

All three forms share a common structure: personal details (name, organisation, work email, job title, phone), domain-specific fields, declaration checkboxes, and email submission.

### Request API (`accessRequestPage`)
Fields: API dropdown (live from catalogue), environment, estimated call volume, use case description, OAuth capability radio
Declarations: 4 checkboxes covering data governance, GDPR, security, and authorisation

### New API (`newApiRequestPage`)
Fields: Domain, urgency, existing system description
Declarations: 3 checkboxes

### Publish API (`publishApiPage`)
Fields: API name, GitHub repository URL, live spec URL preview (auto-generated), version, domain, classification, plain-English description
Declarations: 4 checkboxes covering standards compliance, data classification accuracy, maintenance commitment, and authorisation

---

## Guidance Pages

All guidance pages follow a consistent layout: blue hero with Alpha banner, sticky left-hand contents navigation, three-quarter content column with `border-top` section headings.

### Onboarding guide
6 sections: What is the API Marketplace, Who is this guide for, Consumer onboarding (6 steps), Producer onboarding (6 steps), Before you start (requirements checklist), Getting help

### Consumer guidance
6 sections: Before you request access, Making an access request, Using the API responsibly, Error handling and resilience, Keeping access current, Getting help

### Producer standards
Sections: OpenAPI specification requirements, GitHub repository structure, GitHub Actions workflow, Naming conventions, Versioning, Data classification, Spectral linting, Submission process

### Data governance
Sections: Data classification standards, GDPR obligations, DPIA requirements, Data minimisation, Audit and access logging, Incident response, Data retention

---

## Footer

All pages share an identical footer with two sections:
- **Support** — Contact the team, Onboarding guide, Request a new API, Publish an API
- **Policies** — Accessibility, Cookies, Privacy notice, Data governance

---

## Technical notes

- Single HTML file — no build pipeline, no framework, no dependencies except GOV.UK Frontend CDN
- GOV.UK Frontend 5.4.0 via jsDelivr CDN
- GDS Transport font loaded via `@font-face` from jsDelivr CDN
- `js-yaml` 4.1.0 via cdnjs for OpenAPI spec parsing
- No authentication, no localStorage, no cookies
- All nav is JS `onclick` toggling `.app-page--active` class
- API spec fetched via `fetch()` from `raw.githubusercontent.com`
