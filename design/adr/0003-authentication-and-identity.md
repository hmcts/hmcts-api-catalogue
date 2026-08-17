# ADR 0003 — Authentication and identity

| | |
|---|---|
| **Status** | Proposed — decision deferred, deliberately |
| **Date** | 17 August 2026 |
| **Deciders** | To be determined — this needs a security and information-assurance owner, not a design decision |

## Context

`register.html:151` and `sign-in.html:128` both set:

```js
const API_BASE = "https://hmcts-api-marketplace-auth.onrender.com";
```

Endpoints in use: `/api/register`, `/api/login`, `/api/me`, `/api/logout`, `/api/requests`.
`assets/scripts.js:130` calls `/api/me` with `credentials: 'include'` on **every** page load, and the
code comments note the Render free tier's cold starts.

So today: first name, last name, work email, organisation, role and a password are transmitted to a
third-party consumer PaaS on a non-HMCTS domain, and the site publishes no privacy notice
([audit L-2](../audit/2026-08-17-govuk-conformance-audit.md#l-2--critical--no-privacy-notice-and-personal-data-is-being-collected))
and no cookies page
([L-3](../audit/2026-08-17-govuk-conformance-audit.md#l-3--high--no-cookies-page)). Recorded in the
audit as [S-1](../audit/2026-08-17-govuk-conformance-audit.md#s-1--critical--credentials-are-posted-to-a-third-party-consumer-paas).

This engages the Technology Code of Practice on making things secure and on making privacy integral,
and HMCTS's Secure by Design expectations.

> **Source honesty.** Secure by Design principle titles are not enumerated here. The official page
> blocks automated retrieval and the commonly circulated titles come from secondary summaries.
> Confirm them against the live source before citing them in a governance paper. Likewise, which
> Technology Code of Practice points are mandatory rather than advisory is a matter for GDS
> Assurance; GOV.UK does not enumerate it.

## Options considered

**A. Status quo.** Keep the Render backend. Zero migration effort. Leaves credentials and personal
data on a non-HMCTS consumer platform with no assurance position.

**B. GOV.UK One Login.** The reuse-first answer under Service Standard 13, *use and contribute to
open standards, common components and patterns*. Removes password handling from the service
altogether. Requires onboarding with the One Login team and a suitable relying-party integration —
and One Login is aimed at members of the public, so its fit for a developer/vendor audience needs
checking, not assuming.

**C. HMCTS-managed IDP — Microsoft Entra ID.** The `entra-jwt-auth.html` link in
`my-applications.html` (broken, target missing —
[H-3](../audit/2026-08-17-govuk-conformance-audit.md#h-3--low--one-broken-link-one-orphan-page))
suggests this was already the intended direction. Fits an audience of HMCTS staff and known partner
organisations, and keeps identity inside the estate.

**D. Rehost the same backend inside the HMCTS estate.** Least conceptual change; addresses the
hosting and data-residency objection without addressing the fact that the service is handling
passwords itself.

## Decision

**Deferred.** No decision is taken in this ADR, and none is taken by the site rebuild.

The rebuild retains the existing Render endpoints unchanged and restyles the sign-in and registration
pages to GOV.UK patterns — adding the `govuk-password-input` component, correct `autocomplete` values
([A-3](../audit/2026-08-17-govuk-conformance-audit.md#a-3--high--no-autocomplete-on-identity-fields--wcag-135)),
the GDS error summary pattern, and a gate on `my-applications`
([C-6](../audit/2026-08-17-govuk-conformance-audit.md#c-6--medium--the-account-area-is-not-gated)).

## Rationale for deferring

Choosing an identity provider is a security, data-protection and operating-model decision with an
owner, a threat model and an assurance route. Settling it as a side effect of a visual redesign would
be exactly the "decisions in someone's head" failure mode that ADRs exist to prevent.

Making it visible and unresolved is the useful outcome here. The alternative — quietly restyling the
sign-in page and moving on — would leave a Critical finding looking as though it had been addressed.

## What must not wait

Regardless of which option is eventually chosen, and independent of the rebuild:

1. **Publish a privacy notice** covering the registration data as it is processed *today*. Required by
   UK GDPR Arts. 13–14. A DPIA is likely required.
2. **Publish a cookies page** describing the session cookie. Required by PECR reg. 6. A consent
   banner is not required for a strictly necessary auth cookie, but disclosure is.
3. **Confirm what the Render instance stores, where, and who can reach it** — including how passwords
   are hashed and whether any data must be deleted.

Items 1 and 2 are in scope for the rebuild's sequencing step 2. Item 3 is not, and needs an owner.

## Next step

Assign an owner and take this ADR to the HMCTS Technical Design Authority or Technical Architecture
Board as an options paper. *(TAB and TDA are internal HMCTS DTS forums, cited as internal rather than
public fact.)* The right artefact is an options paper, not a design — the point is to get a decision
recorded, with the assurance route named.
