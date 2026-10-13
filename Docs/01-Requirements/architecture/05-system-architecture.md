# Restaurant OS — System Architecture & Technical Design

**Document ID:** ROS-ARCH-005  
**Version:** 1.0  
**Status:** Draft — Pending Review  
**Parent Documents:**
- 01-product-discovery.md
- 02-product-requirements.md
- 03-user-journeys-and-workflows.md
- 04-ux-information-architecture.md

---

## 1. Purpose

This document defines the proposed technical architecture of Restaurant OS.

It describes the application's architectural style, module boundaries, request flows, data ownership, real-time communication, transaction requirements, external integrations, deployment approach, security boundaries, and failure-recovery strategy.

The architecture must support a reliable single-restaurant MVP while avoiding unnecessary complexity and preserving a path toward multi-restaurant SaaS.

This document describes architectural decisions and constraints. It does not contain implementation code.

## 2. Architecture Goals

The architecture must:

1. Maintain consistent operational data across customer, waiter, kitchen, cashier, and administrator interfaces.
2. Prevent duplicate order creation during retries.
3. Protect reservations against concurrent confirmation conflicts.
4. Maintain accurate order, bill, payment, and inventory records.
5. Support live kitchen updates with recovery after disconnection.
6. Enforce server-side authentication and authorization.
7. Keep business rules separate from UI implementation.
8. Support automated testing of critical workflows.
9. Remain manageable for a solo developer.
10. Allow future multi-tenant expansion without requiring an immediate microservices architecture.

## 3. Architectural Style

### Decision: Modular Monolith

The initial system will use a modular monolith.

The backend will be one deployable application divided into clearly defined business modules.

### Why this approach?

A modular monolith provides:

- Straightforward local development.
- Transactional access to PostgreSQL.
- Fewer deployment and networking concerns.
- Simpler debugging and integration testing.
- Clear module boundaries without distributed-system complexity.
- A future migration path if independently scaling a module becomes necessary.

Microservices are explicitly excluded from the initial architecture.

The application must not be split into separate services merely to appear production-grade. Service separation should be justified by real operational needs.

## 4. High-Level Architecture

The system will contain the following logical layers:

### 4.1 Presentation Layer

Responsibilities:

- Render customer and staff interfaces.
- Collect user input.
- Display persisted state and live updates.
- Handle loading, error, pending, and success states.
- Maintain local UI state such as cart selections.

Technology:

- Next.js
- React
- TypeScript

The presentation layer must not be the authority for pricing, authorization, reservation availability, payment status, or inventory balances.

### 4.2 API Layer

Responsibilities:

- Expose versioned HTTP endpoints.
- Authenticate requests.
- Validate request payloads.
- Enforce authorization.
- Apply request-level idempotency where required.
- Translate application results into consistent HTTP responses.
- Publish authorized operational updates.

Technology:

- Node.js
- Express
- TypeScript
- Zod for input validation

### 4.3 Application and Domain Layer

Responsibilities:

- Implement business workflows.
- Enforce valid state transitions.
- Calculate trusted order and bill totals.
- Coordinate transactions.
- Apply reservation and inventory rules.
- Integrate with external providers.
- Record audit events.

Business logic must not be scattered across route handlers or React components.

### 4.4 Persistence Layer

Responsibilities:

- Store operational records.
- Enforce relationships and constraints.
- Execute transactions.
- Support concurrency control.
- Maintain durable historical records.

Technology:

- PostgreSQL
- Prisma ORM
- Versioned database migrations

Critical concurrency behaviour may require database constraints, explicit transactions, row-level locking, or carefully designed SQL operations. An ORM alone does not guarantee correctness.

### 4.5 External Integrations

Expected integrations:

- OTP/SMS provider.
- Online payment provider supporting applicable payment methods.
- Hosting and monitoring services.
- Optional email provider if required by later workflows.

External integrations must be accessed through isolated adapters rather than being deeply coupled to business modules.

## 5. Proposed Module Boundaries

### MOD-01 — Identity and Access

Owns:

- Staff accounts.
- Authentication.
- Roles and permissions.
- Session or token lifecycle.
- Protected access policies.

### MOD-02 — Restaurant Configuration

Owns:

- Restaurant information.
- Operating hours.
- Currency and time zone.
- Ordering and service policies.
- Reservation configuration.

### MOD-03 — Menu and Catalog

Owns:

- Menu categories.
- Menu items.
- Prices.
- Modifiers.
- Publication and availability.

### MOD-04 — Tables and Service Sessions

Owns:

- Tables.
- Table capacity.
- QR link association.
- Active dining sessions.
- Table service status.

### MOD-05 — Ordering

Owns:

