# Restaurant OS — Product Requirements Document (PRD)

**Document ID:** ROS-PRD-002
**Version:** 1.0
**Date:** 13 October 2026
**Status:** Draft
**Parent Document:** readme.md (Product Discovery)

---

## 1. Purpose

This document defines:
- What the system must do (functional requirements)
- Business rules
- Non-functional requirements (performance, security, etc.)
- Acceptance criteria
- MVP boundaries and constraints

This is the main reference for everything that follows: UX design, architecture, database, API, testing, and implementation.

> **Do not start implementation until this and all other planning docs are reviewed.**

---

## 2. What is Restaurant OS?

An integrated restaurant operations platform connecting customers, waiters, kitchen staff, cashiers, and administrators.

First version: one restaurant.
Future: multi-restaurant SaaS.

Supports:
- Full-service restaurants and cafés/QSRs
- Advance pre-orders
- QR-based at-table ordering
- Waiter-assisted ordering
- Table management and reservations
- Kitchen order management
- Billing and payments
- Basic ingredient inventory

---

## 3. Product Objectives

| ID | Objective |
|---|---|
| OBJ-01 | Keep consistent order, table, kitchen, billing, and inventory records |
| OBJ-02 | Prevent duplicate orders; preserve item quantities, prices, and order history |
| OBJ-03 | Let kitchen staff see and update incoming orders |
| OBJ-04 | Prevent conflicting reservations; communicate status clearly |
| OBJ-05 | Distinguish payment initiation, confirmation, failure, refund, and settlement |
| OBJ-06 | Track ingredient stock and recipe-based consumption |
| OBJ-07 | Keep restaurant data separated so multi-tenant SaaS can be built later |

---

## 4. User Roles and Permissions

### 4.1 Customer

A customer can:
- Browse published menu
- View item prices and availability
- Select items, quantities, and permitted modifiers
- Place a pre-order
- Place an at-table order via a valid QR link
- Request a reservation (with phone verification)
- View their own order and reservation status
- View bills and payment status
- Cancel/modify an order only when policy allows

### 4.2 Waiter

A waiter can:
- View authorized table information
- Create orders for seated customers
- Add items and permitted modifications
- Submit orders to kitchen
- View order and preparation status
- Request bill generation
- Mark permitted service actions as complete

### 4.3 Kitchen Staff

Kitchen staff can:
- View incoming kitchen tickets
- View item quantities and prep instructions
- Accept tickets
- Update preparation status
- Mark items as ready
- See cancelled, modified, or delayed items
- Access only kitchen-relevant information

### 4.4 Cashier

A cashier can:
- Review eligible orders and bills
- Generate or finalize bills per policy
- Record cash payments
- View verified online payment status
- Process permitted refunds
- Review outstanding balances

### 4.5 Restaurant Administrator

An administrator can:
- Manage menu categories and items
- Manage prices, modifiers, and availability
- Manage tables and QR links
- Manage staff accounts and permissions
- Configure restaurant hours and ordering policies
- Configure reservations and deposit policies
- Manage inventory items and recipes
- Review orders, reservations, payments, stock movements, and audit records

### 4.6 Authorization Rules

- Users must authenticate before accessing protected staff functions
- Permissions must be checked on the server (not just the frontend)
- Customers cannot access another customer's private information
- Kitchen staff cannot change payment records
- Cashiers cannot modify inventory or staff permissions by default
- Refunds, discounts, and stock adjustments must be permission-controlled
- All access is restricted to the user's authorized restaurant

---

## 5. Functional Requirements

**Priority levels:**
- **P0** = Required for MVP
- **P1** = Important but can follow first release
- **P2** = Deferred

---

### 5.1 Authentication and Staff Management

