# Technical Decisions & Architecture Decision Records (ADRs)

**Project:** Restaurant Operating System  
**Document ID:** ARCH-013  
**Status:** Draft — Pending Review  
**Last Updated:** 2026-10-13

---

## 1. Purpose

This document records the technical decisions that shape the Restaurant Operating System's architecture, implementation, security, reliability, and long-term maintainability.

The objectives are to:

- Avoid inconsistent technical choices across modules.
- Document why a decision is being considered.
- Identify trade-offs and alternatives.
- Separate confirmed decisions from proposals and unresolved questions.
- Make future architectural changes traceable.
- Keep the system suitable for a college project while preserving a credible path toward a commercial SaaS product.

This document does not authorize implementation by itself. Proposed decisions must be reviewed before the relevant feature is implemented.

## 2. Decision Status

Every architectural decision must use one of these statuses:

| Status | Meaning |
|---|---|
| Proposed | A recommended approach awaiting review. |
| Accepted | Reviewed and approved for implementation. |
| Rejected | Considered and deliberately not selected. |
| Superseded | Replaced by a later decision. |
| Deferred | Intentionally postponed until more information is available. |

A technology mentioned in an earlier document is not automatically an accepted decision.

## 3. Decision-Making Principles

Technical decisions should be evaluated using the following principles:

1. **Correctness before convenience:** Orders, reservations, inventory movements, and payments must preserve business invariants.
2. **Simplicity before premature scale:** Prefer a modular monolith over distributed services until measurable requirements justify additional complexity.
3. **Explicit ownership:** Every module must have clear responsibilities and controlled access to other modules' data.
4. **Transactional integrity:** Operations that must succeed or fail together should use database transactions.
5. **Idempotent operations:** Safe retries must not create duplicate orders, reservations, payments, or stock movements.
6. **Security by default:** Authentication, authorization, validation, and tenant isolation must be designed into the system.
7. **Observable behavior:** Important operations and failures must be diagnosable without exposing sensitive information.
8. **Reversible choices where practical:** Prefer decisions that can be changed without rewriting the entire application.
9. **Evidence over assumptions:** Validate significant choices with prototypes, tests, provider documentation, or measured operational needs.

## 4. ADR Template

Every significant architectural decision should be recorded using this structure:

### ADR-XXX: Decision Title

- **Status:** Proposed / Accepted / Rejected / Superseded / Deferred
- **Date:** YYYY-MM-DD
- **Decision owner:** Project owner
- **Related documents:** Relevant document paths

**Context**

Describe the problem, constraints, and reason a decision is necessary.

**Options considered**

List the realistic alternatives.

**Decision**

State the selected approach, or identify what remains unresolved.

**Consequences**

Describe benefits, costs, limitations, migration implications, and operational responsibilities.

**Validation**

Define how the decision will be tested or reviewed.

**Revisit when**

Identify the evidence or condition that would justify reconsidering the decision.

---

## 5. Initial Architecture Decision Register

The following entries are proposals unless explicitly marked otherwise. No entry should be treated as accepted until it has been reviewed.

### ADR-001: Application Architecture

**Status:** Proposed

**Context:** The product contains related modules for menu management, orders, kitchen operations, tables, reservations, billing, payments, inventory, and reporting.

**Options considered:**
- Modular monolith
- Microservices
- Serverless functions as the primary architecture

**Proposed decision:** Use a modular monolith with separately organized frontend and backend applications.

The backend should have explicit module boundaries and should not allow arbitrary cross-module database access.

**Consequences:**
- Easier local development, debugging, deployment, and transactional consistency.
- Lower operational complexity for a solo developer.
- Modules can be extracted later if independent scaling or organizational needs justify it.
- Module boundaries must be enforced through code structure and tests.

**Validation:** Demonstrate that modules can be developed and tested independently while participating in shared database transactions where required.

### ADR-002: Technology Stack

**Status:** Proposed

**Proposed stack:**

| Layer | Technology |
|---|---|
| Customer and staff interface | Next.js, React, TypeScript |
| Backend API | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM and migrations | Prisma |
| Runtime request validation | Zod |
| API contract | REST, JSON |
| Version control | Git and GitHub |

**Context:** The stack must support complex business rules, relational data, strong validation, practical development speed, and demonstrable engineering depth.

