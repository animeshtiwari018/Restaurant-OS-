# Document 11 — Testing Strategy & Quality Gates

**Project:** Restaurant OS  
**Document Type:** Quality Assurance and Testing Plan  
**Version:** 0.1 — Draft  
**Status:** Proposed; pending review  
**Stack:** Next.js, React, TypeScript, Express, PostgreSQL, Prisma, Zod

---

## 1. Purpose

This document defines the testing approach for Restaurant OS before and during implementation.

It establishes:

- Testing levels and responsibilities.
- Unit, integration, API, and end-to-end testing.
- Database and concurrency testing.
- Payment and external-provider simulation.
- Security and authorization testing.
- Accessibility and responsive UI testing.
- Test data and environment management.
- Continuous integration quality gates.
- Release acceptance criteria.

The goal is to verify that the application works correctly under normal conditions, rejects invalid operations, and preserves data integrity when requests fail or happen concurrently.

## 2. Testing Principles

### QA-001: Test business behavior, not implementation details alone

Tests must verify meaningful outcomes such as correct order totals, valid reservation capacity, and accurate outstanding balances.

### QA-002: Test failure paths

A feature is not adequately tested merely because its happy path works.

### QA-003: Protect financial and operational integrity

Orders, payments, reservations, bills, and stock movements require stronger correctness tests than ordinary presentation components.

### QA-004: Make tests repeatable

Tests must not depend on real customer data, unpredictable external services, or manual database cleanup.

### QA-005: Automate critical regression tests

Previously fixed high-impact bugs should receive regression tests so they do not silently return.

### QA-006: Do not use production data casually

Test environments must use synthetic or appropriately anonymized data.

### QA-007: Release based on evidence

A successful build does not prove that the product is ready. Release decisions must consider test results and unresolved risks.

---

## 3. Testing Pyramid

The project will use a layered testing strategy.

### Layer 1 — Static checks

Purpose: Detect basic problems before tests execute.

Includes:

- TypeScript type checking.
- Linting.
- Formatting checks.
- Dependency and secret scanning where configured.
- Build validation.

### Layer 2 — Unit tests

Purpose: Verify isolated business rules and utility functions.

Examples:

- Price calculations.
- Discount eligibility.
- Order state transitions.
- Reservation policy calculations.
- Refund limits.
- Inventory unit conversions.

Unit tests should be fast and independent of the real database.

### Layer 3 — Integration tests

Purpose: Verify that modules work correctly together.

Examples:

- Express routes and validation.
- Application services and Prisma.
- PostgreSQL transactions.
- Authorization middleware.
- Idempotency persistence.
- Payment-event deduplication.

### Layer 4 — End-to-end tests

Purpose: Verify complete user journeys through the application.

Examples:

- Customer places a pre-order.
- Customer places a QR order.
- Waiter creates an order.
- Kitchen updates ticket status.
- Staff creates and settles a bill.
- Customer creates a reservation.

### Layer 5 — Operational and exploratory testing

Purpose: Verify behavior that automated tests may not fully capture.

Examples:

- Mobile usability.
- Keyboard navigation.
- Recovery after connection loss.
- Realistic restaurant workflows.
- Error messaging.
- Deployment configuration.

The initial project should prioritize a strong set of unit and integration tests, with end-to-end tests covering the highest-risk journeys.

---

## 4. Proposed Testing Tools

The final versions must be selected during implementation setup and pinned in the project dependencies.

| Area | Proposed tool | Purpose |
|---|---|---|
| Unit and integration tests | Vitest | Fast TypeScript-compatible test runner |
| API testing | Vitest with an HTTP test client | Validate routes and responses |
| End-to-end testing | Playwright | Browser-based user journey tests |
| Component testing | React Testing Library | Verify UI behavior |
| Database integration | PostgreSQL test database | Verify real constraints and transactions |
| API input validation | Zod | Validate request contracts |
| Code quality | ESLint and TypeScript | Detect code and type issues |
| Dependency checks | Package audit/scanning tool | Identify known dependency vulnerabilities |
| CI | GitHub Actions or an equivalent CI service | Run automated checks on changes |