| ID | Priority | Requirement |
|---|---|---|
| AUTH-001 | P0 | System must authenticate authorized staff |
| AUTH-002 | P0 | System must enforce role-based access control |
| AUTH-003 | P0 | Admins can create, disable, and manage staff accounts |
| AUTH-004 | P0 | Disabled accounts cannot initiate new protected operations |
| AUTH-005 | P0 | Sensitive admin actions must be recorded in an audit trail |
| AUTH-006 | P1 | Staff password reset and account recovery |

### 5.2 Restaurant Configuration

| ID | Priority | Requirement |
|---|---|---|
| REST-001 | P0 | System maintains restaurant name, contact, address, timezone, currency, hours |
| REST-002 | P0 | Consistent currency used everywhere (menu, orders, bills, payments) |
| REST-003 | P0 | Admins can configure ordering availability and service policies |
| REST-004 | P1 | Configurable service charges, discounts, and tax rules |
| REST-005 | P1 | Configurable prep estimates and service windows |

### 5.3 Menu Management

| ID | Priority | Requirement |
|---|---|---|
| MENU-001 | P0 | Admins can create, edit, publish, and deactivate menu categories |
| MENU-002 | P0 | Admins can create and edit items with names, descriptions, prices, availability |
| MENU-003 | P0 | Menu items support configurable modifiers |
| MENU-004 | P0 | Customers only see published items available in their context |
| MENU-005 | P0 | Server validates item availability, quantities, and modifiers when accepting an order |
| MENU-006 | P0 | Server calculates order prices using menu data (not client-submitted totals) |
| MENU-007 | P0 | Orders preserve historical item names, prices, quantities, and modifiers even if menu changes |
| MENU-008 | P0 | Admins can mark items unavailable without deleting past order records |
| MENU-009 | P1 | Menu items support prep station and recipe associations |

### 5.4 Table Management

| ID | Priority | Requirement |
|---|---|---|
| TABLE-001 | P0 | Admins can create, edit, deactivate, and identify tables |
| TABLE-002 | P0 | Each active table has a unique identifier within the restaurant |
| TABLE-003 | P0 | System tracks table capacity and status |
| TABLE-004 | P0 | Admins can generate a table-specific QR link |
| TABLE-005 | P0 | Backend validates table identity and restaurant ownership for QR orders |
| TABLE-006 | P0 | QR links do not grant admin or staff privileges |
| TABLE-007 | P0 | Authorized staff can view table occupancy and service status |
| TABLE-008 | P1 | Support for combining/joining tables under staff permissions |

### 5.5 Advance Pre-Ordering

| ID | Priority | Requirement |
|---|---|---|
| PRE-001 | P0 | Customers can browse the menu and create a pre-order for an eligible future time |
| PRE-002 | P0 | System validates operating hours, ordering cutoffs, item availability, and lead time |
| PRE-003 | P0 | Customer receives an order reference and confirmation state |
| PRE-004 | P0 | System distinguishes "submitted" from "confirmed/accepted" |
| PRE-005 | P0 | Customers can view the current status of their pre-orders |
| PRE-006 | P0 | Cancellation and modification follow configured policy and preparation state |
| PRE-007 | P1 | Configurable prep capacity and limits per time slot |

### 5.6 QR-Based At-Table Ordering

| ID | Priority | Requirement |
|---|---|---|
| QR-001 | P0 | Customers can open a table-specific menu through a QR link |
| QR-002 | P0 | Customers can create an order using permitted menu items and modifiers |
| QR-003 | P0 | Accepted table order is associated with the correct restaurant and table |
| QR-004 | P0 | Customer cannot change the table by submitting an arbitrary table ID |
| QR-005 | P0 | Repeated submission with same idempotency key does not create duplicate orders |
| QR-006 | P0 | Customer receives clear confirmation when order is accepted or rejected |
| QR-007 | P0 | Multiple orders can be associated with the same active table session |
| QR-008 | P1 | Customers can request staff assistance through the ordering interface |

### 5.7 Waiter-Assisted Ordering

