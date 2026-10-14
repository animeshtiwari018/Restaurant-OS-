# Pre-Implementation Review & Sign-off

**Project:** Restaurant Operating System
**Document ID:** IMPL-018
**Status:** Pending Review
**Last Updated:** 2026-10-13

---

## 1. Purpose

This is the final checklist before implementation starts.

The goal is to confirm that all planning documents — requirements, business rules, database design, API contracts, security, testing, and MVP scope — describe one consistent system.

> **Writing all planning documents is not the same as being ready to implement.**

---

## 2. Documents Under Review

| Document | What to check |
|---|---|
| 01 — Product Discovery (readme.md) | Product vision, target users, and assumptions |
| 02 — Product Requirements | Functional and non-functional requirements |
| 03 — User Journeys and Workflows | End-to-end user and staff workflows |
| 04 — UX Information Architecture | Routes, navigation, and screen responsibilities |
| 05 — System Architecture | Module boundaries and application architecture |
| 06 — Database Design and ERD | Entities, relationships, constraints, and ownership |
| 07 — API Specification | Endpoint contracts, request validation, and responses |
| 08 — Authentication, Authorization and Security | Access controls and security requirements |
| 09 — Business Rules and State Machines | Valid transitions and business invariants |
| 10 — Error Handling, Observability and Reliability | Operational failure handling |
| 11 — Testing Strategy and Quality Gates | Test coverage and release blockers |
| 12 — UI/UX Design Specification | Interface behavior and consistency |
| 13 — Technical Decisions and ADRs | Accepted and deferred technical decisions |
| 14 — MVP Scope and Release Plan | Release scope and exclusions |
| 15 — Implementation Roadmap | Dependencies and delivery order |
| 16 — Repository Structure and Development Workflow | Code organization and Git conventions |
| 17 — Development Environment and Local Setup | Reproducible development setup |

---

## 3. Critical Decisions That Must Be Resolved First

These affect database structure, API contracts, or financial correctness. They must be decided before implementing the dependent features.

### 3.1 Orders, Table Sessions, and Bills

Define how orders, table sessions, and bills relate to each other.

Answer these questions:
- Can one table session contain multiple orders? *(Yes, expected)*
- Can one bill include multiple orders? *(Needs decision)*
- Can a table session have multiple bills? *(Needs decision)*
- Are split bills required in the MVP? *(Deferred — but confirm)*
- What happens when a new order arrives after a bill is finalized?
- Under what conditions can a table session be closed?

**Required outcome:** One documented model, reflected consistently in the database, API, and billing rules.

---

### 3.2 Customer and Guest Identity

Define how customers are identified for pre-orders, QR ordering, and reservations.

Answer these:
- Is account creation required to place an order?
- How does a customer access their order status?
- Do QR orders require contact information?
- How are reservations linked to customers?
- How is unauthorized access to another customer's order prevented?

**Required outcome:** A clear identity and authorization model for each customer workflow.

---

### 3.3 Reservation Allocation

Choose the initial reservation model:
- **Capacity-based** — X seats available, allocate to requests
- **Specific-table** — each reservation is for a specific table
- **Hybrid** — specific table but supports combined tables

Then define: reservation duration, overlap rules, temporary holds, expiry, cancellation, and capacity enforcement.

**Required outcome:** A database-backed concurrency strategy with tests proving simultaneous bookings cannot exceed permitted capacity.

---

### 3.4 Order and Payment Lifecycle

Resolve the relationship between order completion, bill finalization, payment status, and table-session closure.

Define:
- Which order states are permitted and their valid transitions
- When cancellation is allowed
- When an order becomes billable
- How partial payments are represented (if supported)
- How duplicate provider events are handled
- How uncertain payment outcomes are reconciled
- Whether refunds are part of the initial release

**Required outcome:** Explicit state transitions and transaction boundaries with no contradictory rules.

---

### 3.5 Inventory Rules

Confirm: does the MVP support only manual stock movements, or automatic ingredient consumption through recipes?

Define:
- When stock changes become effective
- Whether negative stock is permitted
- How stock adjustments are authorized
- How duplicate movements are prevented
- How reversals and corrections are recorded

**Required outcome:** A consistent inventory model with auditable stock changes.

---

## 4. API and Database Consistency Review

Review the API specification (doc 07) and database design (doc 06) together.

Verify that:
- [ ] Every required API endpoint maps to a defined use case
- [ ] Request and response fields agree with the data model
- [ ] All restaurant-owned resources enforce ownership and authorization
- [ ] Database constraints support business invariants
- [ ] Idempotency behavior is defined for retry-sensitive operations
- [ ] Monetary values use a consistent exact representation
- [ ] Timestamps and restaurant-local scheduling use consistent timezone rules
- [ ] Error codes and HTTP status codes are consistent across all endpoints
- [ ] Payment provider events are verified before authoritative state changes
- [ ] State-history records are written consistently with their associated state changes

Resolve conflicting endpoint methods, ambiguous request fields, and incomplete relationships before implementing the affected module.

---

## 5. Security Review

The initial release must satisfy all of these:

