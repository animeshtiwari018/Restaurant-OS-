# Implementation Roadmap & Task Breakdown

**Project:** Restaurant Operating System
**Document ID:** IMPL-015
**Status:** Draft
**Last Updated:** 2026-10-13

---

## 1. Objective

Convert the approved MVP scope into an ordered implementation plan with clear dependencies, deliverables, and acceptance criteria.

Development is incremental — each phase must produce a testable result before dependent work begins.

---

## 2. Implementation Principles

- Build one complete workflow at a time
- Establish database constraints and business rules before building the UI that depends on them
- Keep frontend, API, and database contracts consistent
- Use migrations for every database schema change
- Test business-critical behavior throughout development, not only at the end
- Avoid premature microservices, unnecessary abstractions, and out-of-scope features
- A task is not complete until its acceptance criteria pass

---

## 3. Phase Overview

| Phase | Focus | Completion Outcome |
|---|---|---|
| 0 | Specification review | Critical decisions and contradictions resolved |
| 1 | Project foundation | Frontend, API, database, and automated checks working |
| 2 | Authentication and restaurant setup | Protected staff operations and restaurant configuration |
| 3 | Menu and table management | Menu administration and table sessions |
| 4 | Order management | Pre-orders, QR orders, and waiter orders |
| 5 | Kitchen operations | Operational kitchen ticket workflow |
| 6 | Reservations | Capacity-safe reservation lifecycle |
| 7 | Billing and payments | Bill finalization and payment recording |
| 8 | Inventory and reports | Auditable stock movements and essential reports |
| 9 | Quality and deployment | Reliable, tested demonstration release |

---

## 4. Phase 0 — Specification Review

### Tasks
- [ ] Review the PRD and MVP scope
- [ ] Resolve contradictions between the database design, API specification, and business rules
- [ ] Finalize the customer/guest identity model
- [ ] Define the relationship between table sessions, orders, and bills
- [ ] Select the reservation allocation model
- [ ] Define monetary precision and rounding rules
- [ ] Define inventory deduction timing
- [ ] Decide the initial real-time update strategy
- [ ] Confirm the authentication and authorization model for the first release
- [ ] Record accepted decisions in the ADR register

**Exit criteria:** No unresolved decision may block the design of the next phase. Deferred decisions must have a documented reason and must NOT silently enter the MVP.

---

## 5. Phase 1 — Project Foundation

### Backend
- [ ] Initialize Node.js + TypeScript Express application
- [ ] Configure environment variables and secret handling
- [ ] Configure request parsing, validation, error handling, and request IDs
- [ ] Establish `/api/v1` route structure
- [ ] Configure Prisma and PostgreSQL
- [ ] Create the initial migration workflow
- [ ] Add health-check endpoints
- [ ] Add structured logging
- [ ] Establish unit and integration test commands

### Frontend
- [ ] Initialize Next.js + TypeScript application
- [ ] Establish route organization and shared layouts
- [ ] Configure API communication and typed response handling
- [ ] Create shared loading, empty, error, and not-found states
- [ ] Implement agreed design tokens and basic UI components

### Repository & Automation
- [ ] Create a consistent repository structure
- [ ] Configure linting, formatting, and type checking
- [ ] Add automated checks for pull requests or pushes
- [ ] Add an example `.env` file with placeholders only (no real secrets)
- [ ] Document local setup and database startup instructions

**Exit criteria:** A new developer can clone the repo, configure the environment, start frontend and API, apply migrations, and run automated checks using the documented instructions.

---

## 6. Phase 2 — Authentication and Restaurant Setup

### Tasks
- [ ] Implement staff login and logout
- [ ] Implement secure session handling
- [ ] Add staff-user and role management foundations
- [ ] Add authorization middleware
- [ ] Enforce restaurant-level data access
- [ ] Create restaurant profile and settings
- [ ] Implement opening hours and basic operational settings
- [ ] Add an initial authorized administrator setup process
- [ ] Test: invalid credentials, expired sessions, and forbidden requests

**Exit criteria:** Staff can authenticate and access only permitted operations. Restaurant basic settings can be managed. Unauthorized access is rejected by the backend.

---

## 7. Phase 3 — Menu and Table Management