| ID | Priority | Requirement |
|---|---|---|
| WAITER-001 | P0 | Authorized waiters can create an order for a valid table or pre-order context |
| WAITER-002 | P0 | Waiter orders use the same validation and pricing rules as QR orders |
| WAITER-003 | P0 | Waiters can record permitted modifiers and special instructions |
| WAITER-004 | P0 | Waiters can view order and kitchen status |
| WAITER-005 | P0 | Waiters cannot bypass payment, pricing, or authorization rules |

### 5.8 Kitchen Order Management

| ID | Priority | Requirement |
|---|---|---|
| KITCHEN-001 | P0 | Accepted orders generate kitchen work records (tickets) for prep-required items |
| KITCHEN-002 | P0 | Authorized kitchen staff can view new tickets |
| KITCHEN-003 | P0 | Tickets include item quantities, modifiers, special instructions, and order reference |
| KITCHEN-004 | P0 | System supports defined prep states: Queued → Accepted → Preparing → Ready |
| KITCHEN-005 | P0 | Status changes and timestamps are recorded |
| KITCHEN-006 | P0 | Cancelled or modified items are clearly communicated to kitchen |
| KITCHEN-007 | P0 | A connection failure does not permanently prevent staff from seeing the latest ticket status |
| KITCHEN-008 | P1 | Separate prep stations for different item categories |
| KITCHEN-009 | P1 | Item-level readiness when one order has dishes finishing at different times |

### 5.9 Reservations

| ID | Priority | Requirement |
|---|---|---|
| RES-001 | P0 | Customers can request a reservation with date, time, party size, and phone number |
| RES-002 | P0 | Phone number is verified via OTP |
| RES-003 | P0 | System validates restaurant hours, table capacity, duration, and booking restrictions |
| RES-004 | P0 | System prevents conflicting confirmed reservations for the same table and overlapping time |
| RES-005 | P0 | Reservation states: pending verification → pending confirmation → confirmed → cancelled / completed / no-show |
| RES-006 | P0 | Configurable reservation deposit policies |
| RES-007 | P0 | A deposit-required reservation is not confirmed until deposit conditions are met |
| RES-008 | P0 | System defines how holds expire and how capacity is released |
| RES-009 | P0 | Customer receives a reservation reference and current status |
| RES-010 | P0 | Staff can check in guests and record cancellation or no-show outcomes |
| RES-011 | P1 | Waitlists and configurable grace periods |

### 5.10 Billing and Payments

| ID | Priority | Requirement |
|---|---|---|
| PAY-001 | P0 | Bill totals are calculated on the server |
| PAY-002 | P0 | System distinguishes order status, bill status, and payment status |
| PAY-003 | P0 | System supports recording cash payments |
| PAY-004 | P0 | System supports online payment initiation via a selected payment provider |
| PAY-005 | P0 | A payment is not marked successful just because the customer returns to a success page |
| PAY-006 | P0 | Payment confirmations are verified using the provider's documented mechanism |
| PAY-007 | P0 | Duplicate payment callbacks or webhooks do not duplicate financial records |
| PAY-008 | P0 | System distinguishes: pending, successful, failed, refunded payment states |
| PAY-009 | P0 | An order cannot be marked fully settled while an outstanding balance remains |
| PAY-010 | P0 | Payment and refund history is preserved |
| PAY-011 | P0 | Authorized staff can generate a bill for eligible orders |
| PAY-012 | P1 | Split payments and configurable discounts |
| PAY-013 | P1 | Itemized bills with tax info |
| PAY-014 | P1 | Payment reconciliation reports |

### 5.11 Basic Inventory