These are proposed tools, not a requirement to install every tool before the product design is approved.

---

## 5. Unit Testing Strategy

Unit tests should focus on deterministic business logic.

### 5.1 Pricing tests

Verify:

- Quantity multiplied by unit price.
- Modifier pricing.
- Discount application.
- Tax calculation.
- Rounding behavior.
- Zero-value and invalid quantities.
- Currency formatting boundaries.
- Total calculations using exact monetary representations.

Example scenarios:

- A valid order produces the expected subtotal.
- A discount cannot exceed the permitted limit.
- Invalid quantities are rejected.
- Changing the displayed frontend price does not change the server's authoritative price.

The approved financial rules must define the exact expected results.

### 5.2 Order state tests

Verify:

- Permitted state transitions succeed.
- Invalid transitions are rejected.
- Cancelled orders cannot continue normal fulfillment.
- Completed orders cannot be reopened through ordinary operations.
- Cancellation eligibility follows the approved policy.

### 5.3 Reservation tests

Verify:

- Party size limits.
- Operating-hour restrictions.
- Duration and buffer calculations.
- Cancellation policy.
- Deposit requirements.
- No-show eligibility.

Concurrency and actual database capacity protection must also be tested at the integration level.

### 5.4 Payment tests

Verify:

- Failed payments do not settle bills.
- Confirmed payment allocations update the outstanding balance correctly.
- Refund amounts respect the refundable limit.
- Repeated provider events do not produce duplicate financial effects.
- An unknown payment outcome is not automatically treated as a confirmed failure.

### 5.5 Inventory tests

Verify:

- Stock movement calculations.
- Unit conversions.
- Quantity precision.
- Recipe-based consumption calculations.
- Reversal and adjustment behavior.
- Negative stock policy.

Historical movements must remain consistent with the approved inventory rules.

---

## 6. Integration Testing Strategy

Integration tests must verify real interactions between the API, application services, and PostgreSQL.

### 6.1 Database requirements

Use a dedicated test database with the same relevant database engine and constraints as the application environment.

Do not rely exclusively on mocks for testing:

- Unique constraints.
- Foreign keys.
- Transactions.
- Row locking.
- Concurrent writes.
- Isolation behavior.
- Migration correctness.

### 6.2 Transaction rollback

Verify that when a required database operation fails:

- Partial writes are rolled back.
- No false success response is returned.
- Retry behavior remains safe.
- The database remains consistent.

### 6.3 Authorization integration

Verify that protected endpoints enforce permissions and restaurant ownership.

Tests must include attempts to access another customer's or restaurant's resources using otherwise valid IDs.

### 6.4 Idempotency integration

Verify that:

- Repeating the same request with the same key returns a safe, consistent result.
- Reusing a key with a different request is rejected.
- Concurrent requests with the same key do not create duplicate resources.
- A failed request can be retried according to the documented contract.
- Key retention and expiry behavior are consistent with the policy.

### 6.5 External-provider integration

Use provider test environments or deterministic fakes for:

- OTP delivery.
- Payment initiation.
- Payment callbacks.
- Refund requests.

Production credentials must not be used in automated test runs.

---

## 7. API Contract Testing

Every MVP API endpoint must be tested against its approved contract.

For each endpoint, verify:

1. Valid request behavior.
2. Required-field validation.
3. Invalid enum and identifier handling.
4. Authentication requirements.
5. Authorization requirements.
6. Response shape and status code.
7. Error response structure.
8. Business-state validation.
9. Idempotency where required.
10. Sensitive-data exposure.

### API acceptance examples

**Order creation**

- Valid order returns a documented response.
- Unavailable item is rejected.
- Invalid modifier is rejected.
- Cross-restaurant table session is rejected.
- Repeated submission does not create duplicate orders.

**Reservation creation**

- Invalid OTP is rejected.
- Expired verification is rejected.
- Capacity conflict is handled safely.
- Two concurrent requests cannot violate the approved capacity policy.

**Payment initiation**

- Unauthorized access is rejected.
- Client-supplied totals are not trusted.
- Provider failure is represented correctly.
- Duplicate payment initiation is handled according to the idempotency contract.

