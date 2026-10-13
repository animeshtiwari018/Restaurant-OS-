# Restaurant OS — Product Requirements Document (PRD)

**Document ID:** ROS-PRD-002  
**Version:** 1.0  
**Date:** 13 October 2026  
**Status:** Draft — Pending Review  
**Parent Document:** 01-product-discovery.md

---

## 1. Purpose

This document defines the functional requirements, business rules, non-functional requirements, acceptance criteria, MVP boundaries, and product constraints for Restaurant OS.

It serves as the primary reference for subsequent user journey design, UX planning, system architecture, database design, API specifications, testing, and implementation.

No implementation should begin until the relevant planning documents have been reviewed and approved.

## 2. Product Summary

Restaurant OS is an integrated restaurant operations platform connecting customers, waiters, kitchen staff, cashiers, and administrators.

The initial deployment will support one restaurant, with an architecture designed to accommodate future multi-restaurant SaaS expansion.

The platform will support:

- Full-service restaurants.
- Cafés and quick-service restaurants.
- Advance food pre-orders.
- QR-based at-table ordering.
- Waiter-assisted ordering.
- Table management and reservations.
- Kitchen order management.
- Billing and payment reconciliation.
- Basic ingredient inventory.

## 3. Product Objectives

### OBJ-01: Unified operations

Maintain consistent order, table, kitchen, billing, and inventory records.

### OBJ-02: Reliable ordering

Prevent duplicate orders and preserve accurate item quantities, prices, modifications, and order history.

### OBJ-03: Kitchen visibility

Allow authorized kitchen staff to view incoming orders and update preparation status.

### OBJ-04: Reservation reliability

Prevent conflicting confirmed reservations and clearly communicate reservation status and policies.

### OBJ-05: Payment correctness

Distinguish between payment initiation, payment confirmation, failure, refund, and final settlement.

### OBJ-06: Inventory visibility

Track ingredient stock movements and calculate recipe-based consumption.

### OBJ-07: Future expansion

Keep restaurant-specific data and operational modules sufficiently separated to support future multi-tenant SaaS development.

## 4. User Roles and Permissions

### 4.1 Customer

A customer must be able to:

- Browse the published menu.
- View item prices and availability.
- Select item quantities and permitted modifiers.
- Place a pre-order.
- Place an at-table order through a valid table QR link.
- Request a reservation.
- Complete required phone verification.
- View their own order and reservation status.
- View applicable bills and payment status.
- Cancel or modify an order only when the applicable policy allows it.

### 4.2 Waiter

A waiter must be able to:

- View authorized table information.
- Create orders for seated customers.
- Add items and permitted modifications.
- Submit orders to the kitchen.
- View order and preparation status.
- Request bill generation.
- Mark permitted service actions as complete.

### 4.3 Kitchen Staff

Kitchen staff must be able to:

- View incoming kitchen tickets.
- View item quantities and preparation instructions.
- Accept tickets.
- Update preparation status.
- Mark prepared items as ready.
- Identify cancelled, modified, or delayed items.
- Access only the operational information required for kitchen work.

### 4.4 Cashier

A cashier must be able to:

- Review eligible orders and bills.
- Generate or finalize bills according to policy.
- Record cash payments.
- View verified online payment status.
- Process permitted payment adjustments and refunds.
- Review outstanding balances and settlement status.

### 4.5 Restaurant Administrator

An administrator must be able to:

- Manage menu categories and items.
- Manage item prices, modifiers, and availability.
- Manage tables and table QR links.
- Manage staff accounts and permissions.
- Configure restaurant operating hours and ordering policies.
- Configure reservations and deposit policies.
- Manage inventory items and recipes.
- Review orders, reservations, payments, stock movements, and audit records.

### 4.6 Authorization Rules

- Users must authenticate before accessing protected staff functions.
- Permissions must be checked on the server.
- Customers must not access another customer's private information without authorization.
- Kitchen staff must not change payment records unless explicitly permitted.
- Cashiers must not modify protected inventory or staff permissions by default.
- Refunds, discounts, stock adjustments, and other sensitive actions must be permission-controlled.
- All access must remain restricted to the user's authorized restaurant.

## 5. Functional Requirements

Priority definitions:

- **P0:** Required for the intended MVP.
- **P1:** Important but may follow the first validated workflow.
- **P2:** Deferred until later releases.

### 5.1 Authentication and Staff Management

**AUTH-001 — P0:** The system must authenticate authorized staff.