| ID | Priority | Requirement |
|---|---|---|
| INV-001 | P0 | Admins can create and manage ingredient records |
| INV-002 | P0 | Inventory records define a consistent unit of measurement |
| INV-003 | P0 | Admins can associate menu items with ingredient recipes |
| INV-004 | P0 | System records stock receipts and authorized stock adjustments |
| INV-005 | P0 | System calculates recipe-based ingredient consumption per approved deduction policy |
| INV-006 | P0 | Inventory changes are recorded as traceable stock movements |
| INV-007 | P0 | System defines how cancelled, refunded, modified, and wasted items affect inventory |
| INV-008 | P0 | System defines how unavailable ingredients affect dependent menu items |
| INV-009 | P1 | Configurable low-stock alerts |
| INV-010 | P1 | Inventory reconciliation against physical counts |

### 5.12 Reporting and Audit

| ID | Priority | Requirement |
|---|---|---|
| AUDIT-001 | P0 | System maintains auditable history of sensitive operational actions |
| AUDIT-002 | P0 | Audit records include: actor, action, affected record, timestamp |
| AUDIT-003 | P0 | Users cannot modify protected audit history through normal app functions |
| AUDIT-004 | P1 | Admins can view sales, order status, payment reconciliation, and basic inventory reports |

---

## 6. Business Rules

| Rule | Description |
|---|---|
| BR-001 Order Pricing | All accepted orders use server-calculated prices. Orders preserve an immutable snapshot of item names, unit prices, modifiers, quantities, discounts, and tax values. |
| BR-002 Order State | Orders follow explicitly defined valid state transitions. An order is not "accepted" just because it was submitted. |
| BR-003 Idempotency | Same logical submission must not create multiple orders when a client retries after a timeout. |
| BR-004 Table Occupancy | A table cannot be marked available while it has an active service session, unless an authorized workflow explicitly resolves it. |
| BR-005 Reservation Concurrency | Reservation availability checks and confirmation must be protected against concurrent requests. Expired holds must release availability. |
| BR-006 Kitchen State | Kitchen state and order state must stay consistent. Item-level states are used where needed. |
| BR-007 Payment State | Order being prepared ≠ paid. Successful payment ≠ all food served. |
| BR-008 Payment Reconciliation | Financial state changes come from verified provider events or authorized manual cash records. Duplicate events must not duplicate payment amounts. |
| BR-009 Inventory Movement | Stock deductions and reversals must be traceable. Historical stock movements cannot be silently rewritten. |
| BR-010 Role Enforcement | Every protected operation must be authorized by the backend, regardless of which screen initiated it. |
| BR-011 Historical Records | Menu changes must not rewrite historical order records or past bill calculations. |
| BR-012 Restaurant Isolation | All operational records must be associated with their owning restaurant, even in single-restaurant mode. |

---

## 7. Non-Functional Requirements

### NFR-001 — Performance
Under the agreed MVP load-test profile:
- Typical read API requests: p95 below 500ms
- Order submission: p95 below 1 second (excluding payment provider delays)
- Kitchen status changes visible to connected clients within 2 seconds

### NFR-002 — Reliability
- Order creation uses database transactions where multiple records must succeed together
- Failed operations do not leave partially committed records
- System recovers latest persisted state after a client reconnects
- Retried operations follow idempotency rules

### NFR-003 — Security
- Auth and authorization enforced server-side
- Passwords hashed with an appropriate algorithm
- Secrets not committed to source control
- Inputs validated at trust boundaries
- Sensitive data not exposed through logs or unauthorized API responses
- Admin actions are permission-controlled and auditable

### NFR-004 — Data Integrity
- Critical relationships enforced using database constraints
- Monetary values use decimal or integer-minor-unit (not floating-point)
- Reservation and payment transitions consistent under concurrent requests
- Historical financial records remain auditable

### NFR-005 — Accessibility and Usability
- Customer interfaces work on common mobile browsers
- Staff interfaces work on desktop and tablet
- Critical status info must not rely on color alone
- Core forms provide clear validation messages

### NFR-006 — Maintainability
- Application has clearly defined domain modules
- API contracts and business rules are documented
- Database changes use version-controlled migrations
- Automated tests cover critical business rules