**Inventory movements**

- Invalid units are rejected.
- Unauthorized adjustments are rejected.
- Duplicate submissions do not duplicate stock.
- Historical movement records remain auditable.

---

## 8. End-to-End User Journey Tests

End-to-end tests must cover complete workflows through the UI and API.

### E2E-01: Customer pre-order

1. Open the public restaurant page.
2. Browse the published menu.
3. Add valid items to the cart.
4. Submit the order.
5. Verify the order confirmation.
6. Verify the persisted order in the test environment.

Expected result: One valid order is created with server-calculated totals.

### E2E-02: QR at-table ordering

1. Open a valid test QR entry point.
2. Verify the restaurant and table context.
3. Browse available items.
4. Submit a valid at-table order.
5. Verify the order is associated with the correct active session.
6. Verify that the kitchen workflow receives the appropriate work.

Expected result: The order belongs to the intended restaurant and session.

### E2E-03: Waiter-assisted ordering

1. Sign in as a waiter.
2. Open the permitted table list.
3. Open or select an eligible session.
4. Add items to a new order.
5. Submit the order.
6. Verify the order and kitchen ticket.

Expected result: The waiter can complete permitted actions without gaining unrelated permissions.

### E2E-04: Kitchen preparation

1. Sign in as kitchen staff.
2. Open the permitted ticket list.
3. Accept an eligible ticket.
4. Start preparation.
5. Mark required items ready.
6. Verify the updated operational status.

Expected result: Only permitted transitions succeed.

### E2E-05: Reservation

1. Select a date and party size.
2. Check availability.
3. Complete the required verification.
4. Create the reservation.
5. Verify the resulting status and stored details.
6. Test a conflicting booking attempt.

Expected result: The reservation respects the approved capacity rules.

### E2E-06: Billing and payment

1. Open an eligible table session.
2. Create a bill.
3. Verify the calculated total.
4. Finalize the bill.
5. Simulate a successful test payment or approved cash collection.
6. Verify the payment and bill states.

Expected result: The bill is settled only after the required payment conditions are met.

### E2E-07: Inventory adjustment

1. Sign in as authorized inventory staff.
2. Open an ingredient record.
3. Record a permitted stock receipt or adjustment.
4. Verify the resulting balance.
5. Verify the stock movement history.
6. Repeat the same request where applicable.

Expected result: The movement is recorded once and the resulting balance is consistent.

### E2E-08: Access control

1. Sign in as a restricted staff role.
2. Attempt an unauthorized action.
3. Verify that the API rejects it.
4. Verify that no unauthorized state change occurred.

Expected result: UI restrictions and server-side authorization both behave correctly.

---

## 9. Concurrency and Race-Condition Testing

Concurrency tests are mandatory for high-risk workflows.

### 9.1 Reservation capacity

Simulate multiple requests attempting to reserve the final available capacity.

Verify that the result respects the approved capacity policy and does not overbook the restaurant.

### 9.2 Table session conflicts

Simulate two staff members opening the same table session simultaneously.

Verify that the database and application enforce the intended active-session rule.

### 9.3 Duplicate orders

Submit concurrent order requests with the same idempotency key.

Verify that only one logical order is created.

### 9.4 Payment callbacks

Deliver the same payment event more than once, including concurrent delivery.

Verify that the payment effect is applied once.

### 9.5 Inventory contention

Submit simultaneous stock operations against the same ingredient.

Verify that the final stock balance is consistent and that the approved negative-stock policy is enforced.

### 9.6 Stale state transitions

Have two users attempt conflicting transitions based on the same original state.

Verify that stale or invalid transitions are rejected rather than silently overwriting newer data.

These tests must use the real PostgreSQL test environment for database-dependent behavior.

---

## 10. Security Testing

Security tests must include:

- Invalid and expired sessions.
- Disabled staff accounts.
- Unauthorized role actions.
- Cross-customer resource access.
- Cross-restaurant resource access.
- QR token misuse.
- OTP expiry and rate limits.
- Payment webhook signature validation.
- Duplicate webhook delivery.
- Input validation and injection attempts.
- Request-size limits.
- Sensitive-data exposure in error responses.
- Secret leakage in logs.
- CSRF protection where applicable.