- [ ] Staff routes require authentication
- [ ] Every protected operation checks the relevant permission
- [ ] Restaurant ownership is enforced by the backend
- [ ] Customer-facing tokens do not grant unintended access
- [ ] Input validation is applied at API boundaries
- [ ] Authentication and verification endpoints are rate-limited
- [ ] Secrets are stored outside source control
- [ ] Sensitive data is excluded from logs
- [ ] Payment events are verified using the selected provider's documented mechanism
- [ ] Database credentials follow least-privilege principles
- [ ] Critical security failures are covered by automated tests

---

## 6. Architecture Review

Confirm these decisions before implementation:

- [ ] The application uses a modular monolith (not microservices)
- [ ] Frontend and backend responsibilities are clearly separated
- [ ] Backend modules have explicit ownership
- [ ] Cross-module operations use defined interfaces
- [ ] PostgreSQL transactions protect critical business invariants
- [ ] Schema changes use version-controlled migrations
- [ ] External provider calls are NOT made inside long-running database transactions
- [ ] Background jobs and real-time updates use the simplest architecture that meets requirements
- [ ] Deployment and recovery procedures are defined before a real restaurant pilot

> Microservices, complex event infrastructure, and premature scaling are NOT release requirements.

---

## 7. MVP Scope Verification

Confirm the first release includes all of these:

- [ ] Staff authentication and authorization
- [ ] Restaurant and menu management
- [ ] Table management and QR access
- [ ] Pre-ordering
- [ ] QR-based table ordering
- [ ] Waiter-assisted ordering
- [ ] Kitchen ticket management
- [ ] Reservation creation and management
- [ ] Bill generation and finalization
- [ ] Cash payment recording
- [ ] Online payment integration in test mode (if retained in approved MVP)
- [ ] Basic inventory tracking
- [ ] Essential operational reports
- [ ] Automated tests for critical workflows
- [ ] A reproducible demonstration environment

> Features classified as post-MVP must not become accidental dependencies of the first release.

---

## 8. Implementation Readiness Checklist

### Product and Design
- [ ] MVP acceptance criteria are approved
- [ ] Primary user journeys are internally consistent
- [ ] Page inventory covers all required workflows
- [ ] Empty, loading, error, and conflict states are specified

### Architecture and Data
- [ ] Module boundaries are approved
- [ ] Critical domain relationships are finalized
- [ ] Database constraints and indexes are reviewed
- [ ] API contracts agree with the database model
- [ ] Critical state transitions are documented
- [ ] Foundational ADRs are accepted

### Security and Reliability
- [ ] Authentication and authorization policies are defined
- [ ] Tenant isolation is included in the design
- [ ] Idempotency and concurrency requirements are documented
- [ ] Backup and recovery expectations are defined
- [ ] Testing and release gates are approved

### Development Readiness
- [ ] Repository structure is approved
- [ ] Local setup is reproducible
- [ ] Dependency versions and package scripts are established
- [ ] Database migration workflow is defined
- [ ] Git and code-quality conventions are documented
- [ ] The first implementation milestone has explicit acceptance criteria

---

## 9. Review Findings Register

Record each inconsistency or unresolved issue here. Update during review.

| ID | Finding | Severity | Affected Docs | Required Action | Status |
|---|---|---|---|---|---|
| REV-001 | Orders, sessions, and bills relationship | Critical | 06, 07, 09, 14 | Finalize and align contracts | Open |
| REV-002 | Customer and guest identity model | High | 06, 07, 08, 14 | Define identity and access rules | Open |
| REV-003 | Reservation allocation strategy | Critical | 06, 07, 09 | Define concurrency-safe allocation | Open |
| REV-004 | Payment and bill state consistency | Critical | 06, 07, 09, 14 | Align state transitions and transactions | Open |
| REV-005 | Inventory deduction policy | High | 06, 09, 14 | Confirm manual vs. recipe-based tracking | Open |
| REV-006 | API contract inconsistencies | High | 06, 07, 09 | Resolve methods, fields, and error responses | Open |

> Add new findings as contradictions are discovered. Do not assume this list is exhaustive.

---

## 10. Sign-off Criteria

Planning can be approved when:

1. All critical findings are resolved
2. High-severity findings affecting MVP functionality are resolved or explicitly deferred (with their dependent features excluded)
3. Accepted technical decisions are recorded in the ADR register
4. Database, API, and business-rule specifications are consistent
5. The MVP scope and acceptance criteria are approved
6. The development environment and testing workflow are reproducible
7. The first implementation milestone is ready to execute

### Approval Record

| Area | Status |
|---|---|
| Product scope | Pending review |
| Architecture | Pending review |
| Database and API contracts | Pending review |
| Security and testing | Pending review |
| Implementation readiness | Pending review |
| Review date | Not yet recorded |

---

## 11. Final Gate

> **Planning complete ≠ Implementation ready.**

Once all review findings are resolved:
1. Begin implementation with **Phase 1 (Foundation)** only
2. Do NOT start all modules simultaneously
3. First milestone: repository, app config, database connectivity, migration workflow, validation conventions, and automated quality checks
4. Only after the foundation passes its acceptance criteria should feature development proceed

**End of planning documentation.**