**Consequences:**
- TypeScript provides shared language familiarity across frontend and backend.
- PostgreSQL supports relational integrity and transactions.
- Prisma improves developer productivity but does not replace SQL knowledge or database constraints.
- Express provides flexibility but requires deliberate conventions for middleware, errors, validation, and module organization.

**Validation:** Build a small technical proof of concept covering authentication, a database migration, request validation, and a transactional order operation before committing to the complete implementation.

### ADR-003: API Versioning and Contract

**Status:** Proposed

**Proposed decision:** Prefix the backend API with `/api/v1`.

Use JSON requests and responses, consistent error formats, and explicit request validation.

Breaking changes to the public API should require a versioning decision rather than silently changing existing contracts.

**Consequences:** Clear API evolution and easier frontend/backend coordination. Versioning does not replace backward-compatible changes or contract testing.

**Validation:** Document representative success, validation-failure, authorization-failure, and conflict responses.

### ADR-004: Identifier Strategy

**Status:** Proposed

**Proposed decision:** Use UUID identifiers for primary keys and externally exposed resource IDs.

**Rationale:**
- IDs are difficult to enumerate compared with sequential integers.
- They support independent record creation across application modules.
- They reduce the need to expose internal record counts.

**Consequences:** UUIDs are larger than integer identifiers and do not themselves provide authorization or prevent IDOR vulnerabilities.

**Validation:** Ensure every resource endpoint performs authorization and restaurant-ownership checks independently of ID unpredictability.

### ADR-005: Monetary Representation

**Status:** Proposed

**Context:** The platform must handle menu prices, taxes, discounts, bills, payments, deposits, and refunds.

**Proposed decision:**
- Use exact decimal database types or an equivalent rigorously defined integer-minor-unit strategy.
- Never use binary floating-point arithmetic for authoritative monetary calculations.
- Define currency and rounding rules explicitly.
- Represent monetary API values as decimal strings or another documented lossless format.
- Store the currency alongside monetary amounts wherever the business model requires it.

**Consequences:** Exact calculations are more reliable, but tax and rounding rules must be implemented consistently across orders, bills, payments, and refunds.

**Validation:** Test fractional tax rates, discounts, rounding boundaries, partial payments, and refund calculations.

**Open decision:** Confirm the database representation and the canonical monetary API format before implementation.

### ADR-006: Time and Time Zones

**Status:** Proposed

**Proposed decision:**
- Store event timestamps as UTC-aware timestamps.
- Store each restaurant's configured IANA time-zone identifier, such as `Asia/Kolkata`.
- Interpret reservation times, opening hours, and business-day reports in the restaurant's configured time zone.
- Return timestamps through a consistent documented API format.

**Consequences:** UTC storage simplifies event ordering, while local-time conversion preserves correct restaurant operations and reporting.

**Validation:** Test reservation boundaries around midnight, restaurant business-day boundaries, and time-zone conversion.

### ADR-007: Staff Authentication and Sessions

**Status:** Proposed

**Context:** Restaurant employees need authenticated access to operational interfaces.

**Proposed decision:** Evaluate server-managed sessions using secure, HTTP-only cookies as the initial staff authentication approach.

The implementation must address:
- Secure cookie settings appropriate to the deployment environment.
- Session expiration and revocation.
- CSRF protection where applicable.
- Login rate limiting.
- Password hashing using a suitable password-hashing algorithm.
- Role-based authorization and restaurant-level access checks.

**Consequences:** Server-managed sessions provide straightforward revocation and avoid exposing long-lived bearer tokens to frontend JavaScript.

**Open decisions:**
- Session storage implementation.
- Session lifetime and renewal policy.
- Staff account recovery and password-reset process.
- Customer and guest identity model.
- Whether customers need accounts at all for the MVP.

**Validation:** Test session expiration, logout, revoked sessions, CSRF defenses, and unauthorized cross-restaurant access.

### ADR-008: Request Validation

**Status:** Proposed

**Proposed decision:** Use Zod schemas at the API boundary to validate request bodies, query parameters, and path parameters.

Validation must be supplemented by:
- Domain-level business-rule checks.
- Database constraints.
- Authorization checks.
- Transactional invariant enforcement.

**Consequences:** Invalid input is rejected early, but schema validation alone cannot prevent race conditions or enforce all business rules.