- Orders.
- Order items.
- Order source.
- Historical item and price snapshots.
- Order state transitions.
- Idempotent order creation.

### MOD-06 — Kitchen Operations

Owns:

- Kitchen tickets.
- Preparation stations where enabled.
- Item-level preparation status.
- Kitchen transition history.

### MOD-07 — Reservations

Owns:

- Reservation requests.
- Verification state.
- Temporary holds.
- Confirmed bookings.
- Table assignment.
- Cancellation and no-show outcomes.

### MOD-08 — Billing

Owns:

- Bills.
- Bill items and applicable charge snapshots.
- Outstanding balances.
- Bill settlement status.

### MOD-09 — Payments

Owns:

- Payment attempts.
- Provider references.
- Verified payment events.
- Refund records.
- Payment reconciliation.

### MOD-10 — Inventory

Owns:

- Ingredients.
- Units of measurement.
- Recipe definitions and versions.
- Stock movements.
- Inventory adjustments.
- Stock balance calculations.

### MOD-11 — Audit and Reporting

Owns:

- Sensitive-action history.
- Operational reporting queries.
- Authorized access to historical records.

Reporting must not become a second source of truth for operational data.

## 6. Module Communication Rules

Modules will communicate through explicit application-level interfaces.

For example:

- Ordering reads trusted menu and availability information.
- Accepted orders generate kitchen work.
- Eligible order events trigger inventory movements.
- Billing consumes eligible order items and applicable price snapshots.
- Payments update payment records and billing balances through defined workflows.
- Reservations coordinate table capacity and reservation policies.
- Audit records capture important actions from multiple modules.

Modules must not update one another's data through arbitrary direct queries scattered throughout the application.

Cross-module operations must have clearly defined transaction boundaries and failure behaviour.

## 7. Main Request Flows

### 7.1 QR Order Flow

1. Customer opens a table-specific QR link.
2. Next.js loads the customer ordering interface.
3. The browser requests the menu and eligible table context from the API.
4. Customer submits the cart with an idempotency key.
5. API authenticates or validates the permitted customer context.
6. API validates table eligibility, item availability, quantities, and modifiers.
7. Ordering calculates authoritative prices.
8. PostgreSQL transaction persists the order, item snapshots, and required related records.
9. The transaction commits.
10. The system makes eligible kitchen work available.
11. The API returns the order reference and current state.
12. Connected clients receive authorized status updates.

A successful database commit is the point at which the order becomes durably accepted by the system.

The UI must not report a confirmed order before receiving a reliable result.

### 7.2 Waiter-Assisted Order Flow

1. Waiter authenticates.
2. Waiter selects a table or permitted ordering context.
3. API verifies permissions and table/session eligibility.
4. Waiter submits the selected items.
5. Ordering applies the same validation and pricing rules used for QR orders.
6. The order is persisted transactionally.
7. Kitchen work becomes available.
8. The interface displays the confirmed result.

The order source may differ, but core order integrity rules must remain the same.

### 7.3 Reservation Flow

1. Customer requests eligible reservation availability.
2. Reservation module calculates provisional availability.
3. Customer provides booking details and completes OTP verification.
4. System revalidates availability during the confirmation workflow.
5. System creates a temporary hold or reservation request according to policy.
6. If required, the payment module initiates a deposit.
7. Reservation becomes confirmed only after all required conditions are satisfied.
8. The system records the confirmation.
9. The customer receives the final status.

Availability checks performed before confirmation must not be treated as permanent guarantees.

### 7.4 Payment Flow

1. Cashier or customer requests payment for an eligible bill.
2. Billing verifies the outstanding balance.
3. Payment module creates a payment attempt with a unique internal reference.
4. The selected provider processes the request.
5. Provider sends a payment result through its documented mechanism.
6. The backend verifies the event.
7. The system records the event idempotently.
8. Payment status and bill balance are updated according to the defined transaction strategy.
9. The interface displays the verified result.

The browser's redirect or success page is not authoritative proof of payment.

### 7.5 Inventory Flow

1. An eligible order event reaches the defined inventory deduction point.
2. The inventory module resolves the applicable recipe version.
3. Required ingredient quantities are calculated using consistent units.
4. The system records stock movements transactionally.
5. Relevant stock balances are updated or recalculated.
6. Repeated delivery of the same logical event does not duplicate deductions.
7. Authorized adjustments create additional traceable movements.

The exact deduction point must be finalized in the business rules.

## 8. Database Transaction Strategy

PostgreSQL will be the authoritative operational data store.

### 8.1 Atomic Operations

The following operations require explicit atomicity decisions:

