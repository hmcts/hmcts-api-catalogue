# Requirements Status — api-catalogue-v7

**Date:** May 2026 | **Scope:** CAP-01, CAP-03, CAP-05 (actively developed capabilities)

For the full capability gap analysis see [capability-gap-analysis.md](capability-gap-analysis.md).

---

## CAP-01: API Catalogue & Discovery — 11/12 (92%)

| Req | Description | Status |
|---|---|---|
| REQ-CAP01-01 | Browse without login | ✅ |
| REQ-CAP01-02 | Keyword search | ✅ |
| REQ-CAP01-03 | Domain filter | ✅ |
| REQ-CAP01-04 | Data classification on cards | ✅ |
| REQ-CAP01-05 | Access type indicator | ✅ |
| REQ-CAP01-06 | 5-tab detail page | ✅ |
| REQ-CAP01-07 | Plain-English summary | ✅ |
| REQ-CAP01-08 | Related APIs in sidebar | ❌ Outstanding |
| REQ-CAP01-09 | Zero-results suggest prompt | ✅ |
| REQ-CAP01-10 | Embedded + live spec | ✅ |
| REQ-CAP01-11 | Approved APIs in catalogue | ✅ |
| REQ-CAP01-12 | Multiple spec sources | ✅ |

---

## CAP-03: API Publication & Onboarding — 19/19 (100%)

| Req | Description | Status |
|---|---|---|
| REQ-CAP03-01 | Display name field | ✅ |
| REQ-CAP03-02 | SwaggerHub spec source | ✅ |
| REQ-CAP03-03 | URL spec source | ✅ |
| REQ-CAP03-04 | File upload spec source | ✅ |
| REQ-CAP03-05 | Live spec validation | ✅ |
| REQ-CAP03-06 | Data classification field | ✅ |
| REQ-CAP03-07 | Domain field | ✅ |
| REQ-CAP03-08 | Authentication type field | ✅ |
| REQ-CAP03-09 | Plain-English description (min 50 chars) | ✅ |
| REQ-CAP03-10 | Character counter | ✅ |
| REQ-CAP03-11 | 3-step task list | ✅ |
| REQ-CAP03-12 | Check your answers | ✅ |
| REQ-CAP03-13 | Declaration checkboxes (×3) | ✅ |
| REQ-CAP03-14 | Draft save and restore | ✅ |
| REQ-CAP03-15 | Edit submitted API | ✅ |
| REQ-CAP03-16 | Submission to shared queue | ✅ |
| REQ-CAP03-17 | Status visible in My APIs | ✅ |
| REQ-CAP03-18 | Reviewer notes to producer | ✅ |
| REQ-CAP03-19 | Reference number on submission | ✅ |

---

## CAP-05: Access Request Management — 10/13 (77%)

| Req | Description | Status |
|---|---|---|
| REQ-CAP05-01 | API selection | ✅ |
| REQ-CAP05-02 | Environment selection | ✅ |
| REQ-CAP05-03 | Volume selection | ✅ |
| REQ-CAP05-04 | System name field | ✅ |
| REQ-CAP05-05 | Business justification (min 30 chars) | ✅ |
| REQ-CAP05-06 | 4-step task list | ✅ |
| REQ-CAP05-07 | Check your answers | ✅ |
| REQ-CAP05-08 | Declaration checkboxes (×2) | ✅ |
| REQ-CAP05-09 | Request stored | ✅ |
| REQ-CAP05-10 | Consumer status tracking | ✅ |
| REQ-CAP05-11 | Request visible to API owner | ❌ Outstanding |
| REQ-CAP05-12 | Status updates to consumer | ❌ Outstanding |
| REQ-CAP05-13 | In-portal notification | ❌ Outstanding |

---

## Definition of done

A requirement is **done** when:
1. All acceptance criteria scenarios pass in the browser
2. No console errors on the happy path
3. GOV.UK Frontend component pattern used where one exists
4. Keyboard navigation works
5. Error states are handled (empty fields, invalid input, network failure)
6. The file is saved to the project