**AUTH-002 — P0:** The system must enforce role-based access control.

**AUTH-003 — P0:** Administrators must be able to create, disable, and manage staff accounts.

**AUTH-004 — P0:** Disabled staff accounts must not be allowed to continue initiating new protected operations.

**AUTH-005 — P0:** Sensitive administrative actions must be recorded in an audit trail.

**AUTH-006 — P1:** Staff password reset and account recovery workflows should be available.

### 5.2 Restaurant Configuration

**REST-001 — P0:** The system must maintain the restaurant's name, contact details, address, time zone, currency, and operating hours.

**REST-002 — P0:** The system must use a consistent configured currency for menu prices, orders, bills, and payments.

**REST-003 — P0:** The system must allow authorized administrators to configure ordering availability and relevant service policies.

**REST-004 — P1:** The system should support configurable service charges, discounts, and applicable tax rules.

**REST-005 — P1:** The system should support configurable order preparation estimates and service windows.

### 5.3 Menu Management

**MENU-001 — P0:** Administrators must be able to create, edit, publish, and deactivate menu categories.

**MENU-002 — P0:** Administrators must be able to create and edit menu items with names, descriptions, prices, and availability.

**MENU-003 — P0:** Menu items must support configurable modifiers where required.

**MENU-004 — P0:** Customers must see only published items available for their ordering context.

**MENU-005 — P0:** The server must validate item availability, quantities, and permitted modifiers when accepting an order.

**MENU-006 — P0:** The server must calculate order prices using trusted menu data rather than client-submitted totals.

**MENU-007 — P0:** Orders must preserve historical item names, prices, quantities, and applicable modifiers even if the menu changes later.

**MENU-008 — P0:** Administrators must be able to mark items unavailable without deleting historical order records.

**MENU-009 — P1:** Menu items should support preparation stations and recipe associations.

### 5.4 Table Management

**TABLE-001 — P0:** Administrators must be able to create, edit, deactivate, and identify restaurant tables.

**TABLE-002 — P0:** Each active table must have a unique identifier within its restaurant.

**TABLE-003 — P0:** The system must support table capacity and table status.

**TABLE-004 — P0:** Administrators must be able to generate a table-specific QR link.

**TABLE-005 — P0:** The backend must validate table identity and restaurant ownership for QR-based orders.

**TABLE-006 — P0:** A QR link must not grant administrative or staff privileges.

**TABLE-007 — P0:** Authorized staff must be able to view table occupancy and active service status.

**TABLE-008 — P1:** The system should support joining or combining tables under controlled staff permissions.

### 5.5 Advance Pre-Ordering

**PRE-001 — P0:** Customers must be able to browse the menu and create a pre-order for an eligible future service time.

**PRE-002 — P0:** The system must validate operating hours, ordering cutoffs, item availability, and the configured order lead time.

**PRE-003 — P0:** The customer must receive a clear order reference and confirmation state.

**PRE-004 — P0:** The system must distinguish a submitted order from a confirmed or accepted order.

**PRE-005 — P0:** Customers must be able to view the current status of their own pre-orders.

**PRE-006 — P0:** Cancellation and modification must follow the configured order policy and current preparation state.

**PRE-007 — P1:** The system should support configurable preparation capacity and limits on orders for the same time slot.

### 5.6 QR-Based At-Table Ordering

**QR-001 — P0:** Customers must be able to open a table-specific menu through a QR link.

**QR-002 — P0:** Customers must be able to create an order using permitted menu items and modifiers.

**QR-003 — P0:** The system must associate an accepted table order with the correct restaurant and table.

**QR-004 — P0:** The system must prevent a customer from changing the table identity simply by submitting an arbitrary table identifier.

**QR-005 — P0:** Repeated submission of the same logical order must not create duplicate orders when a valid idempotency mechanism is used.

**QR-006 — P0:** Customers must receive clear confirmation when an order is accepted or rejected.

**QR-007 — P0:** The system must support multiple orders associated with the same active table session.

**QR-008 — P1:** Customers should be able to request assistance from staff through the ordering interface.

### 5.7 Waiter-Assisted Ordering

**WAITER-001 — P0:** Authorized waiters must be able to create an order for a valid table or permitted takeaway/pre-order context.

**WAITER-002 — P0:** Waiter-created orders must use the same order validation and pricing rules as QR orders.

**WAITER-003 — P0:** Waiters must be able to record permitted item modifiers and special instructions.

