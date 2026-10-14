# Testing Strategy & Quality Gates

**Project:** Restaurant OS
**Document ID:** 11
**Version:** 0.1 — Draft
**Status:** Pending Review
**Stack:** Next.js, React, TypeScript, Express, PostgreSQL, Prisma, Zod

---

## 1. Purpose

This document defines the testing approach for Restaurant OS — what to test, how to test it, and what must pass before a release.

Goal: verify the app works correctly under normal conditions, rejects invalid operations, and preserves data integrity when requests fail or happen concurrently.

---

## 2. Testing Principles

| Principle | What it means |
|---|---|
| QA-001 | Test business behavior, not just implementation details — verify correct order totals, valid reservation capacity, accurate balances |
| QA-002 | Test failure paths — a feature is not adequately tested just because the happy path works |
| QA-003 | Financial and operational logic require stronger correctness tests than presentation components |
| QA-004 | Tests must be repeatable — no dependency on real customer data, unpredictable external services, or manual cleanup |
| QA-005 | Automate regression tests for previously fixed high-impact bugs |
| QA-006 | Use only synthetic or appropriately anonymized data in test environments |
| QA-007 | Release decisions must be based on test results and unresolved risks — not just "the build passed" |

---

## 3. Testing Pyramid

| Layer | Type | What it tests |
|---|---|---|
| 1 | Static checks | TypeScript types, linting, formatting, dependency scanning, build validation |
| 2 | Unit tests | Isolated business rules and utility functions |
| 3 | Integration tests | Modules working together, DB transactions, authorization middleware, idempotency |
| 4 | End-to-end tests | Complete user journeys through UI and API |
| 5 | Operational/exploratory | Mobile usability, keyboard navigation, connection recovery, realistic workflows |

> Priority: Strong unit + integration tests, with E2E covering the highest-risk journeys.

---

## 4. Proposed Testing Tools

| Area | Proposed Tool | Purpose |
|---|---|---|
| Unit and integration tests | Vitest | Fast TypeScript-compatible test runner |
| API testing | Vitest + HTTP test client | Validate routes and responses |
| End-to-end testing | Playwright | Browser-based user journey tests |
| Component testing | React Testing Library | Verify UI behavior |
| Database integration | PostgreSQL test database | Verify real constraints and transactions |
| Request validation | Zod | Validate request contracts |
| Code quality | ESLint + TypeScript | Detect code and type issues |
| Dependency checks | npm audit / scanning tool | Identify known vulnerabilities |
| CI | GitHub Actions | Run automated checks on changes |

> Final versions must be selected and pinned in project dependencies during setup.

---

## 5. Unit Testing Strategy

Unit tests focus on deterministic business logic — fast and independent of the real database.

### 5.1 Pricing Tests

Verify:
- Quantity × unit price
- Modifier pricing
- Discount application
- Tax calculation
- Rounding behavior
- Zero-value and invalid quantities
- Total calculations using exact monetary representations

Examples:
- A valid order produces the expected subtotal
- A discount cannot exceed the permitted limit
- Invalid quantities are rejected
- Changing the displayed frontend price does not change the server's authoritative price

### 5.2 Order State Tests

Verify:
- Permitted state transitions succeed
- Invalid transitions are rejected
- Cancelled orders cannot continue normal fulfillment
- Completed orders cannot be reopened through ordinary operations
- Cancellation eligibility follows the approved policy

### 5.3 Reservation Tests

Verify:
- Party size limits
- Operating-hour restrictions
- Duration and buffer calculations
- Cancellation policy
- Deposit requirements
- No-show eligibility

> Concurrency and actual DB capacity protection must also be tested at the integration level.

### 5.4 Payment Tests

Verify:
- Failed payments do not settle bills
- Confirmed payments update the outstanding balance correctly
- Refund amounts respect the refundable limit
- Repeated provider events do not produce duplicate financial effects
- An unknown payment outcome is not automatically treated as a confirmed failure

