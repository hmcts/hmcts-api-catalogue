# Capability Gap Analysis — api-catalogue-v7

**Date:** May 2026  
**Prototype version:** api-catalogue-v7.html (242 KB)

---

## Summary

| Capability | Status | Coverage |
|---|---|---|
| CAP-01 API Catalogue & Discovery | Partial | 92% |
| CAP-02 User Registration & Identity | Partial | 62% |
| CAP-03 API Publication & Onboarding | Complete | 100% |
| CAP-04 Publication Review & Approval | Complete | 100% |
| CAP-05 Access Request Management | Partial | 77% |
| CAP-06 Access Request Approval Workflow | Not started | 0% |
| CAP-07 Notifications & Communications | Not started | 0% |
| CAP-08 API Lifecycle Management | Not started | 0% |
| CAP-09 Consumer Credential Management | Not started | 0% |
| CAP-10 Usage Monitoring & Analytics | Deferred | Phase 2 |
| CAP-11 Developer & Business UX | Partial | 50% |
| CAP-12 Governance, Compliance & Audit | Partial | 25% |
| CAP-13 Search & Discovery Intelligence | Deferred | Phase 2 |
| CAP-14 Platform Administration | Not started | 0% |

**Overall prototype coverage:** ~34% of full product scope

---

## CAP-01 — 92%

**What's built:** Browse, search, filter, domain pills, API cards, detail pages with 5 tabs, embedded specs with live SwaggerHub fetch, plain-English summaries, zero-results prompt linking to suggest flow, approved submitted APIs merged into catalogue, data classification on cards.

**What's missing:**
- Related APIs in sidebar (REQ-CAP01-08) — small effort, no backend needed

---

## CAP-02 — 62%

**What's built:** Register with role selection (Consumer, Producer, Reviewer), sign in, sign out, profile management, localStorage session, role-based dashboard routing.

**What's missing:**
- Email verification (requires Supabase auth)
- Password reset (requires Supabase auth)
- Session persistence across devices (requires Supabase auth)

---

## CAP-03 — 100%

**What's built:** Complete 3-step task list publication journey, three spec source options (SwaggerHub, URL, file upload), live spec validation, data classification, domain, auth type, plain-English description with character counter, check your answers, 3 declarations, draft save/restore, edit submitted API, submission to shared queue, status visible to producer, reviewer notes visible to producer.

**Backend dependency:** localStorage means submissions are only visible within the same browser. Supabase moves this to a real shared store.

---

## CAP-04 — 100%

**What's built:** Reviewer dashboard, review queue (oldest-first), full submission detail view, approve with optional notes, reject with mandatory notes, approved APIs published to catalogue immediately, reviewed history panel, reviewer notes visible to producer.

**Backend dependency:** Same localStorage caveat as CAP-03.

---

## CAP-05 — 77%

**What's built:** 4-step task list access request journey, all form fields, check your answers, 2 declarations, request stored in localStorage, consumer can track status in My Requests.

**What's missing:**
- Request visible to API owner (REQ-CAP05-11) — achievable without backend
- Status updates from producer back to consumer (REQ-CAP05-12) — follows CAP-06
- In-portal notification of outcome (REQ-CAP05-13) — achievable without backend

---

## CAP-06 — 0%

**What's not built:** Producer cannot see incoming access requests for their APIs. No approve/reject flow for access requests. No SLA enforcement.

**Blocker:** This requires either Supabase (cleanest) or a localStorage-based ownership model where requests are matched to the producer's submitted APIs. The latter is achievable in the prototype.

---

## CAP-07 — 0%

**What's not built:** No in-portal notification bell. No email notifications.

**Note:** In-portal notifications are achievable without a backend using a `_cat_notifications` localStorage store. Email requires GOV.UK Notify.

---

## CAP-08 — 0%

**What's not built:** No lifecycle states. All APIs show as "Live". No deprecated banners.

**Note:** Fully achievable without a backend. Lifecycle state is a field on the API record.

---

## CAP-09 — 0%

**What's not built:** No credential issuance. No subscription management. No credential rotation.

**Blocker:** Requires real authentication system.

---

## CAP-10 — Phase 2

No prototype implementation planned. Requires API gateway instrumentation.

---

## CAP-11 — 50%

**What's built:** Plain-English summaries (all APIs), mock server links on Try it out tab.

**What's missing (Phase 2):** Sandbox environment, data dictionary, onboarding walkthroughs, code examples.

---

## CAP-12 — 25%

**What's built:** Data classification field on publish form, classification tags on approved API cards.

**What's missing:** Audit trail, GDPR/DSA tracking, access log. All require a backend database.

---

## CAP-13 — Phase 2

Basic keyword search built (CAP-01). Full-text schema search, related APIs (partially — sidebar not built), business-language mapping — all Phase 2.

---

## CAP-14 — 0%

**What's not built:** No admin role, no user management, no platform configuration.

**Note:** The reviewer role partially covers administrative functions but is not a full admin.

---

## Outstanding work — no backend needed

These items can be built into the prototype immediately without Supabase:

| Item | Capability | Effort |
|---|---|---|
| Related APIs in sidebar | CAP-01 | Small |
| Access requests visible to producer | CAP-05/06 | Medium |
| Status updates to consumer | CAP-05 | Small (follows above) |
| In-portal notification bell | CAP-07 | Medium |
| API lifecycle states | CAP-08 | Medium |

## Outstanding work — requires Supabase

| Item | Capability | Unblocks |
|---|---|---|
| Real shared auth (email verification, password reset) | CAP-02 | — |
| Shared submissions store | CAP-03/04 | Cross-user reviewer visibility |
| Shared access requests store | CAP-05/06 | Producer sees consumer requests |
| Credentials issuance | CAP-09 | — |
| Audit trail | CAP-12 | — |

---

*Last updated: May 2026*
