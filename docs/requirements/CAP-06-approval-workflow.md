# CAP-06: Access Request Approval Workflow — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP06-01 | The system shall automatically validate that all required fields are completed before routing a request | System |
| REQ-CAP06-02 | The system shall route validated requests to the relevant API owner | System |
| REQ-CAP06-03 | The system shall support a governance review stage for Official-Sensitive APIs | Reviewer |
| REQ-CAP06-04 | An API owner shall be able to approve or reject an access request with mandatory notes | Producer |
| REQ-CAP06-05 | An API owner shall be able to request further information from the consumer | Producer |
| REQ-CAP06-06 | The system shall enforce a defined SLA for access request decisions | System |
| REQ-CAP06-07 | Automated reminders shall be sent to the API owner if the SLA is breached | System |
| REQ-CAP06-08 | A consumer shall be able to resubmit an access request after rejection | Consumer |

---

## Prototype status

Not built. This is the capability most blocked by localStorage — a producer and consumer are different users in different browsers and cannot share data. Supabase is the prerequisite.
