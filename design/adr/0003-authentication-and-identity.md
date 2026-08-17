# ADR 0003 — No authentication backend: fake the flow statically

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 17 August 2026 |
| **Deciders** | Product owner, HMCTS API Marketplace |
| **Revises** | An earlier draft of this ADR proposed deferring an identity-provider choice. That framing was wrong — see [Context](#context). |

## Context

The live site calls a third-party auth API. `register.html:151` and `sign-in.html:128` both set:

```js
const API_BASE = "https://hmcts-api-marketplace-auth.onrender.com";
```

`assets/scripts.js:130` calls `/api/me` with `credentials: 'include'` on **every** page load. Endpoints
in use: `/api/register`, `/api/login`, `/api/me`, `/api/logout`, `/api/requests`. First name, last
name, work email, organisation, role and password are transmitted to that host from
`register.html`.

The product owner has confirmed that **`onrender.com` should not have been used**. It was not a
sanctioned architecture decision, and there is no assurance position behind it.

That changes what this ADR is for. An earlier draft treated the Render backend as an existing
architecture to be assessed, and deferred the choice of a replacement identity provider. That was the
wrong question. An unsanctioned dependency carrying credentials is not a design to weigh options
against — it is something to remove.

## Decision

**The site has no authentication backend. The Render dependency is removed, and the sign-in,
registration and account flows are faked entirely client-side until a sanctioned identity solution
exists.**

Concretely:

1. Every call to `hmcts-api-marketplace-auth.onrender.com` is removed. No replacement endpoint is
   introduced.
2. **No credential and no personal data leaves the browser.** Nothing is transmitted, and nothing is
   stored server-side, because there is no server.
3. The flows are faked, and say so:
   - **Sign in** accepts any well-formed input and sets a prototype session flag in `sessionStorage`.
   - **Register** runs the full GDS journey and ends on a confirmation panel stating plainly that
     nothing was submitted or stored.
   - **The account area** renders clearly labelled prototype data.
4. The *patterns* stay correct even though the plumbing is fake: `govuk-password-input`,
   `autocomplete="current-password"` / `"new-password"`, the GDS error summary with links into
   fields. When a real identity provider arrives, the markup is already right and only the plumbing
   changes.
5. All faking lives in **one module** — `app/assets/javascripts/prototype-session.js`. Swapping in a
   real provider is a contained change, not a rewrite.

Choosing the eventual identity provider — GOV.UK One Login, Microsoft Entra ID, or something else —
is explicitly **not** decided here and gets its own ADR when there is an owner for it. The broken
`entra-jwt-auth.html` link in `my-applications.html` suggests Entra was once the intended direction;
that is a lead, not a decision.

## Consequences

**The data-protection position simplifies substantially.** Once nothing is transmitted, HMCTS is not
processing personal data through this site, so the UK GDPR obligations that
[audit L-2](../audit/2026-08-17-govuk-conformance-audit.md#l-2--critical--no-privacy-notice-and-personal-data-is-being-collected)
identified fall away for the rebuilt site. The privacy notice still gets published, and says exactly
that: this is a prototype, what you type stays in your browser, nothing is sent or retained.

**The cookie position simplifies too.** No auth session cookie means no consent question at all. The
`sessionStorage` prototype state is still disclosed on the cookies page — PECR reg. 6 covers cookies
*and similar technologies* — but as strictly necessary prototype state, it needs disclosure rather
than consent.

**The `my-applications` gate is a prototype gate, not a security control.** It stops the page looking
broken to an anonymous visitor
([C-6](../audit/2026-08-17-govuk-conformance-audit.md#c-6--medium--the-account-area-is-not-gated)).
It protects nothing, because there is nothing behind it to protect. It must be described that way in
the code, so nobody later mistakes it for access control.

**Demo discipline.** Anyone showing the prototype must not present it as having real accounts. The
beta phase banner and the confirmation-page wording carry that message in the product itself rather
than relying on the presenter.

**Honest capability loss.** Sign-in stops meaning anything. Sessions do not persist across browsers
or devices, and there are no real users. That is the correct state for a prototype and is preferable
to a working login built on an unassured dependency.

## Interim position for the live site

Removing the Render calls from the **currently live** site is technically independent of the rebuild:
it is a surgical change to four files in `docs/`.

**Decided 17 August 2026: the live site will not be patched ahead of the `docs/v2/` promotion.** The
dependency disappears when v2 is promoted to the root.

This is an accepted risk, recorded so it is visible rather than forgotten. Until the promotion,
`https://hmcts.github.io/hmcts-api-marketplace/register.html` transmits names, work emails,
organisations and passwords to an unsanctioned third-party host, and the site publishes no privacy
notice. The risk window is therefore the delivery time of the rebuild, which makes the v2 promotion
date the mitigation. If that date slips materially, this decision is worth revisiting.

## What must not wait

Separately, and needing an owner: establish what the Render instance already received and stored, how
any passwords were hashed, who could reach it, and whether data must be deleted and the instance shut
down. Removing the client calls stops new data flowing; it does nothing about data already sent.