**WAITER-004 — P0:** Waiters must be able to view order and kitchen status.

**WAITER-005 — P0:** Waiters must not be able to bypass protected payment, pricing, or authorization rules.

### 5.8 Kitchen Order Management

**KITCHEN-001 — P0:** Accepted orders containing preparation-required items must generate the appropriate kitchen work records.

**KITCHEN-002 — P0:** Authorized kitchen staff must be able to view new kitchen tickets.

**KITCHEN-003 — P0:** Kitchen tickets must include item quantities, permitted modifiers, special instructions, and relevant order references.

**KITCHEN-004 — P0:** The system must support defined preparation states, including queued, accepted, preparing, and ready.

**KITCHEN-005 — P0:** The system must record status changes and their timestamps.

**KITCHEN-006 — P0:** Cancelled or modified items must be clearly communicated to the kitchen.

**KITCHEN-007 — P0:** A live connection failure must not permanently prevent staff from retrieving the latest persisted ticket status.

**KITCHEN-008 — P1:** The system should support separate preparation stations for different item categories.

**KITCHEN-009 — P1:** The system should support item-level readiness when one order contains dishes that finish at different times.

### 5.9 Reservations

**RES-001 — P0:** Customers must be able to request a reservation for an eligible date, time, party size, and contact number.

**RES-002 — P0:** The system must verify the customer's phone number through a configured OTP provider or approved test-mode mechanism.

**RES-003 — P0:** The system must validate restaurant hours, table capacity, reservation duration, and applicable booking restrictions.

**RES-004 — P0:** The system must prevent conflicting confirmed reservations for the same table and overlapping time intervals.

**RES-005 — P0:** The system must support reservation states, including pending verification, pending confirmation, confirmed, cancelled, completed, and no-show.

**RES-006 — P0:** The system must support configurable reservation deposit policies.

**RES-007 — P0:** A reservation requiring a deposit must not become confirmed until the configured confirmation conditions are satisfied.

**RES-008 — P0:** The system must define how reservation holds expire and how released capacity becomes available again.

**RES-009 — P0:** Customers must receive a reservation reference and current status.

**RES-010 — P0:** Staff must be able to check in guests and record permitted cancellation or no-show outcomes.

**RES-011 — P1:** The system should support waitlists and configurable grace periods.

### 5.10 Billing and Payments

**PAY-001 — P0:** The system must calculate bill totals on the server.

**PAY-002 — P0:** The system must distinguish order status, bill status, and payment status.

**PAY-003 — P0:** The system must support recording cash payments.

**PAY-004 — P0:** The system must support online payment initiation through a selected payment provider in the appropriate environment.

**PAY-005 — P0:** An online payment must not be marked successful solely because the customer returns to a success page.

**PAY-006 — P0:** The system must verify payment-provider confirmations using the provider's documented verification mechanism.

**PAY-007 — P0:** Payment processing must handle duplicate callbacks or webhook delivery without duplicating financial records.

**PAY-008 — P0:** The system must distinguish pending, successful, failed, and refunded payment states.

**PAY-009 — P0:** The system must prevent an order from being marked fully settled while an outstanding balance remains.

**PAY-010 — P0:** The system must preserve payment and refund history.

**PAY-011 — P0:** Authorized staff must be able to generate a bill for eligible orders.

**PAY-012 — P1:** The system should support split payments and configurable discounts after their rules are defined.

**PAY-013 — P1:** The system should support itemized bills and applicable tax information.

**PAY-014 — P1:** The system should support payment reconciliation reports.

### 5.11 Basic Inventory

**INV-001 — P0:** Administrators must be able to create and manage ingredient records.

**INV-002 — P0:** Inventory records must define a consistent unit of measurement.

**INV-003 — P0:** Administrators must be able to associate menu items with ingredient recipes.

**INV-004 — P0:** The system must record stock receipts and authorized stock adjustments.

**INV-005 — P0:** The system must calculate recipe-based ingredient consumption according to the approved deduction policy.

**INV-006 — P0:** Inventory changes must be recorded as traceable stock movements.

**INV-007 — P0:** The system must define how cancelled, refunded, modified, and wasted items affect inventory.

**INV-008 — P0:** The system must define how unavailable ingredients affect the availability of dependent menu items.

**INV-009 — P1:** The system should provide configurable low-stock alerts.

**INV-010 — P1:** The system should support inventory reconciliation against physical counts.

