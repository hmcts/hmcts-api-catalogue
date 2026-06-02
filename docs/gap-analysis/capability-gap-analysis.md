# Capability Gap Analysis — api-catalogue-v7

**Date:** June 2026
**Prototype version:** api-catalogue-v7.html (219 KB)

---

## Summary

| Capability | Status | Coverage |
|---|---|---|
| CAP-01 API Catalogue & Discovery | Partial | 92% |
| CAP-02 User Registration & Identity | Partial | 62% |
| CAP-03 API Publication & Onboarding | Complete | 100% |
| CAP-04 Publication Review & Approval | Complete | 100% |
| CAP-05 Access Request Management | Complete | 100% |
| CAP-06 Access Request Approval Workflow | Partial | 50% |
| CAP-07 Notifications & Communications | Not started | 0% |
| CAP-08 API Lifecycle Management | Not started | 0% |
| CAP-09 Consumer Credential Management | Not started | 0% |
| CAP-10 Usage Monitoring & Analytics | Deferred | Phase 2 |
| CAP-11 Developer & Business UX | Partial | 50% |
| CAP-12 Governance, Compliance & Audit | Partial | 25% |
| CAP-13 Search & Discovery Intelligence | Deferred | Phase 2 |
| CAP-14 Platform Administration | Not started | 0% |

---

## CAP-01 — 92%

**What's built:** Browse, search, filter, domain pills, API cards, detail pages with 5 tabs, embedded specs with live SwaggerHub fetch, plain-English summaries, zero-results prompt linking to Request a new API flow, approved submitted APIs merged into catalogue, data classification on cards.

**What's missing:**
- Related APIs in sidebar (REQ-CAP01-08) — small effort, no backend needed

---

## CAP-02 — 62%

**What's built:** Register with role selection (Consumer, Producer, Reviewer), permission-based auth model (`defaultPermissions`, `hasPermission`), sign in, sign out, profile management, localStorage session, role-based dashboard routing.

**What's missing:**
- Email verification (requires Supabase auth)
- Password reset (requires Supabase auth)
- Session persistence across devices (requires Supabase auth)

---

## CAP-03 — 100%

**What's built:** Complete 3-step task list publication journey, three spec source options (SwaggerHub, URL, file upload), live spec validation, data classification, domain, auth type, plain-English description with character counter, check your answers, 3 declarations, draft save/restore, edit submitted API, submission to shared queue, status visible to producer, reviewer notes visible to producer.

---

## CAP-04 — 100%

**What's built:** Reviewer dashboard, review queue (oldest-first), full submission detail view, approve with optional notes, reject with mandatory notes, approved APIs published to catalogue immediately, reviewed history panel, reviewer notes visible to producer.

---

## CAP-05 — 100%

**What's built:** 4-step task list access request journey, all form fields, check your answers, 2 declarations, request stored in both per-user and shared global store, consumer status tracking (Pending / Approved / Rejected), producer decision notes shown to consumer, Request a new API panel with 8-field structured form.

---

## CAP-06 — 50%

**What's built:** Producer Access requests panel with Pending and Actioned tabs, red badge count on nav, full request detail view, approve with optional note, reject with mandatory reason, GDS confirmation panel, consumer My requests reflects decision.

**What's missing:**
- Governance review stage for Official-Sensitive APIs (REQ-CAP06-03)
- Request further information flow (REQ-CAP06-05)
- SLA enforcement and reminders (REQ-CAP06-06, 07) — requires backend
- Consumer resubmit after rejection (REQ-CAP06-08)

**Prototype note:** Consumer and producer must use the same browser window (different tabs) to share data. A demo request button is available for testing without two tabs.

---

## CAP-07 — 0%

**What's not built:** No in-portal notification bell. No email notifications.

**Note:** In-portal notifications are achievable without a backend using a `_cat_notifications` localStorage store. This is the natural next capability to build.

---

## CAP-08 — 0%

**What's not built:** No lifecycle states. All APIs show as Live. No deprecated banners.

**Note:** Fully achievable without a backend.

---

## CAP-09 — 0%

**What's not built:** No credential issuance on approval. No subscription management.

**Blocker:** Requires real authentication system and backend.

---

## CAP-10 — Phase 2

No prototype implementation planned. Requires API gateway instrumentation.

---

## CAP-11 — 50%

**What's built:** Plain-English summaries, mock server links on Try it out tab.

**What's missing (Phase 2):** Sandbox environment, data dictionary, onboarding walkthroughs, code examples.

---

## CAP-12 — 25%

**What's built:** Data classification field on publish form, classification tags on approved API cards.

**What's missing:** Audit trail, GDPR/DSA tracking, access log. All require a backend database.

---

## CAP-13 — Phase 2

Basic keyword search built. Full-text schema search, related APIs sidebar — Phase 2.

---

## CAP-14 — 0%

**What's not built:** No admin role, no user management, no platform configuration.

---

## Outstanding work — no backend needed

| Item | Capability | Effort |
|---|---|---|
| Related APIs in sidebar | CAP-01 | Small |
| In-portal notification bell | CAP-07 | Medium |
| API lifecycle states | CAP-08 | Medium |
| Consumer resubmit after rejection | CAP-06 | Small |
| Governance stage for Official-Sensitive | CAP-06 | Medium |

## Outstanding work — requires Supabase

| Item | Capability | Unblocks |
|---|---|---|
| Real shared auth (email verification, password reset) | CAP-02 | — |
| Shared submissions and requests store | CAP-03/04/05/06 | True cross-user visibility |
| Credentials issuance | CAP-09 | — |
| Audit trail | CAP-12 | — |

---

*Last updated: June 2026*
