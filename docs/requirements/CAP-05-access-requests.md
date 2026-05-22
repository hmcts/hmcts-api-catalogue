# CAP-05: Access Request Management — Requirements

**Priority:** Must Have | **Phase:** MVP

---

## Requirements

| ID | Requirement | User |
|---|---|---|
| REQ-CAP05-01 | A consumer shall be able to select the API they need access to | Consumer |
| REQ-CAP05-02 | A consumer shall specify the environment they need access to | Consumer |
| REQ-CAP05-03 | A consumer shall specify their expected request volume | Consumer |
| REQ-CAP05-04 | A consumer shall provide the name of their system or application | Consumer |
| REQ-CAP05-05 | A consumer shall provide a business justification of at least 30 characters | Consumer |
| REQ-CAP05-06 | The access request journey shall follow a GDS task list pattern with four steps | System |
| REQ-CAP05-07 | A consumer shall review their answers on a check your answers page before submitting | Consumer |
| REQ-CAP05-08 | A consumer shall confirm two declarations before submission | Consumer |
| REQ-CAP05-09 | On submission, the request shall be stored and visible to the consumer in My Requests | System |
| REQ-CAP05-10 | A consumer shall be able to track the status of their requests (pending, approved, rejected) | Consumer |
| REQ-CAP05-11 | The API owner (producer) shall be able to see requests submitted for their APIs | Producer |
| REQ-CAP05-12 | Status updates from the producer shall be reflected in the consumer's My Requests panel | System |
| REQ-CAP05-13 | A consumer shall receive an in-portal notification when a decision is made on their request | Consumer |

---

## Prototype status

| Requirement | Status | Notes |
|---|---|---|
| REQ-CAP05-01 to 10 | ✅ Built | |
| REQ-CAP05-11 | ❌ Outstanding | Requires CAP-06 + backend or localStorage ownership model |
| REQ-CAP05-12 | ❌ Outstanding | Follows from REQ-CAP05-11 |
| REQ-CAP05-13 | ❌ Outstanding | Requires notification system |