### 5.12 Reporting and Audit

**AUDIT-001 — P0:** The system must maintain an auditable history of sensitive operational actions.

**AUDIT-002 — P0:** Audit records must identify the actor, action, affected record, and timestamp where applicable.

**AUDIT-003 — P0:** Users must not be able to modify protected audit history through ordinary application functions.

**AUDIT-004 — P1:** Administrators should be able to view sales, order status, payment reconciliation, and basic inventory reports.

## 6. Business Rules

### BR-001 — Order Pricing

All accepted orders must use server-calculated prices.

The order must preserve an immutable snapshot of the applicable item names, unit prices, modifiers, quantities, discounts, and tax values.

### BR-002 — Order State

An order must follow an explicitly defined set of valid state transitions.

An order must not become accepted merely because it has been submitted. Rejected, cancelled, completed, and refunded states must follow defined business rules.

### BR-003 — Order Idempotency

The same logical submission must not create multiple orders when a client retries a request after a timeout or uncertain response.

### BR-004 — Table Occupancy

A table must not be marked available while it still has an active service session, unless an authorized workflow explicitly resolves or transfers that session.

### BR-005 — Reservation Concurrency

Reservation availability checks and confirmation must be protected against concurrent requests.

A reservation hold must have an expiry policy. Expired holds must not indefinitely block availability.

### BR-006 — Kitchen State

Kitchen state and order state must remain consistent without assuming that one order status describes every item accurately.

Item-level states must be used where required by the preparation workflow.

### BR-007 — Payment State

An order being prepared does not imply that it has been paid.

A successful payment does not automatically imply that every item has been served.

### BR-008 — Payment Reconciliation

Financial state changes must be recorded using verified provider events or authorized manual cash-payment records.

Duplicate provider events must not duplicate payment amounts.

### BR-009 — Inventory Movement

Stock deductions and reversals must be traceable.

The system must not silently rewrite historical stock movements to correct an error.

### BR-010 — Role Enforcement

Every protected operation must be authorized by the backend, regardless of which screen or client initiates it.

### BR-011 — Historical Records

Menu changes must not rewrite historical order records or past bill calculations.

### BR-012 — Restaurant Isolation

All operational records must be associated with their owning restaurant, even during the initial single-restaurant deployment.

## 7. Non-Functional Requirements

### NFR-001 — Performance

Under the agreed MVP load-test profile:

- Typical read API requests should target a p95 response time below 500 ms.
- Typical order submission requests should target a p95 response time below 1 second, excluding external payment-provider delays.
- Persisted kitchen status changes should become visible to connected clients within 2 seconds under the defined test conditions.

These are initial targets to validate, not guaranteed performance claims.

### NFR-002 — Reliability

- Order creation must use database transactions where multiple related records must succeed together.
- Failed operations must not leave partially committed business records.
- The system must recover the latest persisted state after a client reconnects.
- Retried operations must follow defined idempotency rules.

### NFR-003 — Security

- Authentication and authorization must be enforced server-side.
- Passwords must be stored using an appropriate password-hashing algorithm.
- Secrets must not be committed to source control.
- Inputs must be validated at trust boundaries.
- Sensitive data must not be exposed through logs or unauthorized API responses.
- Administrative actions must be permission-controlled and auditable.

### NFR-004 — Data Integrity

- Critical relationships must be enforced using database constraints.
- Monetary values must use appropriate decimal or integer-minor-unit representations, not floating-point arithmetic.
- Reservation and payment transitions must remain consistent under concurrent requests.
- Historical financial records must remain auditable.

### NFR-005 — Accessibility and Usability

- Customer interfaces must work on common mobile browsers.
- Staff interfaces must remain usable on supported desktop and tablet screens.
- Critical status information must not rely on color alone.
- Core forms must provide clear validation messages and error recovery.

### NFR-006 — Maintainability

- The application must have clearly defined domain modules.
- API contracts and business rules must be documented.
- Database changes must be versioned through migrations.
- Automated tests must cover critical business rules.

### NFR-007 — Observability

- Errors must be logged with useful diagnostic context.
- Sensitive information must be redacted.
- Critical order, reservation, and payment transitions must be traceable.
- Operational health checks must be defined before deployment.

### NFR-008 — Backup and Recovery

The production plan must define database backup frequency, retention, recovery procedures, and acceptable recovery-point and recovery-time objectives before real restaurant operations begin.

## 8. MVP Exclusions