### 5.5 Inventory Tests

Verify:
- Stock movement calculations
- Unit conversions
- Quantity precision
- Recipe-based consumption calculations
- Reversal and adjustment behavior
- Negative stock policy

---

## 6. Integration Testing Strategy

Integration tests verify real interactions between the API, application services, and PostgreSQL.

### Database Requirements
- Use a dedicated test database with the same engine and constraints as production
- Do NOT rely exclusively on mocks for: unique constraints, foreign keys, transactions, row locking, concurrent writes, isolation behavior, migration correctness

### Transaction Rollback
When a required DB operation fails:
- Partial writes are rolled back
- No false success response is returned
- Retry behavior remains safe
- Database remains consistent

### Authorization Integration
- Test that protected endpoints enforce permissions and restaurant ownership
- Include attempts to access another customer's or restaurant's resources using otherwise valid IDs

### Idempotency Integration
- Repeating the same request with the same key returns a safe, consistent result
- Reusing a key with a different request is rejected
- Concurrent requests with the same key do not create duplicate resources
- Key retention and expiry behavior are consistent with policy

### External-Provider Integration
- Use provider test environments or deterministic fakes for: OTP delivery, payment initiation, payment callbacks, refund requests
- Production credentials must NOT be used in automated test runs

---

## 7. API Contract Testing

Every MVP API endpoint must be tested against its approved contract.

For each endpoint, verify:

| # | Check |
|---|---|
| 1 | Valid request behavior |
| 2 | Required-field validation |
| 3 | Invalid enum and identifier handling |
| 4 | Authentication requirements |
| 5 | Authorization requirements |
| 6 | Response shape and status code |
| 7 | Error response structure |
| 8 | Business-state validation |
| 9 | Idempotency where required |
| 10 | Sensitive-data exposure |

### Key API Scenarios to Test

**Order creation:**
- Valid order returns documented response
- Unavailable item is rejected
- Invalid modifier is rejected
- Cross-restaurant table session is rejected
- Repeated submission does not create duplicate orders

**Reservation creation:**
- Invalid OTP is rejected
- Expired verification is rejected
- Capacity conflict is handled safely
- Two concurrent requests cannot violate approved capacity policy

**Payment initiation:**
- Unauthorized access is rejected
- Client-supplied totals are not trusted
- Provider failure is represented correctly
- Duplicate payment initiation follows idempotency contract

**Inventory movements:**
- Invalid units are rejected
- Unauthorized adjustments are rejected
- Duplicate submissions do not duplicate stock
- Historical movement records remain auditable

---

## 8. End-to-End User Journey Tests

### E2E-01: Customer Pre-Order
1. Open the public restaurant page
2. Browse the published menu
3. Add valid items to the cart
4. Submit the order
5. Verify order confirmation
6. Verify the persisted order in the test environment

**Expected:** One valid order created with server-calculated totals.

### E2E-02: QR At-Table Ordering
1. Open a valid test QR entry point
2. Verify restaurant and table context
3. Browse available items
4. Submit a valid at-table order
5. Verify the order is associated with the correct active session
6. Verify kitchen workflow receives the work

**Expected:** Order belongs to the intended restaurant and session.

### E2E-03: Waiter-Assisted Ordering
1. Sign in as a waiter
2. Open the permitted table list
3. Open or select an eligible session
4. Add items to a new order
5. Submit the order
6. Verify order and kitchen ticket

**Expected:** Waiter can complete permitted actions without gaining unrelated permissions.

### E2E-04: Kitchen Preparation
1. Sign in as kitchen staff
2. Open the permitted ticket list
3. Accept an eligible ticket
4. Start preparation
5. Mark required items ready
6. Verify the updated operational status

**Expected:** Only permitted transitions succeed.