### Menu Tasks
- [ ] Create and manage menu categories
- [ ] Create and edit menu items
- [ ] Configure prices, descriptions, and availability
- [ ] Implement item availability checks
- [ ] Implement permitted modifiers (if in approved MVP)
- [ ] Preserve order-time price and item snapshots (snapshot implementation)

### Table Tasks
- [ ] Create and edit restaurant tables
- [ ] Define valid table-session transitions
- [ ] Open and close table service sessions
- [ ] Generate and validate QR access tokens
- [ ] Revoke/invalidate QR access when required
- [ ] Prevent unauthorized access to other tables or restaurant data

**Exit criteria:** Authorized staff can maintain the menu and tables. QR access resolves to the correct restaurant and table without exposing staff-only functionality.

---

## 8. Phase 4 — Order Management

> Implement the shared order domain first, then build the three ordering interfaces on top of it.

### Core Order Tasks (Build First)
- [ ] Define order creation and status-transition rules
- [ ] Implement order and order-item persistence
- [ ] Validate item availability and current prices on the backend
- [ ] Persist item and modifier snapshots
- [ ] Add order status history
- [ ] Add idempotency for order creation
- [ ] Implement permitted cancellation rules
- [ ] Enforce restaurant and table-session ownership
- [ ] Add transactional and concurrency tests

### Pre-Ordering Interface
- [ ] Implement the public restaurant menu
- [ ] Implement cart and quantity editing
- [ ] Implement checkout and order submission
- [ ] Display confirmation and current order status

### QR Ordering Interface
- [ ] Implement QR landing and validation
- [ ] Load the menu in the table context
- [ ] Submit orders against the correct active session
- [ ] Handle expired tokens and closed sessions

### Waiter Ordering Interface
- [ ] Provide a staff order-entry interface
- [ ] Allow selection of the correct table session
- [ ] Validate staff permissions
- [ ] Submit orders through the same core order service

**Exit criteria:** All three ordering paths create valid orders through shared domain logic. Duplicate submissions, invalid item states, and unauthorized table access are all handled safely.

---

## 9. Phase 5 — Kitchen Operations

### Tasks
- [ ] Define kitchen ticket creation rules
- [ ] Map eligible order items to kitchen tickets
- [ ] Implement kitchen ticket and item states
- [ ] Provide a kitchen display interface
- [ ] Support permitted transitions: Queued → Accepted → Preparing → Ready
- [ ] Record status history
- [ ] Reflect kitchen changes in authorized staff and customer views
- [ ] Handle retries without creating duplicate tickets
- [ ] Implement the selected update mechanism (polling or real-time)

**Exit criteria:** Orders submitted through any ordering path appear in the appropriate kitchen workflow. Kitchen actions follow valid transitions and are reflected consistently.

---

## 10. Phase 6 — Reservations

### Tasks
- [ ] Implement reservation availability queries
- [ ] Implement reservation creation and cancellation
- [ ] Implement the selected capacity or table-allocation model
- [ ] Add database-backed concurrency protection
- [ ] Implement the agreed guest verification method (OTP)
- [ ] Add reservation status history
- [ ] Implement staff reservation management
- [ ] Support check-in and seating
- [ ] Implement permitted no-show handling
- [ ] Test: concurrent bookings, duplicate requests, and expired reservation holds

**Exit criteria:** System rejects conflicting bookings, preserves reservation history, and provides consistent availability and reservation states under concurrent requests.

---

## 11. Phase 7 — Billing and Payments

### Billing Tasks
- [ ] Finalize the order-to-bill and session-to-bill relationships
- [ ] Define bill eligibility and finalization rules
- [ ] Calculate totals using exact monetary arithmetic
- [ ] Persist bill and bill-item snapshots
- [ ] Define permitted adjustments and bill voiding
- [ ] Prevent unauthorized changes to finalized bills
- [ ] Implement bill status transitions

### Cash Payment Tasks
- [ ] Record cash payment against the correct bill
- [ ] Validate the amount and permitted payment state
- [ ] Prevent duplicate payment records
- [ ] Implement settlement and table-session closure checks