**Validation:** Maintain consistent validation-error responses and tests for malformed and semantically invalid requests.

### ADR-009: Idempotency

**Status:** Proposed

**Context:** Clients and external providers may retry requests after timeouts, network failures, or uncertain responses.

**Proposed decision:** Implement idempotency for operations where duplicate execution could create financial, operational, or customer-facing problems.

Initial candidates include:
- Order creation.
- Reservation creation and confirmation.
- Payment initiation.
- Refund initiation.
- Inventory adjustments and other retry-sensitive stock operations.

An idempotency record should be scoped appropriately, associated with the request identity or operation, and protected by database uniqueness constraints.

**Consequences:** Retries can return a previously recorded outcome rather than duplicating an operation. The design must define key retention, request fingerprinting, conflict behavior, and recovery from incomplete processing.

**Validation:** Send concurrent duplicate requests and verify that they cannot create duplicate business records or external financial actions.

### ADR-010: Transactions and Concurrency

**Status:** Proposed

**Proposed decision:** Use PostgreSQL transactions for operations that must preserve related business invariants.

Examples:
- Creating an order and its line-item snapshots.
- Updating order status and recording status history.
- Finalizing a bill and creating its bill-item snapshots.
- Recording inventory movements and updating any maintained balance projection.
- Applying a verified payment event to the associated payment and bill.

Use database constraints, conditional updates, row locks, or suitable isolation levels according to the specific operation.

**Consequences:** Correctness improves, but long-running external network calls must not be performed inside database transactions.

**Validation:** Write concurrency tests against a real PostgreSQL test database. Test simultaneous requests, transaction rollback, duplicate events, and conflicting updates.

### ADR-011: Reservation Capacity and Double Booking

**Status:** Proposed

**Context:** Concurrent reservation requests may attempt to occupy the same capacity or table.

**Proposed direction:** Make reservation capacity enforcement a database-backed invariant, not merely a frontend availability check.

The final implementation must select an explicit allocation model:
- Specific-table allocation.
- Capacity-based allocation.
- A hybrid model supporting tables that can be combined.

The concurrency strategy must match the selected model. Depending on that model, it may use locking, serializable transactions, exclusion constraints, or another proven database-backed mechanism.

**Consequences:** Availability checks may become temporarily stale under concurrent demand. The booking transaction must remain authoritative.

**Open decision:** Choose the allocation model and its concurrency mechanism before implementing reservation creation.

**Validation:** Run concurrent booking tests that attempt to exceed the permitted capacity and verify that no conflicting confirmed reservations are created.

### ADR-012: Real-Time Updates

**Status:** Proposed — Deferred

**Options considered:**
- Client polling.
- Server-Sent Events (SSE).
- WebSockets.

**Proposed direction:** Start with the simplest transport that satisfies measured operational needs.

SSE may suit one-way updates such as kitchen ticket changes and order status notifications. WebSockets may be justified if genuine bidirectional real-time interactions become necessary. Polling remains a viable early option for less time-sensitive screens.

**Open decision:** Select the transport after defining update frequency, client requirements, deployment constraints, and reconnection behavior.

**Validation:** Prototype kitchen and order-status updates under realistic local test conditions.

### ADR-013: Background Jobs and Transactional Outbox

**Status:** Proposed — Deferred

**Context:** The system may need to send OTPs, process provider events, reconcile payments, expire reservation holds, send notifications, and perform scheduled inventory or reporting tasks.

**Proposed direction:** Begin with a clearly defined job-processing mechanism appropriate to the MVP.

Use a transactional outbox if reliable delivery of database-committed events is required. Do not introduce an outbox merely as an architectural decoration.

**Consequences:** Background processing improves responsiveness and supports retries, but requires retry policies, duplicate handling, observability, and dead-letter or recovery procedures where appropriate.

**Open decisions:**
- Job runner and scheduling mechanism.
- Whether an outbox is necessary for the first release.
- Delivery guarantees for each job.
- Retry and failure-recovery policies.

**Validation:** Test process restarts, duplicate job execution, provider timeouts, and recovery after partial failures.

### ADR-014: Payment Provider Integration

**Status:** Proposed — Deferred

**Context:** The product must support cash and online payments, including UPI-compatible payment methods where supported by the chosen provider.