### NFR-007 — Observability
- Errors logged with useful diagnostic context
- Sensitive info redacted from logs
- Critical order, reservation, and payment transitions are traceable
- Operational health checks defined before deployment

### NFR-008 — Backup and Recovery
Production plan must define: backup frequency, retention, recovery procedures, and RPO/RTO before real operations begin.

---

## 8. What is NOT in the MVP

- Public restaurant discovery
- Delivery fleet management
- Native mobile applications
- Multi-restaurant subscription administration
- Supplier procurement / purchase order automation
- Advanced accounting or payroll
- AI-based demand forecasting
- Loyalty and marketing automation
- Enterprise franchise controls
- Deep third-party delivery marketplace integration

---

## 9. Acceptance Criteria

The MVP is not complete until all these scenarios pass:

| ID | Scenario | Condition |
|---|---|---|
| AC-001 | Menu and Order | Valid order → server validates item, calculates correct total |
| AC-002 | Price Integrity | Client submits manipulated price → server ignores it and recalculates from authoritative data |
| AC-003 | Duplicate Submission | Same idempotency key retry → returns original result, no duplicate order |
| AC-004 | Kitchen Visibility | Accepted order with prep items → kitchen ticket available to authorized staff |
| AC-005 | Live Update Recovery | Staff device disconnects then reconnects → retrieves latest persisted status |
| AC-006 | Reservation Conflict | Table has confirmed reservation → second booking for overlapping time is prevented |
| AC-007 | Hold Expiry | Temporary hold expires → capacity released per policy |
| AC-008 | Payment Failure | Online payment fails → system does not mark it successful or bill settled |
| AC-009 | Duplicate Payment | Same provider event delivered twice → payment recorded only once |
| AC-010 | Inventory Reconciliation | Valid stock balance + recipe + eligible order → stock movement recorded exactly once |
| AC-011 | Role Enforcement | User without permission calls protected API → server denies the operation |
| AC-012 | Audit History | Permitted user performs sensitive action → required audit info is recorded |

---

## 10. Product Metrics (Track During Testing/Pilot)

- Order submission success rate
- Duplicate-order rate
- Order acceptance latency
- Time from submission to kitchen visibility
- Order modification and cancellation frequency
- Reservation conflict count
- Reservation no-show rate
- Payment reconciliation discrepancies
- Ingredient stock variance
- Staff task completion rate
- User-reported workflow friction
- Pilot conversion and willingness to pay

> Targets should be set after baseline measurement, not invented in advance.

---

## 11. Dependencies

- PostgreSQL database
- An OTP provider or test-mode verification mechanism
- An online payment provider and its documented integration
- Hosting and deployment environment
- A way to publish and validate table-specific QR links
- Defined restaurant operating policies
- Verified tax and invoicing requirements before production

---

## 12. Open Decisions

Resolve these before architecture and database design:

1. Exact order states and permitted transitions
2. Relationship between tables, service sessions, orders, and bills
3. Rules for combining multiple orders into one bill
4. Pre-order confirmation, cancellation, and refund policies
5. Reservation duration, table assignment, hold expiry, and deposit rules
6. Payment provider selection and webhook verification
7. Recipe quantities, units, wastage, and stock deduction timing
8. Behavior during internet outages and device failures
9. Tax, discount, rounding, and invoice rules
10. Kitchen routing and item-level readiness requirements

---

## 13. Approval Criteria

This PRD can be approved when:
- Functional requirements have been reviewed
- Business rules are clear enough to support workflow design
- MVP scope and exclusions are accepted
- Non-functional requirements and measurable targets are agreed
- Open decisions have owners and resolution plans
- Acceptance criteria provide a testable definition of completion

> **Approval of this PRD does not authorize implementation.** User journeys, UX structure, architecture, database design, API contracts, security plan, testing strategy, and implementation roadmap must also be completed and reviewed.

---

**End of Document 02 — Product Requirements Document**