### E2E-05: Reservation
1. Select a date and party size
2. Check availability
3. Complete required verification (OTP)
4. Create the reservation
5. Verify resulting status and stored details
6. Test a conflicting booking attempt

**Expected:** Reservation respects the approved capacity rules.

### E2E-06: Billing and Payment
1. Open an eligible table session
2. Create a bill
3. Verify calculated total
4. Finalize the bill
5. Simulate a successful test payment or approved cash collection
6. Verify payment and bill states

**Expected:** Bill is settled only after required payment conditions are met.

### E2E-07: Inventory Adjustment
1. Sign in as authorized inventory staff
2. Open an ingredient record
3. Record a permitted stock receipt or adjustment
4. Verify the resulting balance
5. Verify stock movement history
6. Repeat the same request where applicable

**Expected:** Movement recorded once, resulting balance consistent.

### E2E-08: Access Control
1. Sign in as a restricted staff role
2. Attempt an unauthorized action
3. Verify the API rejects it
4. Verify no unauthorized state change occurred

**Expected:** UI restrictions and server-side authorization both behave correctly.

---

## 9. Concurrency and Race-Condition Testing

Mandatory for high-risk workflows. Must use real PostgreSQL, not mocks.

| Scenario | What to test |
|---|---|
| Reservation capacity | Multiple requests competing for the final slot — must not overbook |
| Table session conflicts | Two staff simultaneously opening the same table — active-session rule enforced |
| Duplicate orders | Concurrent requests with the same idempotency key — only one order created |
| Payment callbacks | Same payment event delivered multiple times including concurrently — payment effect applied once |
| Inventory contention | Simultaneous stock operations on same ingredient — final balance consistent, negative-stock policy enforced |
| Stale state transitions | Two users attempting conflicting transitions from the same state — stale/invalid transitions rejected |

---

## 10. Security Testing

Must include:
- Invalid and expired sessions
- Disabled staff accounts
- Unauthorized role actions
- Cross-customer resource access
- Cross-restaurant resource access
- QR token misuse
- OTP expiry and rate limits
- Payment webhook signature validation
- Duplicate webhook delivery
- Input validation and injection attempts
- Request-size limits
- Sensitive-data exposure in error responses
- Secret leakage in logs
- CSRF protection where applicable

> Automated security checks are necessary but do not prove the system is completely secure. High-risk issues must be resolved before production release.

---

## 11. UI, Responsive, and Accessibility Testing

### Responsive Testing

Test at representative viewport sizes:
- Customer menu and cart on mobile
- QR ordering on mobile
- Reservation forms on mobile
- Staff order and kitchen screens on desktop
- Cashier and billing screens on desktop and tablet

> Browser and device support matrix must be finalized for MVP.

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Visible focus indicators
- [ ] Form labels and error messages are correct
- [ ] Semantic headings and controls
- [ ] Sufficient text and control contrast
- [ ] Screen-reader labels where appropriate
- [ ] Dialog focus management
- [ ] Status updates not conveyed by color alone

### UI State Coverage

Every major screen must be checked for:

| State | Check |
|---|---|
| Loading | Shows a loading indicator |
| Empty data | Shows an appropriate empty state |
| Successful data | Shows data correctly |
| Validation errors | Shows errors on the right fields |
| Permission errors | Shows access denied without exposing info |
| Network failure | Shows error and recovery option |
| Expired session | Redirects to login appropriately |
| Stale real-time data | Shows reconnecting/refreshing state |
| Submission in progress | Prevents double-submit |

---

## 12. Test Data and Environment Management

### Synthetic Test Data Should Include:
- One sample restaurant
- Staff accounts for each permitted role
- Published and unavailable menu items
- Valid and invalid modifiers
- Active and closed table sessions
- Orders in relevant states
- Reservations at capacity boundaries
- Bills with different payment states
- Duplicate and out-of-order provider events
- Ingredients with different stock levels

> No real customer credentials or payment secrets in fixtures.