### Online Payment Tasks
- [ ] Integrate the selected provider in test mode
- [ ] Implement payment initiation and provider-event verification
- [ ] Handle duplicate and out-of-order events
- [ ] Implement reconciliation for uncertain outcomes
- [ ] Record refund lifecycle events (if refunds are in approved release)
- [ ] Test: successful, failed, delayed, and duplicate payment events

**Exit criteria:** Bills reconcile with their persisted items, payment states are authoritative, and duplicate events cannot cause duplicate financial records or incorrect settlement.

---

## 12. Phase 8 — Inventory and Reporting

### Inventory Tasks
- [ ] Create ingredient and measurement-unit records
- [ ] Implement stock receipts
- [ ] Implement manual stock adjustments
- [ ] Record stock movement history
- [ ] Maintain and validate the stock balance
- [ ] Implement low-stock thresholds
- [ ] Enforce permissions for stock changes
- [ ] Test: duplicate operations and concurrent adjustments

> Recipe-based automatic consumption: implement only if explicitly retained in the approved MVP.

### Reporting Tasks
- [ ] Implement date-filtered order counts
- [ ] Implement sales totals based on clearly defined payment and bill states
- [ ] Implement reservation counts and statuses
- [ ] Implement low-stock reporting
- [ ] Define the restaurant's reporting timezone
- [ ] Verify report totals against underlying records

**Exit criteria:** Inventory movements are auditable, stock balances are consistent, and reports reconcile with authoritative database records.

---

## 13. Phase 9 — Quality, Deployment, and Release

### Quality Assurance
- [ ] Complete unit tests for critical domain logic
- [ ] Complete integration tests for transactional workflows
- [ ] Complete end-to-end tests for ordering, kitchen, reservations, and billing
- [ ] Test concurrent reservation and order operations
- [ ] Test authentication, authorization, and tenant isolation
- [ ] Test duplicate payment provider events
- [ ] Verify keyboard navigation and core accessibility requirements
- [ ] Fix all release-blocking defects

### Deployment
- [ ] Configure staging and demonstration environments
- [ ] Configure secrets and environment-specific settings
- [ ] Apply database migrations through the release process
- [ ] Configure HTTPS and appropriate security headers
- [ ] Configure database backups and verify restoration
- [ ] Add health checks and actionable error logging
- [ ] Seed synthetic demonstration data
- [ ] Verify the application can be deployed from documented instructions

### Release Validation
- [ ] Run the full automated test suite
- [ ] Execute the complete demonstration scenario
- [ ] Verify test payments cannot be mistaken for real payments
- [ ] Confirm no secrets are committed to the repository
- [ ] Document known limitations
- [ ] Record the release version and deployment procedure

**Exit criteria:** Application is reproducibly deployable, critical workflows work end-to-end, release gates pass, and the demonstration can be performed without manually repairing data.

---

## 14. Definition of Done (applies to every task)

A task is complete only when:

1. Its acceptance criteria pass
2. Relevant business rules are enforced by the backend
3. Authorization and restaurant ownership are checked
4. Database changes are represented by migrations
5. Critical failure and retry cases are handled
6. Automated tests cover the behavior
7. API and UI documentation remain consistent with the implementation
8. The change does not break previously completed workflows

---

## 15. Critical Path

**Recommended order:**

```
Specification review
  → Foundation
  → Authentication
  → Menu and tables
  → Orders (core first, then 3 interfaces)
  → Kitchen
  → Billing integration
  → Reservations
  → Inventory and reporting
  → Release hardening
```

Some work can proceed in parallel after its dependencies are stable. For example, the customer menu UI can be developed alongside menu API work — but the UI must use the agreed API contract, not invent its own data model.

**Important:**
- Billing design decisions must be resolved before implementing final settlement
- Reservation allocation decisions must be resolved before implementing capacity enforcement

---

## 16. Progress Tracking

Track each task with one of these statuses:

| Status | Meaning |
|---|---|
| Not Started | Work has not begun |
| In Progress | Work is underway |
| Blocked | Cannot proceed — record the blocking issue |
| In Review | Work complete, pending review/testing |
| Done | Acceptance criteria passed |

> For every blocked task, record the missing decision, dependency, or technical issue. Never mark dependent tasks as complete to hide a blocker.