Automated security checks are necessary but do not prove the system is completely secure.

High-risk issues must be resolved before production release.

---

## 11. UI, Responsive, and Accessibility Testing

### 11.1 Responsive testing

Test the supported layouts at representative viewport sizes.

Priorities:

- Customer menu and cart on mobile.
- QR ordering on mobile.
- Reservation forms on mobile.
- Staff order and kitchen screens on desktop.
- Cashier and billing screens on desktop and tablet where supported.

The exact browser and device support matrix must be finalized for the MVP.

### 11.2 Accessibility

Test:

- Keyboard navigation.
- Visible focus indicators.
- Form labels and error messages.
- Semantic headings and controls.
- Sufficient text and control contrast.
- Screen-reader labels where appropriate.
- Dialog focus management.
- Status updates that are not conveyed by color alone.

### 11.3 UI state coverage

Every major screen should be checked for:

- Initial loading.
- Empty data.
- Successful data.
- Validation errors.
- Permission errors.
- Network failure.
- Expired session.
- Stale real-time data.
- Submission in progress.
- Repeated submission prevention.

A polished happy path is not sufficient if failure states leave the user confused.

---

## 12. Test Data and Environment Management

### 12.1 Synthetic test data

Test fixtures should include:

- A sample restaurant.
- Staff accounts for each permitted role.
- Published and unavailable menu items.
- Valid and invalid modifiers.
- Active and closed table sessions.
- Orders in relevant states.
- Reservations at capacity boundaries.
- Bills with different payment states.
- Duplicate and out-of-order provider events.
- Ingredients with different stock levels.

No real customer credentials or payment secrets should be embedded in fixtures.

### 12.2 Isolation

Tests must be repeatable and isolated.

A test must not depend on another test having run first.

Database cleanup must preserve test isolation without disabling the constraints being tested.

### 12.3 Environments

The project should distinguish:

- Local development.
- Automated test.
- Staging or pre-release.
- Production.

The exact number of deployed environments may depend on cost, but test and production data and credentials must remain separate.

### 12.4 Test payments

Use provider sandbox or test mode where available.

Test cases should cover successful, failed, pending, cancelled, and uncertain outcomes where the provider supports them.

Never use real payment credentials for automated test transactions.

---

## 13. Continuous Integration Quality Gates

Every meaningful code change should pass automated checks before it is merged.

Proposed pipeline:

1. Install dependencies using the committed lockfile.
2. Run formatting checks.
3. Run linting.
4. Run TypeScript checks.
5. Run unit tests.
6. Start or provision PostgreSQL for integration tests.
7. Run database migrations against the test database.
8. Run integration and API contract tests.
9. Build the frontend and backend.
10. Run selected security and dependency checks.

End-to-end tests may run on pull requests or on a defined pre-release pipeline, depending on execution time and stability.

The pipeline must fail when a required quality gate fails.

### Branch protection

Where the repository workflow supports it:

- Protect the primary branch.
- Require successful CI checks.
- Require review for changes that affect critical business logic.
- Avoid committing secrets or generated environment files.
- Keep migrations and contract changes under version control.

For a solo project, these controls still provide useful discipline even without a team of reviewers.

---

## 14. Coverage and Quality Thresholds

Coverage is a diagnostic measure, not a substitute for correct assertions.

Proposed initial targets:

| Area | Target |
|---|---|
| Overall unit-test line coverage | At least 70% as an initial target |
| Critical financial and state-transition logic | At least 90% line coverage, plus meaningful branch testing |
| Core MVP user journeys | All designated critical journeys covered by automated E2E tests |
| Authorization boundaries | All defined role and ownership rules tested |
| Critical concurrency scenarios | All documented scenarios tested |
| High-severity known defects | Zero unresolved before production release |

These are proposed targets, not claims about existing coverage.

Critical modules should be evaluated by test quality and scenario coverage, not by percentage alone.

The team may revise thresholds when justified, but should not lower them merely to make a failing pipeline pass.