**Proposed direction:** Integrate one suitable provider for the initial release rather than building a provider abstraction before there is a concrete need.

The payment module must:
- Verify provider events using the provider's documented security mechanism.
- Treat verified server-side provider events as authoritative.
- Handle duplicate and out-of-order events.
- Reconcile uncertain payment outcomes.
- Keep payment state distinct from bill state.
- Record refund operations and their outcomes separately.

**Open decision:** Select the provider after reviewing supported payment methods, test-mode availability, fees, onboarding requirements, webhook behavior, and refund capabilities.

**Validation:** Use sandbox or test-mode transactions for success, failure, timeout, duplicate-event, and refund scenarios.

### ADR-015: OTP and Notification Providers

**Status:** Proposed — Deferred

**Context:** Reservation verification and customer notifications may require OTP delivery.

**Proposed direction:** Isolate the delivery provider behind a small application-level interface. Keep provider-specific API details out of reservation domain logic.

**Open decisions:**
- SMS, email, or another supported channel for the MVP.
- Provider selection and credentials.
- OTP expiry, resend limits, attempt limits, and cost controls.
- Delivery failure and fallback behavior.

**Validation:** Test expiry, incorrect codes, repeated attempts, resend abuse, delivery failures, and provider timeouts.

### ADR-016: Testing Stack and Quality Gates

**Status:** Proposed

**Proposed tools:**
- Vitest for unit and integration tests.
- React Testing Library for interface behavior.
- Playwright for end-to-end browser tests.
- A real PostgreSQL test database for database-dependent behavior.
- Automated checks in CI.

The exact tool versions and configuration will be established during implementation planning.

**Proposed quality requirements:**
- Business-critical state transitions must have explicit tests.
- Database constraints and concurrency behavior must be tested.
- Payment and reservation flows must have end-to-end coverage.
- Security and authorization checks must be tested.
- Type checking, linting, migration checks, and relevant automated tests must pass before release.

Coverage percentages are secondary to testing important behaviors and failure modes.

**Validation:** Establish a reproducible test command sequence and a documented release gate.

### ADR-017: Logging and Observability

**Status:** Proposed

**Proposed decision:** Start with structured application logs, request correlation IDs, actionable health checks, and a small set of business-critical metrics.

Track operational signals such as:
- API error and latency rates.
- Database connection failures.
- Failed background jobs.
- Reservation conflicts.
- Payment reconciliation discrepancies.
- Kitchen or order update delivery failures.

Never log passwords, OTPs, authentication secrets, full payment credentials, or unnecessary personal information.

**Consequences:** This provides practical debugging capability without requiring a complex observability platform from day one.

**Open decision:** Select the specific logging, error-reporting, and monitoring services after deployment needs are known.

**Validation:** Simulate a failed order operation and verify that it can be traced across logs without exposing sensitive data.

### ADR-018: Deployment and Environment Configuration

**Status:** Proposed — Deferred

**Context:** The application needs a reliable deployment path for a demo and potentially for an initial restaurant pilot.

**Proposed direction:** Select a deployment setup that supports the frontend, API, managed PostgreSQL, environment secrets, HTTPS, migrations, backups, and background processing where required.

Avoid selecting hosting purely because it offers the easiest initial deployment.

**Open decisions:**
- Frontend hosting.
- API hosting.
- PostgreSQL hosting and backup strategy.
- Background worker hosting, if needed.
- Domain, environment separation, and deployment rollback process.

**Validation:** Deploy a staging environment, execute database migrations safely, verify health checks, and rehearse restoring a backup.

### ADR-019: Frontend Styling and Component System

**Status:** Proposed — Deferred

**Context:** The product includes customer ordering screens and operational interfaces used by restaurant staff under time pressure.

**Options considered:**
- Tailwind CSS with a small custom component system.
- A component library with theme customization.
- A hybrid approach.

**Proposed direction:** Use a consistent, accessible component system that supports fast operational workflows, responsive customer ordering, and maintainable visual patterns.

**Open decision:** Finalize the styling approach and component-library choice after reviewing the UI/UX specification and building a small visual prototype.

**Validation:** Evaluate forms, tables, dialogs, menu cards, kitchen tickets, and mobile QR-ordering screens for consistency and usability.

### ADR-020: Tenant Isolation and Restaurant Ownership

**Status:** Proposed