- Creating an order and its order items.
- Creating a reservation hold and protecting its capacity.
- Creating a bill from eligible order data.
- Recording a verified payment and its financial effects.
- Recording inventory movements and associated deduplication records.
- Recording state transitions that must not be partially applied.

### 8.2 External Services

External network calls must not be treated as part of a database transaction that remains open while waiting for a response.

For example, payment-provider requests and OTP delivery should occur outside long-running database transactions.

The application must define how it handles the gap between committing internal state and receiving an external result.

### 8.3 Retry Strategy

Retries must distinguish between:

- A request that definitely failed before committing.
- A request that committed successfully but whose response was lost.
- A request whose result is still uncertain.

Idempotency records, provider references, and status reconciliation must prevent retries from duplicating business operations.

## 9. Concurrency Control

### 9.1 Duplicate Orders

Use a scoped idempotency key for applicable order submissions.

The key must be associated with the relevant operation and a stable request fingerprint.

Repeated requests with the same key and same logical payload must return the original logical result. Reuse with a conflicting payload must be rejected.

### 9.2 Reservation Conflicts

Availability checks and confirmation must be protected against concurrent bookings.

The selected implementation must use database-enforced constraints, transaction isolation, locking, or an equivalent verified strategy appropriate to the reservation model.

Temporary holds must expire according to a defined policy.

### 9.3 Inventory Deductions

A logical order event must produce no more than one corresponding stock deduction.

Inventory changes must account for concurrent updates to the same ingredient and prevent lost updates.

### 9.4 Bill and Payment Consistency

Concurrent payment attempts must not produce an incorrect settled balance.

Payment event processing must be idempotent and reconcile verified provider records with internal financial records.

### 9.5 State Transitions

State-changing operations must validate the current state and the requested transition.

Concurrent or stale requests must not overwrite newer valid states silently.

## 10. Real-Time Communication

### 10.1 Purpose

Real-time updates are required for operational interfaces where waiting for manual refresh would create unnecessary delay.

Initial use cases:

- New kitchen tickets.
- Preparation status changes.
- Customer order tracking.
- Table status updates.
- Reservation changes where relevant.
- Payment status updates where appropriate.

### 10.2 Proposed Technology

Server-Sent Events (SSE) or WebSockets may be used for live communication.

The final choice must consider the direction of communication, authorization requirements, connection management, deployment constraints, and recovery behaviour.

The initial implementation should not introduce multiple real-time technologies without a demonstrated need.

### 10.3 Delivery Rules

- Database state remains authoritative.
- Live events are notifications of persisted changes, not a substitute for persistence.
- Clients must fetch current state after reconnecting.
- Clients must tolerate duplicate or delayed events.
- Unauthorized users must not receive protected restaurant events.
- A disconnected client must not assume that no changes occurred.

### 10.4 Event Publication Reliability

If a state change commits but event publication fails, the system must have a defined recovery strategy.

A transactional outbox is a candidate approach for important operational events. It should be adopted if the chosen delivery requirements justify the added implementation complexity.

## 11. Background Processing

Background jobs may be required for:

- Expiring reservation holds.
- Processing delayed or retryable external events.
- Sending notifications.
- Reconciling payment records.
- Publishing pending operational events.
- Generating scheduled reports.

For the MVP, background processing should remain as simple as the reliability requirements allow.

Any background job that can be retried must be idempotent.

The implementation plan must define how jobs are scheduled, monitored, retried, and prevented from executing duplicate business effects.

## 12. Security Architecture

### 12.1 Trust Boundaries

The system must treat the browser, customer-submitted payloads, QR links, and external callbacks as untrusted inputs.

### 12.2 Authentication

- Staff routes require appropriate authentication.
- Customer access must use the approved ownership or secure-link model.
- Authentication state must be handled using a documented secure strategy.

### 12.3 Authorization

- Server-side permissions are mandatory.
- Restaurant ownership must be verified for every protected operational resource.
- Kitchen, cashier, waiter, and administrator permissions must be explicitly defined.
- Protected operations must not rely on hidden UI controls for security.

### 12.4 Payment Security

- Provider signatures or equivalent documented verification mechanisms must be checked.
- Sensitive payment credentials must not be stored unnecessarily.
- Card data must not be collected or stored directly unless an explicitly approved compliant architecture requires it.
- Duplicate provider events must be handled safely.

### 12.5 QR Security

- QR links identify the permitted ordering context.
- They must not expose administrative secrets or grant staff access.
- Public table identifiers must not be treated as sufficient authorization for privileged operations.

### 12.6 Auditability

Sensitive operations must record the responsible actor, affected resource, action, timestamp, and relevant non-sensitive context.

Secrets, authentication credentials, OTP values, and sensitive payment information must not be included in ordinary logs.