---

## 15. Defect Severity and Release Blocking

### Critical

Examples:

- Unauthorized access to another restaurant's sensitive data.
- Duplicate charges caused by retries.
- Incorrect financial settlement.
- Confirmed reservation overbooking beyond the approved capacity policy.
- Data corruption or unrecoverable loss.

**Release decision:** Block release until resolved or the affected capability is safely disabled.

### High

Examples:

- Order creation fails for a common valid workflow.
- Kitchen tickets are missing or duplicated.
- Refund processing violates the approved policy.
- Inventory movements produce inconsistent balances.

**Release decision:** Block release of the affected capability until resolved.

### Medium

Examples:

- A noncritical report fails.
- A limited UI state is confusing.
- A supported but nonessential workflow requires a workaround.

**Release decision:** Assess impact, document the workaround, and decide whether release is acceptable.

### Low

Examples:

- Minor visual alignment issue.
- Nonessential text inconsistency.

**Release decision:** May be deferred when the issue does not compromise usability or accessibility requirements.

---

## 16. Regression Testing

Every high-impact defect should produce a regression test.

Examples:

- A duplicate order bug requires an idempotency regression test.
- A reservation race requires a concurrent booking test.
- A payment reconciliation bug requires a provider-event replay test.
- An inventory mismatch requires a stock-movement consistency test.
- A permission bypass requires an authorization regression test.

The regression suite must protect business behavior, not just reproduce a particular implementation.

---

## 17. Performance Testing

Performance testing should begin with the MVP's realistic expected usage rather than speculative internet-scale traffic.

Measure:

- Menu response latency.
- Order creation latency.
- Kitchen ticket retrieval and update latency.
- Reservation availability query latency.
- Bill finalization latency.
- Payment initiation latency, excluding provider-controlled completion time where appropriate.
- Database query behavior under concurrent use.

Performance tests must use representative synthetic data.

The team should define explicit latency and concurrency targets after selecting the initial deployment environment and estimating realistic restaurant usage.

Do not claim production scalability based solely on a successful local test.

---

## 18. Release Checklist

Before an MVP release:

- [ ] All required CI checks pass.
- [ ] Critical business rules have automated tests.
- [ ] Database migrations have been tested.
- [ ] Core customer and staff journeys pass.
- [ ] Authorization and restaurant isolation tests pass.
- [ ] Reservation and table-session concurrency tests pass.
- [ ] Payment success, failure, and uncertain outcomes are tested.
- [ ] Inventory movements reconcile correctly.
- [ ] Responsive and accessibility checks are completed for supported screens.
- [ ] High-severity defects are resolved.
- [ ] Production secrets and environment settings are verified.
- [ ] Backup and recovery procedures are documented and tested.
- [ ] Monitoring and error reporting are operational.
- [ ] The rollback or recovery procedure is understood.
- [ ] Known limitations are documented.

---

## 19. Open Decisions

1. Which exact versions of Vitest, Playwright, and related tools will be used?
2. Which browser versions must the MVP support?
3. What are the required latency targets?
4. How many concurrent staff and customer sessions must the initial deployment support?
5. Which end-to-end tests must run on every pull request?
6. What coverage reporting tool will be used?
7. Which dependency and security scanners will be enabled?
8. What staging environment will be available?
9. How will test payment-provider credentials be managed?
10. What data volume will be used for performance testing?
11. Which release checks are mandatory for a solo developer versus a later team?

---

## 20. Final Status

**Document 11 is a proposed testing strategy and quality-gate specification.**

It defines how correctness will be demonstrated, rather than assuming that a feature works because it runs successfully once.

It must remain aligned with:

- Document 02 — Product Requirements.
- Document 06 — Database Design and ERD.
- Document 07 — API Specification and Contract Design.
- Document 08 — Authentication, Authorization & Security Design.
- Document 09 — Business Rules, State Machines & Transaction Invariants.
- Document 10 — Error Handling, Observability & Operational Reliability.

The testing strategy should be refined when the MVP scope and implementation details are finalized.

**Next document:** Document 12 — UI/UX Design Specification.