The initial MVP will not include:

- Public restaurant discovery.
- Delivery fleet management.
- Native mobile applications.
- Multi-restaurant subscription administration.
- Supplier procurement and purchase order automation.
- Advanced accounting or payroll.
- AI-based demand forecasting.
- Loyalty and marketing automation.
- Enterprise franchise controls.
- Deep third-party delivery marketplace integration.

These exclusions may be revisited only through an explicit scope review.

## 9. Acceptance Criteria

The MVP will not be considered complete until the following scenarios pass:

### AC-001 — Menu and Order

Given an available menu item, when a customer submits a valid order, then the server validates the item and calculates the correct total.

### AC-002 — Price Integrity

Given a client submits a manipulated item price or total, when the order is processed, then the server ignores the untrusted price and recalculates the amount from authoritative data.

### AC-003 — Duplicate Submission

Given an order submission is retried with the same idempotency key, when the request is processed, then the system returns the original logical result without creating a duplicate order.

### AC-004 — Kitchen Visibility

Given an accepted order contains preparation-required items, when the transaction commits, then the appropriate kitchen ticket becomes available to authorized kitchen staff.

### AC-005 — Live Update Recovery

Given a staff device disconnects temporarily, when it reconnects, then it can retrieve the latest persisted order and kitchen status.

### AC-006 — Reservation Conflict

Given a table has a confirmed reservation, when another customer attempts to book the same table for an overlapping interval, then the system prevents a conflicting confirmation.

### AC-007 — Reservation Hold Expiry

Given a temporary reservation hold expires, when the expiry policy is applied, then the held capacity can become available again unless another valid constraint blocks it.

### AC-008 — Payment Failure

Given an online payment fails, when the provider reports the failure, then the system does not mark the payment successful or the bill fully settled.

### AC-009 — Duplicate Payment Event

Given the payment provider sends the same valid event more than once, when the events are processed, then the payment is recorded only once.

### AC-010 — Inventory Reconciliation

Given a configured recipe and a valid stock balance, when an eligible order reaches the defined deduction point, then the expected ingredient stock movement is recorded exactly once.

### AC-011 — Role Enforcement

Given a user lacks permission for an operation, when they call the protected API directly, then the server denies the operation.

### AC-012 — Audit History

Given a permitted user performs a sensitive operational action, when the action succeeds, then the required audit information is recorded.

## 10. Product Metrics

The following metrics should be measured during testing and pilot evaluation:

- Order submission success rate.
- Duplicate-order rate.
- Order acceptance latency.
- Time from submission to kitchen visibility.
- Order modification and cancellation frequency.
- Reservation conflict count.
- Reservation no-show rate.
- Payment reconciliation discrepancy count.
- Ingredient stock variance.
- Staff task completion rate.
- User-reported workflow friction.
- Pilot conversion and willingness to pay.

Targets for business outcomes must be established after baseline measurement rather than invented in advance.

## 11. Dependencies

The product depends on:

- A PostgreSQL database.
- A selected OTP provider or test-mode verification mechanism.
- A selected online payment provider and its documented integration.
- A hosting and deployment environment.
- A reliable way to publish and validate table-specific QR links.
- Defined restaurant operating policies.
- Verified tax and invoicing requirements before production use.

## 12. Open Decisions

The following decisions must be resolved before detailed architecture and database design are finalized:

1. Exact order states and permitted transitions.
2. Relationship between tables, service sessions, orders, and bills.
3. Rules for combining multiple orders into one bill.
4. Pre-order confirmation, cancellation, and refund policies.
5. Reservation duration, table assignment, hold expiry, and deposit rules.
6. Payment provider selection and webhook verification.
7. Recipe quantities, units, wastage, and stock deduction timing.
8. Behaviour during internet outages and device failures.
9. Tax, discount, rounding, and invoice rules.
10. Kitchen routing and item-level readiness requirements.

## 13. Approval Criteria

This PRD can be approved when:

- Functional requirements have been reviewed.
- Business rules are sufficiently clear to support workflow design.
- MVP scope and exclusions are accepted.
- Non-functional requirements and measurable targets are agreed.
- Open decisions have owners and resolution plans.
- The acceptance criteria provide a testable definition of completion.

Approval of this PRD does not authorize implementation automatically. The user journeys, UX structure, architecture, database design, API contracts, security plan, testing strategy, and implementation roadmap must also be completed and reviewed.

---

**End of Document 02 — Product Requirements Document**