**Context:** The initial deployment may serve one restaurant, but the long-term product direction allows multiple restaurants to use the same application.

**Proposed decision:** Model restaurant ownership explicitly in the data model and enforce access boundaries in the backend from the beginning.

Every restaurant-owned resource must be accessed through an authorized restaurant context. Client-provided restaurant identifiers must not be trusted as proof of authorization.

**Consequences:** Tenant-aware design adds some initial discipline but reduces the risk of a costly security redesign during SaaS expansion.

**Validation:** Include tests that attempt to access orders, bills, tables, reservations, and inventory belonging to another restaurant.

### ADR-021: Database Migrations and Schema Evolution

**Status:** Proposed

**Proposed decision:** Use version-controlled Prisma migrations for schema changes.

Rules:
- Do not rely on automatic schema synchronization in production.
- Review generated migrations before applying them.
- Test migrations against a representative database.
- Use backward-compatible migration steps when old and new application versions may overlap.
- Define rollback or forward-recovery steps for risky migrations.
- Never treat deleting production data as a routine rollback strategy.

**Validation:** Verify that a clean database can be created from migrations and that an existing test database can be upgraded safely.

### ADR-022: Synthetic Data and Demonstration Environment

**Status:** Proposed

**Context:** The project must be demonstrable without depending on a large number of real customers or restaurants.

**Proposed decision:** Provide a controlled demonstration environment using synthetic restaurant data, menu items, tables, orders, reservations, inventory records, and kitchen tickets.

Synthetic data must be clearly distinguishable from production data. Demonstration payment flows must use test mode and must not claim that real money was transferred.

**Consequences:** The project can be evaluated through realistic workflows, seeded scenarios, and repeatable test cases without exposing real customer information.

**Validation:** Rehearse a complete demo covering pre-ordering, QR ordering, kitchen workflow, billing, reservation handling, and an inventory movement.

---

## 6. Decision Dependencies

Some decisions must be resolved before related implementation begins.

| Decision | Must be resolved before |
|---|---|
| Staff authentication and session policy | Staff login and protected operational routes |
| Guest identity model | Customer order history, order lookup, and guest access |
| Bill and table-session relationship | Billing and checkout implementation |
| Reservation allocation model | Reservation confirmation and concurrent booking |
| Payment provider | Live online payments |
| OTP delivery provider | Production reservation verification |
| Inventory deduction timing | Recipe-based stock consumption |
| Real-time transport | Production kitchen and order-status updates |
| Deployment and backups | Public pilot with real operational data |
| Frontend styling approach | Building the full UI component system |

A decision may remain deferred if its dependent feature is explicitly excluded from the MVP.

## 7. Review and Change Process

Before accepting a proposed decision:

1. Confirm the underlying requirement.
2. Compare realistic alternatives and their trade-offs.
3. Identify affected documents and modules.
4. Define a validation method.
5. Mark the ADR as Accepted, Rejected, or Deferred.
6. Update dependent specifications if the decision changes an existing contract.

When an accepted decision is replaced:
- Do not silently rewrite history.
- Mark the old ADR as Superseded.
- Create a new ADR that references the previous one.
- Document migration and compatibility implications.

## 8. Current Review Checklist

- [ ] Review modular monolith boundaries.
- [ ] Confirm the proposed application stack.
- [ ] Finalize monetary representation.
- [ ] Finalize guest identity and staff session policies.
- [ ] Confirm API versioning and error conventions.
- [ ] Define idempotency scope and retention.
- [ ] Select the reservation allocation and concurrency model.
- [ ] Decide whether the MVP needs an outbox or dedicated job worker.
- [ ] Choose the initial real-time update approach.
- [ ] Select payment and OTP providers before integrating them.
- [ ] Confirm testing and release gates.
- [ ] Select deployment, monitoring, and backup services.
- [ ] Finalize the frontend styling approach.
- [ ] Verify restaurant-level tenant isolation.
- [ ] Define synthetic demo data and test scenarios.

## 9. Definition of Done

This document is ready for implementation planning when:

- Each foundational decision is marked Accepted, Rejected, or Deferred.
- Every deferred decision has a clear reason and a resolution trigger.
- No accepted decision contradicts the PRD, database design, API specification, security plan, or business rules.
- High-risk decisions have explicit validation plans.
- Implementation dependencies are understood.