## 13. Error Handling and Recovery

### 13.1 Standard API Errors

API responses must use a consistent error structure containing:

- Stable error code.
- Human-readable message.
- Optional field-level validation errors.
- Correlation or request reference where appropriate.

Internal stack traces and sensitive implementation details must not be exposed to clients.

### 13.2 Client Recovery

When an operation times out:

1. The client must distinguish an uncertain result from a confirmed failure.
2. The client must check the existing operation or safely retry with the same idempotency key.
3. The interface must not create a new logical order or payment attempt unnecessarily.
4. The user must receive a clear status and recovery option.

### 13.3 Database Failure

- Failed transactions must roll back where applicable.
- The system must not report success for an uncommitted operation.
- Recovery must preserve committed records.
- Database availability and connection-pool behaviour must be monitored.

### 13.4 External Provider Failure

- OTP failures must not bypass verification.
- Payment-provider failures must not create false successful payments.
- Failed notification delivery must not corrupt operational records.
- Reconciliation procedures must resolve uncertain external outcomes.

## 14. Deployment Architecture

### 14.1 Development

- Next.js frontend.
- Express API.
- Local or managed PostgreSQL instance.
- Separate development environment variables.
- Database migrations and seeded test data.

### 14.2 Production Candidate

The deployment may use:

- A managed frontend hosting service.
- A managed Node.js runtime for the API.
- A managed PostgreSQL service.
- HTTPS for all public traffic.
- Centralized application logging.
- Database backups.
- Environment-specific secrets.

The final hosting provider and deployment topology will be selected after evaluating connection limits, persistent connections, background jobs, cost, and recovery requirements.

### 14.3 Environment Separation

The system must distinguish:

- Local development.
- Automated testing.
- Staging or controlled pilot.
- Production.

Production secrets and real customer data must not be copied into development fixtures.

## 15. Observability

The system must provide:

- Structured application logs.
- Request correlation identifiers.
- Error monitoring.
- Database health monitoring.
- Critical workflow metrics.
- Payment reconciliation visibility.
- Background job failure visibility.
- Audit records for sensitive operations.

Logs must be useful for debugging without exposing unnecessary personal or financial information.

## 16. Scalability Strategy

Initial scaling will focus on:

- Efficient database queries and indexes.
- Appropriate connection pooling.
- Stateless API request handling where possible.
- Pagination for growing record lists.
- Efficient kitchen and order queries.
- Controlled real-time connection management.
- Background processing for work that should not block interactive requests.

Multi-restaurant SaaS expansion will require additional design for tenant provisioning, isolation, configuration, billing, and tenant-aware reporting.

These capabilities are future requirements, not part of the initial operational MVP.

## 17. Architecture Decisions

| Decision | Proposed direction | Status |
|---|---|---|
| Architectural style | Modular monolith | Proposed |
| Backend | Node.js, Express, TypeScript | Proposed |
| Frontend | Next.js, React, TypeScript | Proposed |
| Database | PostgreSQL | Proposed |
| ORM | Prisma | Proposed |
| Input validation | Zod | Proposed |
| Real-time updates | SSE or WebSockets | Open |
| Reliable event publication | Transactional outbox if justified | Open |
| Background jobs | Minimal reliable job mechanism | Open |
| Authentication strategy | Secure, documented staff and customer access model | Open |
| Hosting provider | Select after deployment requirements review | Open |
| Payment provider | Select after payment and integration research | Open |

## 18. Architecture Acceptance Criteria

The architecture is ready for approval when:

1. Module responsibilities and ownership boundaries are documented.
2. Order creation has an explicit transaction and idempotency strategy.
3. Reservation concurrency protection is specified.
4. Payment event processing and reconciliation are defined.
5. Inventory movement and retry behaviour are defined.
6. Live-update delivery and reconnect behaviour are specified.
7. Authentication and restaurant-level authorization boundaries are documented.
8. External integration failure handling is defined.
9. Deployment, observability, backup, and recovery requirements are agreed.
10. Open architectural choices have explicit resolution criteria.

## 19. Open Decisions Before Detailed Database Design

1. Whether customer accounts are required or secure order-access links are sufficient.
2. How table service sessions relate to orders and bills.
3. Which reservation model is used to prevent overlapping bookings.
4. Which real-time technology fits the deployment environment.
5. Whether a transactional outbox is necessary for the first release.
6. Which payment provider and verification workflow will be used.
7. How stock movements are linked to order events.
8. How tax, rounding, discounts, and financial snapshots are represented.
9. How long operational and audit records are retained.
10. What degraded operation is expected during an internet outage.

---

**End of Document 05 — System Architecture & Technical Design**