### Isolation Rules
- Tests must be repeatable and isolated
- A test must not depend on another test having run first
- Database cleanup must preserve test isolation without disabling the constraints being tested

### Test Payments
- Use provider sandbox or test mode
- Cover: successful, failed, pending, cancelled, and uncertain outcomes
- Never use real payment credentials for automated test transactions

---

## 13. Continuous Integration Quality Gates

Pipeline steps for every meaningful code change:

1. Install dependencies using the committed lockfile
2. Run formatting checks
3. Run linting
4. Run TypeScript checks
5. Run unit tests
6. Start/provision PostgreSQL for integration tests
7. Run database migrations against the test database
8. Run integration and API contract tests
9. Build the frontend and backend
10. Run selected security and dependency checks

End-to-end tests may run on pull requests or on a pre-release pipeline depending on execution time.

> The pipeline must fail when a required quality gate fails.

---

## 14. Coverage and Quality Thresholds

| Area | Target |
|---|---|
| Overall unit-test line coverage | At least 70% (initial target) |
| Critical financial and state-transition logic | At least 90% line coverage + meaningful branch testing |
| Core MVP user journeys | All critical journeys covered by automated E2E tests |
| Authorization boundaries | All defined role and ownership rules tested |
| Critical concurrency scenarios | All documented scenarios tested |
| High-severity known defects | Zero unresolved before production release |

> These are initial proposed targets. Do not lower them just to make a failing pipeline pass.

---

## 15. Defect Severity and Release Blocking

| Severity | Examples | Release Decision |
|---|---|---|
| **Critical** | Unauthorized access to another restaurant's data; duplicate charges from retries; incorrect financial settlement; confirmed reservation overbooking | Block release until resolved or capability is safely disabled |
| **High** | Order creation fails for common valid workflow; kitchen tickets missing/duplicated; refund policy violated; inventory movements inconsistent | Block release of the affected capability |
| **Medium** | Non-critical report fails; limited UI state is confusing; non-essential workflow needs a workaround | Assess impact, document workaround, decide whether release is acceptable |
| **Low** | Minor visual alignment; non-essential text inconsistency | May be deferred if it doesn't compromise usability or accessibility |

---

## 16. Regression Testing

Every high-impact defect should produce a regression test.

| Defect Type | Regression Test |
|---|---|
| Duplicate order bug | Idempotency regression test |
| Reservation race condition | Concurrent booking test |
| Payment reconciliation bug | Provider-event replay test |
| Inventory mismatch | Stock-movement consistency test |
| Permission bypass | Authorization regression test |

---

## 17. Performance Testing

Begin with realistic expected MVP usage, not speculative internet-scale traffic.

Measure response latency for:
- Menu page
- Order creation
- Kitchen ticket retrieval and update
- Reservation availability query
- Bill finalization
- Payment initiation (excluding provider-controlled completion time)
- Database queries under concurrent use

> Define latency and concurrency targets after selecting the initial deployment environment and estimating realistic restaurant usage.
>
> Do NOT claim production scalability based solely on a successful local test.

---

## 18. Release Checklist

Before MVP release:

- [ ] All required CI checks pass
- [ ] Critical business rules have automated tests
- [ ] Database migrations have been tested on a clean environment
- [ ] Core customer and staff journeys pass
- [ ] Authorization and restaurant isolation tests pass
- [ ] Reservation and table-session concurrency tests pass
- [ ] Payment success, failure, and uncertain outcomes are tested
- [ ] Inventory movements reconcile correctly
- [ ] Responsive and accessibility checks completed for supported screens
- [ ] High-severity defects are resolved
- [ ] Production secrets and environment settings are verified
- [ ] Backup and recovery procedures are documented and tested
- [ ] Monitoring and error reporting are operational
- [ ] Rollback or recovery procedure is understood
- [ ] Known limitations are documented

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

---

**Next document:** 12 — UI/UX Design Specification
